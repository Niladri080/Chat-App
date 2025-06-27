import React, { useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
  const [showProfile, setshowProfile] = useState(false);

  const getGridCols = () => {
    if (!selectedUser) return "md:grid-cols-2";
    if (showProfile)
      return "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]";
    return "md:grid-cols-[1fr_2fr]";
  };

  return (
    <div
      className="w-full h-screen sm:px-[15%] sm:py-[5%] bg-cover bg-center"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div
        className={`rounded-2xl border-2 border-gray-600 backdrop-blur-xl 
         overflow-hidden h-full relative 
         md:grid ${getGridCols()} 
         flex flex-col`}
      >
        {/* Mobile Layout */}
        <div className="flex flex-col md:hidden h-full">
          {!selectedUser && (
            <div className="h-full overflow-y-auto">
              <Sidebar setshowProfile={setshowProfile} />
            </div>
          )}

          {selectedUser && !showProfile && (
            <div className="h-full overflow-y-auto">
              <ChatContainer setshowProfile={setshowProfile} />
            </div>
          )}

          {selectedUser && showProfile && (
            <div className="h-full overflow-y-auto">
              <RightSidebar setshowProfile={setshowProfile} />
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:contents">
          <Sidebar setshowProfile={setshowProfile} />
          <ChatContainer setshowProfile={setshowProfile} />
          {showProfile && <RightSidebar setshowProfile={setshowProfile} />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
