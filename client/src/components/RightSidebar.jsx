import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = ({ setshowProfile }) => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div
      className={`absolute top-0 right-0 bottom-0 z-40 w-full h-full md:static md:w-auto 
      overflow-y-auto text-white bg-[#0f0f1c] md:bg-[#8185B2]/10 
      p-4 flex flex-col justify-between md:h-auto`}
    >
      {/* Close button for mobile */}
      <button
        onClick={() => setshowProfile(false)}
        className="absolute top-3 right-4 md:hidden text-white text-xl font-bold"
      >
        ✕
      </button>

      <div>
        {/* Profile section */}
        <div className="pt-12 md:pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt="profile"
            className="w-20 aspect-square rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
            {selectedUser.fullName}
          </h1>
          <p className="text-center text-gray-400">{selectedUser.bio}</p>
        </div>

        <hr className="border-[#ffffff30] my-4" />

        {/* Media section */}
        <div className="px-2 md:px-5 text-xs">
          <p className="text-gray-400 mb-2">Media</p>
          <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto">
            {msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer rounded"
              >
                <img src={url} alt="media" className="h-full w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="mt-4 md:mt-8 flex justify-center">
        <button
          onClick={logout}
          className="bg-gradient-to-r from-purple-400 to-violet-600 text-white 
          text-sm font-light py-2 px-10 rounded-full w-full max-w-xs"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
