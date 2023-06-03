from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Message, Conversation
import os
import openai

message_routes = Blueprint('messages', __name__)
openai.api_key = os.getenv("OPEN_AI_KEY")

@message_routes.route('')
@login_required
def messages():

    # Query for all messages and returns them in a list of message dictionaries

    messages = Message.query.all()
    return {'messages': [message.to_dict() for message in messages]}


@message_routes.route('/<int:id>')
@login_required
def message(id):

    # Query for a message by id and returns that message in a dictionary

    message = Message.query.get(id)
    return message.to_dict()


@message_routes.route('', methods=['POST'])
@login_required
def gpt3():
    try:
        # Retrieve message from user structured like so
        # {message: "message_content"}
        data = request.get_json()
        message_content = data['message']
        
        # Retrieve the conversation associated with the user, will need to change to filter by id later
        conversation = Conversation.query.filter_by(user_id=current_user.id).first()
        
        if not conversation:
            # If no conversation exists for the user, create a new one
            conversation = Conversation(user_id=current_user.id, title="Journal")
            db.session.add(conversation)
            db.session.commit()
        
        # response object generated by openai
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=message_content,
            max_tokens=100, # limits length of response based on tokens
            temperature=0.5, # dictates how deterministic 
        )
        # key into text to get response
        generated_message_content = response.choices[0].text
        
        # Create a new message instance associated with the conversatio
        new_message = Message(
            conversation_id=conversation.id,
            message=message_content,
            ai_response=generated_message_content
        )
        db.session.add(new_message)
        db.session.commit()
        
        return new_message.to_dict()
    
    except Exception as e:
        # Handle the exception and return an error response
        error_message = str(e)  # Get the error message as a string
        return {'error': error_message}, 500

