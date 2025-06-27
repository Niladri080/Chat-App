import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const { socket, axios } = useContext(AuthContext);

  // Get all users for sidebar
  const getUsers = async () => {
    setIsUsersLoading(true);
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.user); // FIXED key name
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Get messages for selected user
  const getMessages = async (userId) => {
    setIsMessagesLoading(true);
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  // Send message to selected user (optimistic UI)
  const sendMessage = async (messageData) => {
    const tempId = uuidv4();
    const optimisticMessage = {
      _id: tempId,
      senderId: axios.defaults.headers.common["token-user-id"] || "me",
      receiverId: selectedUser._id,
      text: messageData.text || "",
      image: messageData.image || "",
      createdAt: new Date().toISOString(),
      sending: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? { ...data.newMessage } : msg))
        );
      } else {
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        toast.error(data.message);
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      toast.error(error.message);
    }
  };

  const subscribetoMessages = async () => {
    if (!socket) {
      return;
    }
    socket.on("newMessage", (newMessage) => {
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        setMessages((prevMessage) => {
          if (prevMessage.some((msg) => msg._id === newMessage._id))
            return prevMessage;
          return [...prevMessage, newMessage];
        });
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };
  //Function to unsubscribe
  const unsubscribefrommessages = () => {
    if (socket) socket.off("newMessage");
  };
  useEffect(() => {
    subscribetoMessages();
    return () => unsubscribefrommessages();
  }, [socket, selectedUser]);
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
    isMessagesLoading,
    isUsersLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
