import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { FaSpinner, FaCheck, FaCheckDouble } from "react-icons/fa";

const ChatContainer = ({ setshowProfile }) => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
    isMessagesLoading,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const scrollEnd = useRef();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Smooth scroll to bottom helper
  const smoothScrollToBottom = () => {
    const container = scrollEnd.current?.parentNode;
    if (!container) return;
    const target = scrollEnd.current.offsetTop;
    const start = container.scrollTop;
    const distance = target - start;
    const duration = 400; // ms
    let startTime = null;

    function animation(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      container.scrollTop = start + distance * progress;
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    }
    requestAnimationFrame(animation);
  };

  useEffect(() => {
    if (scrollEnd.current && messages) {
      smoothScrollToBottom();
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} alt="Logo" className="w-16" />
        <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white/10">
        <img
          src={assets.logo_icon}
          alt="Loading"
          className="w-16 animate-spin"
        />
        <p className="text-lg font-medium text-white mt-4 animate-pulse">
          Loading messages...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto relative backdrop-blur-lg">
      {/* Header */}
      <div
        className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500 cursor-pointer"
        onClick={() => setshowProfile(true)}
      >
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="User"
          className="w-12 h-12 aspect-square rounded-full object-cover object-center"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="Help" className="max-md:hidden w-5" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6 space-y-4">
        {messages.map((msg, index) => {
          const isMine = msg.senderId === authUser._id || msg.senderId === "me";
          const isSending = msg.sending;
          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMine ? "justify-end self-end" : "justify-start self-start"
              } ${isSending ? "opacity-50" : ""}`}
            >
              {!isMine && (
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt="Avatar"
                  className="w-7 h-7 aspect-square rounded-full object-cover object-center"
                />
              )}

              <div className="flex flex-col items-start max-w-xs relative">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="Sent"
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
                  />
                ) : (
                  <p
                    className={`p-2 text-sm font-light rounded-lg break-words text-white ${
                      isMine
                        ? "bg-violet-500/40 rounded-br-none"
                        : "bg-violet-500/30 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                {isMine && isSending && (
                  <span className="absolute -right-6 bottom-0 flex items-center gap-1 text-xs select-none">
                    <span className="text-violet-400">Sending</span>
                  </span>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>

              {isMine && (
                <img
                  src={authUser?.profilePic || assets.avatar_icon}
                  alt="Avatar"
                  className="w-7 h-7 aspect-square rounded-full object-cover object-center"
                />
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input Box */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="Gallery"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="Send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ChatContainer;
