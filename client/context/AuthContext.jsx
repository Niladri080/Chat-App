import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const backendurl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendurl;
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setsocket] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  //Check user authentication
  const checkAuth = async () => {
    setIsAuthLoading(true);
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };
  //Login function
  const login = async (state, credentials) => {
    setIsLoggingIn(true);
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  //Logout function
  const logout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);
      axios.defaults.headers.common["token"] = null;
      toast.success("Logget out successfully");
      socket.disconnect();
    } finally {
      setIsLoggingOut(false);
    }
  };

  //Update Profile function
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Connect socket function
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendurl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setsocket(newSocket);
    newSocket.on("connect", () => {
      console.log(
        "[Socket] Connected as",
        userData._id,
        "Socket ID:",
        newSocket.id
      );
    });
    newSocket.on("disconnect", () => {
      console.log("[Socket] Disconnected", userData._id);
    });
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("[Socket] Online users:", userIds);
      setOnlineUsers(userIds);
    });
  };
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);
  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    isAuthLoading,
    isLoggingOut,
    isLoggingIn,
  };
  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/70">
          <div className="w-16 h-16 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-2xl font-semibold animate-pulse">
            Logging out...
          </p>
        </div>
      )}
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </>
  );
};
