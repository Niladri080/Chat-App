import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios } = useContext(AuthContext);

  // Get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.user); // FIXED key name
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const subscribetoMessages= async()=>{
  if (!socket){
    return;
  }
  socket.on("newMessage",(newMessage)=>{
    if (selectedUser && newMessage.senderId === selectedUser._id){
      newMessage.seen=true;
      setMessages((prevMessage)=>[...prevMessage,newMessage])
      axios.put(`/api/messages/mark/${newMessage._id}`);
    }
    else{
      setUnseenMessages((prev)=>({
...prev,[newMessage.senderId] : prev[newMessage.senderId] ? prev[newMessage.senderId]+1:1
      }))
    }
  })
}
//Function to unsubscribe
const unsubscribefrommessages= ()=>{
  if (socket) socket.off("newMessage");
}
 useEffect(()=>{
  subscribetoMessages();
  return ()=>unsubscribefrommessages();
 },[socket,selectedUser])
  const value = {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    setMessages,
    unseenMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    socket,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
