import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getConversations,
  updateConversation,
  deleteConversation,
  postConversation,
} from "../../store/conversation";
import { getMessages, deleteMessages, postMessage } from "../../store/message";
import "./Conversation.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faEye,
  faEyeSlash,
  faComments,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function Conversation() {
  const conversationsObj = useSelector((state) => state.conversationReducer);
  const conversationsArr = Object.values(conversationsObj);
  //   testing
  const messagesObj = useSelector((state) => state.messageReducer);
  const messages = Object.values(messagesObj);
  const dispatch = useDispatch();
  const [display, setDisplay] = useState(false);
  const [show, setShow] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [messageToPost, setMessageToPost] = useState("");
  const [id, setId] = useState(null);
  const bottomOfConversation = useRef(null);
  const topOfConversation = useRef(null);
  const dropdownRef = useRef();
  const conversation = conversationsObj[id];
  // const [messages, setMessages] = useState(null);

  const handleEditClick = () => {
    setEditMode(true);
    setNewTitle(title);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleUpdateClick = () => {
    conversation.title = newTitle;
    const updatedConversation = { ...conversation, title: newTitle };
    dispatch(updateConversation(updatedConversation));
  };

  const handleTitleBlur = () => {
    if (title !== newTitle) {
      setTitle(newTitle);
      handleUpdateClick();
    }
    setEditMode(false);
  };

  const handleConversationShowClick = () => {
    setShow(!show);
    setDisplay(!display);
  };

  const handleDeleteConversationClick = () => {
    if (id) {
      dispatch(deleteConversation(id));
      dispatch(getConversations());
    }
  };

  const handleSendQueryClick = () => {
    if (messageToPost === "" || id === null) {
      return;
    }
    const conversation = {
      conversation_id: id,
      message: messageToPost,
    };
    dispatch(postMessage(conversation));
  };

  const handleMessageToPost = (e) => {
    setMessageToPost(e.target.value);
  };

  const handleCreateConversation = () => {
    const newConversation = {
      "title": "New Conversation"
    }
    dispatch(postConversation(newConversation))
  }


  const handleScrollToBottom = () => {
    bottomOfConversation.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  const handleScrollToTop = () => {
    topOfConversation.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  const handleIconClick = (e) => {
    // click event was propagating to document, preventing dropdown from opening
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleSetConversationClick = (conversation) => {
    setId(conversation.id);
    setShowDropdown(false);
    console.log(conversation);
    dispatch(getMessages(conversation.id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // if DOM element rendered && event.target(click) is not contained in DOM element setShow(false)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    dispatch(getConversations());
    if (id) {
      dispatch(getMessages(id));

    }
  }, [dispatch, id]);

  useEffect(() => {
    if (conversation) {
      setTitle(conversation.title);
    }
    if(!conversation) {
      setTitle("")
    }
  }, [conversation]);

  return (
    <div className="conversation-container">
      <div
        ref={topOfConversation}
        className="length-100 conversation-button-container"
      >
        <button onClick={handleScrollToBottom}>⇩</button>
        {show ? (
          <>
            <button onClick={handleConversationShowClick}>
              <FontAwesomeIcon icon={faEyeSlash} />
            </button>
            <button onClick={handleIconClick}>
              <FontAwesomeIcon icon={faComments} className="nav-icon" />
            </button>
            {!showDropdown ? (
              ""
            ) : conversationsArr ? (
              <div className="conversations-dropdown" ref={dropdownRef}>
                {conversationsArr.map((conversation) => {
                  return (
                    <div
                      className="conversations-options"
                      key={`conversation ${conversation.id}`}
                    >
                      <div
                        onClick={(e) =>
                          handleSetConversationClick(conversation)
                        }
                      >
                        {conversation && conversation.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              ""
            )}
            <button>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button onClick={handleDeleteConversationClick}>
              Delete Conversation
            </button>
          </>
        ) : (
          <>
            <button onClick={handleConversationShowClick}>
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button onClick={handleIconClick}>
              <FontAwesomeIcon icon={faComments} className="nav-icon" />
            </button>
            <button onClick={handleCreateConversation}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            {!showDropdown ? (
              ""
            ) : conversationsArr ? (
              <div className="conversations-dropdown" ref={dropdownRef}>
                {conversationsArr.map((conversation) => {
                  return (
                    <div
                      className="conversations-options"
                      key={`conversation ${conversation.id}`}
                    >
                      <div
                        onClick={(e) =>
                          handleSetConversationClick(conversation)
                        }
                      >
                        { conversation && conversation.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              ""
            )}
          </>
        )}
        {!display && <button onClick={handleSendQueryClick}>Send Query</button>}
      </div>
      {editMode ? (
        <div className="title-active-edit">
          <input
            type="text"
            maxLength="40"
            value={newTitle}
            onBlur={handleTitleBlur}
            onChange={handleTitleChange}
            autoFocus
          />
        </div>
      ) : id ? (
        <div className="title-inactive-edit">
          <span title="conversation title">
            <h4>{title}</h4>
          </span>
          <FontAwesomeIcon
            icon={faPen}
            onClick={handleEditClick}
            className="edit-icon"
          />
        </div>
      ) : (
        <div className="flex-column-center">Create/Choose Conversation</div>
      )}

      <div className="conversation-container">
        {display && (
          <div>
            {messages && conversation && 
              messages.map((message) => (
                <div key={message.id} className="message-container">
                  <div className="user-message">{message.message}</div>
                  <div className="ai-message">{message.ai_response}</div>
                </div>
              ))}
          </div>
        )}

        {!display && id && (
          <div className="message-textarea-container">
            <textarea
              id="message-textarea"
              onChange={handleMessageToPost}
              placeholder="Write a question here, then send query..."
            ></textarea>
            <div className="scroll-top-button">
              <button onClick={handleScrollToTop} ref={bottomOfConversation}>
                ⇧
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
