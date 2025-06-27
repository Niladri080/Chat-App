import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const RightSidebar = ({ setshowProfile }) => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers, isLoggingOut } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div
      className={`absolute top-0 right-0 bottom-0 z-40 w-full h-full md:static md:w-auto 
      overflow-y-auto text-white bg-[#0f0f1c] md:bg-[#8185B2]/10 
      p-4 flex flex-col justify-between md:h-auto relative`}
    >
      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
          <img
            src={assets.logo_icon}
            alt="Logging out"
            className="w-16 animate-spin mb-4"
          />
          <p className="text-white text-2xl font-semibold animate-pulse">
            Logging out...
          </p>
        </div>
      )}

      {/* Collapse button (always visible) */}
      <button
        onClick={() => setshowProfile(false)}
        className="absolute top-3 right-4 text-white text-xl font-bold bg-black/30 hover:bg-black/60 rounded-full p-2 z-50 flex items-center justify-center"
        title="Close"
      >
        {/* Use a chevron/arrow icon if available, else fallback to × */}
        {assets.arrow_icon ? (
          <img
            src={assets.arrow_icon}
            alt="Collapse"
            className="w-5 h-5 rotate-180"
          />
        ) : (
          <span>&times;</span>
        )}
      </button>

      <div>
        {/* Profile section */}
        <div className="pt-12 md:pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt="profile"
            className="w-20 aspect-square rounded-full object-cover object-center cursor-pointer"
            onClick={() => {
              if (selectedUser?.profilePic) {
                setShowProfileModal(true);
              } else {
                toast.error("User doesn't have profile picture");
              }
            }}
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
                <img
                  src={url}
                  alt="media"
                  className="h-full w-full rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="mt-4 md:mt-8 flex justify-center">
        <button
          onClick={() => {
            if (!isLoggingOut) logout();
          }}
          className="bg-gradient-to-r from-purple-400 to-violet-600 text-white 
          text-sm font-light py-2 px-10 rounded-full w-full max-w-xs cursor-pointer"
          disabled={isLoggingOut}
        >
          Logout
        </button>
      </div>

      {/* Profile Image Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowProfileModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedUser.profilePic}
              alt="Profile Large"
              className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl border-4 border-white"
            />
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-black text-xl font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
