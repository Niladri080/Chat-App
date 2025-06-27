import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = ({ setshowProfile }) => {
  const {
    getUsers,
    users,
    unseenMessages,
    selectedUser,
    setSelectedUser,
    setUnseenMessages,
    isUsersLoading,
  } = useContext(ChatContext);
  const { logout, onlineUsers, isLoggingOut } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      } relative`}
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

      {/* Top: Logo and Menu */}
      <div className="pb-5">
        <div className="flex justify-between items-center relative">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* Menu icon (3-dot) */}
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 w-36 p-4 rounded-md bg-[#282142] border border-gray-600 text-gray-100 shadow-lg">
              <p
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="cursor-pointer text-sm hover:text-violet-400"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p
                onClick={() => {
                  if (!isLoggingOut) {
                    logout();
                    setMenuOpen(false);
                  }
                }}
                className="cursor-pointer text-sm hover:text-red-400"
              >
                Logout
              </p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* User List */}
      {isUsersLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <img
            src={assets.logo_icon}
            alt="Loading users"
            className="w-12 animate-spin"
          />
          <p className="text-white mt-2 animate-pulse">Loading users...</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                setshowProfile(false); // Reset profile view when selecting a user
              }}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
                selectedUser?._id === user._id ? "bg-[#282142]/50" : ""
              }`}
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                alt=""
                className="w-[35px] aspect-[1/1] rounded-full object-cover object-center"
              />
              <div className="flex flex-col leading-5">
                <p>{user.fullName}</p>
                <span
                  className={`text-xs ${
                    onlineUsers.includes(user._id)
                      ? "text-green-400"
                      : "text-neutral-400"
                  }`}
                >
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </span>
              </div>

              {unseenMessages[user._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
