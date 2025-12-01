

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar" ;
import ChatArea from "../components/ChatArea";
import axios from "axios";
import { io } from "socket.io-client";

const Home = () => {

  // LIGHT DARK THEME :-
  // Value of theme = t (t is returned)
  const [theme, setTheme] = useState(() => {
    const t = localStorage?.getItem("site-theme");
    return t || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  });


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null)


  // THEME INITIALISATION :-
  // You are adding a class (light or dark) to the <html> tag itself.
  // The dark class on <html> activates the .dark: styles for the entire entire page, every element inside.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);
    try {
      localStorage.setItem("site-theme", theme);
    } catch {}
    // USEEFFECT RENDER :-
    // Run this useEffect ONLY when theme changes. Do NOT run it on every render.
  }, [theme]);




  // FETCHING CHATS FROM MONGODB :-
  // This runs ONCE when component mounts (empty dependency array = run once)
  // It calls your backend API to get all chats from database
  useEffect(() => {
    fetchChatsFromDatabase();
    // Empty dependency array [] means run this ONLY on component mount
    // NOT every time chatHistory changes (that causes infinite loop!)


    // SOCKET CONNECTION & FETCHING :-
    const tempSocket = io("http://localhost:3000", {
      withCredentials: true,
    })

    // ✅ CORRECT - Handle AI response and add to messages
    tempSocket.on("ai-response", (data) => {
      console.log("Received AI response:", data);
      
      const aiMessage = {
        id: Date.now(),
        text: data.content,
        sender: "ai",
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    });

    // Handle errors from backend
    tempSocket.on("ai-error", (error) => {
      console.error("AI Error:", error.error);
      setIsLoading(false);
      alert("Error: " + error.error);
    });

    setSocket(tempSocket)

    // Cleanup on unmount
    return () => tempSocket.disconnect();
  }, []);




  // FUNCTION TO FETCH CHATS FROM BACKEND/MONGODB :-
  const fetchChatsFromDatabase = async () => {
    try {
      // AXIOS GET REQUEST :-
      // Calls your backend endpoint GET /api/chat
      // withCredentials: true sends JWT token in cookies
      const res = await axios.get("http://localhost:3000/api/chat", {
        withCredentials: true,
      });

      console.log("Fetched chats:", res.data.chats);
      
      // MAPPING MONGODB DATA TO FRONTEND FORMAT :-
      // MongoDB returns _id, but frontend uses id
      // So we transform: { _id, title } → { id, title }
      const formattedChats = res.data.chats.map((chat) => ({
        id: chat._id,                    // Rename _id to id
        title: chat.title,               // Keep title
        lastActivity: chat.lastActivity, // Keep lastActivity
      })).reverse();

      // SETTING CHAT HISTORY :-
      // Now chatHistory has data from MongoDB displayed as chats
      setChatHistory(formattedChats);

      // AUTO-CREATE CHAT IF NONE EXIST
      if (formattedChats.length === 0) {
        console.log("No chats found, creating default chat...");
        await createDefaultChat();
      } else {
        // ✅ SET FIRST CHAT AS ACTIVE BY DEFAULT
        setActiveChat(formattedChats[0].id);
      }

      setLoading(false);
    } catch (err) {
      console.error("Chat fetch error:", err);
      setLoading(false);
    }
  };




  // CREATE DEFAULT CHAT ON FIRST LOAD
  const createDefaultChat = async () => {
    try {
      // ✅ AUTO-CREATE without prompting
      const title = window.prompt("Enter title for chat : ");

      const response = await axios.post(
        "http://localhost:3000/api/chat",
        { title },
        { withCredentials: true }
      );
      console.log("Default chat created:", response.data);

      const newChat = {
        id: response.data.chat._id,
        title: response.data.chat.title,
        lastActivity: response.data.chat.lastActivity,
      };

      // ✅ ADD TO CHAT HISTORY AND SET AS ACTIVE
      setChatHistory([newChat]);
      setActiveChat(newChat.id);
      
      // ✅ NEW CHAT HAS NO MESSAGES YET - Keep empty, don't fetch
      setMessages([]);
    } catch (err) {
      console.error("Error creating default chat:", err);
    }
  };




  // SUBMIT BUTTON :-
  const handleSendMessage = async (input) => {
    // Validation: Check if chat is active
    if (!activeChat) {
      alert("Please create or select a chat first");
      return;
    }

    // Validation: Check if input is not empty
    if (!input.trim()) {
      alert("Please enter a message");
      return;
    }

    // Validation: Check if socket is connected
    if (!socket) {
      alert("Connection lost. Please refresh the page");
      return;
    }

    // Create user message object
    const userMessage = { 
      id: Date.now(), 
      text: input, 
      sender: "user" 
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Emit message to backend via Socket.IO
    // ✅ CORRECT - Use "message" not "content"
    socket.emit("ai-message", {
      chat: activeChat,
      message: input
    });

    // ✅ IMPORTANT: DO NOT add fake AI message here
    // The real AI response will come from the "ai-response" socket event listener in useEffect
    // That listener will handle adding the AI message and setting isLoading to false
  };



  
  // GET MESSAGES :-
  const getMessages = async (chatId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, { withCredentials: true })
      console.log("Fetched messages : ", response.data.messages)
      

      // STORING MSGS IN USE STATE :-
      // ✅ Format messages and set to state
      const formattedMessages = response.data.messages.map((msg) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.role === "user" ? "user" : "ai",
      }));
      
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };




  // CHAT SELECTION FROM CHAT HISTORY :-
  // ✅ FIXED - Fetch messages when selecting chat
  const handleSelectChat = (chat) => {
    setActiveChat(chat.id);
    // ✅ Fetch and set messages for this chat
    getMessages(chat.id);
    setSidebarOpen(false);
  };


  // DELETE CHAT :- (DELETES CHAT AND ALL ITS MESSAGES)
  // When user clicks delete icon on a chat
  const handleDeleteChat = async (chatId) => {
    // ✅ Confirmation dialog before deleting
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    try {
      // AXIOS DELETE REQUEST :-
      // Sends DELETE request to your backend: DELETE /api/chat/:chatId
      // withCredentials: true sends JWT token in cookies
      await axios.delete(`http://localhost:3000/api/chat/${chatId}`, {
        withCredentials: true
      });
      console.log("Chat deleted successfully");

      // REMOVE CHAT FROM UI :-
      // Filter out the deleted chat from chatHistory
      setChatHistory((prev) => prev.filter(chat => chat.id !== chatId));
      
      // ✅ If deleted chat was active, clear it and show empty state
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Failed to delete chat. Please try again.");
    }
  };


  // NEW CHAT BUTTON :- (INTEGRATED WITH BACKEND)
  // When user clicks "New Chat", this function runs
  const handleNewChat = async () => {
    try {
      // USER PROMPT :-
      // Ask user for chat title
      const title = window.prompt("Enter a title for the new chat:") || "Untitled chat";

      // AXIOS POST REQUEST :-
      // Sends POST request to your backend: POST /api/chat
      // Sends { title } in body
      // withCredentials: true sends JWT token in cookies
      // Auth middleware in backend checks if user is logged in before creating chat
      const response = await axios.post(
        "http://localhost:3000/api/chat",
        { title },
        { withCredentials: true }
      );
      console.log("New chat created:", response.data);

      // EXTRACTING RESPONSE DATA :-
      // Backend returns: { message, chat: { _id, title, lastActivity, user } }
      // We extract chat data and transform it
      const newChat = {
        id: response.data.chat._id,              // MongoDB _id becomes id
        title: response.data.chat.title,         // Title from response
        lastActivity: response.data.chat.lastActivity,
      };

      // ADD NEW CHAT TO BEGINNING OF CHAT HISTORY :-
      // [newChat, ...prev] means put new chat first, then all old chats
      setChatHistory((prev) => [newChat, ...prev]);
      
      // Set this as the active chat
      setActiveChat(newChat.id);
      
      // ✅ NEW CHAT HAS NO MESSAGES YET - Keep empty, don't fetch
      setMessages([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Failed to create chat. Please try again.");
    }
  };


  // CHANGE THEME BTN :-
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };


  // SHOW LOADING SCREEN WHILE FETCHING CHATS :-
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading chats...</p>
      </div>
    );
  }



  
  // RENDERING SIDEBAR (LEFT) & CHATAREA (RIGHT) ON SCREEN :-
  return (
    <div className={theme}>
      {/* 
        MAIN CONTAINER :-
        h-screen = full screen height
        flex = display sidebar and chatarea side by side
        overflow-hidden = prevents scrolling on main container
      */}
      <div className="h-screen flex overflow-hidden">
        {/* 
          PROPS 
          We are passing props and they dont need const or let for intialisation, they are simply attributes of Sidebar
        */}
        <Sidebar
          isOpen={sidebarOpen}
          chatHistory={chatHistory} // Chats fetched from MongoDB
          activeChat={activeChat}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat} // ✅ Pass delete handler to Sidebar
          theme={theme}
          onThemeToggle={toggleTheme}
          setSidebarOpen={setSidebarOpen}
        />
        {/* 
          CHATAREA :-
          flex-1 = takes remaining space after sidebar
          flex flex-col = stacks header, messages, input vertically
        */}
        <ChatArea
          theme={theme}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>
    </div>
  );
};

export default Home;




/*
SOCKET.IO CLIENT SIDE SETUP :-

> Socket.io docs
> Client
> Installation    > npm > npm install socket.io-client

> Initialisation  > ES modules (because we are using 'import' and not 'require') 
> Home.jsx > import { io } from "socket.io-client";
> Home.jsx > const socket = io("https://server-domain.com"); NOT THIS
           > const ["socket", "setSocket"] = useState(io.("http://localhost:3000")) THIS

> CORS : Removing cors error from socket.io backend
> const io = new Server(httpServer, {
    cors: {
      origin: "*",
      allowedHeaders: ["content-Type", "Authorization"],
      credentials: true
    }
  })

> Socket connection cookies: C <[Object: null prototype] {}> {}
  This wil be printed after connected to MongoDB, if Socket.io client socket.io backend is conected

> Refer Stack Overflow and Socket.io for some errors like cors
*/




/*
POSTMAN & FRONTEND TERMS CONFUSION SOLVED :-

In Postman you were sending:
json{
    "chat": "6926d1120877e2c4212e933d",
    "content": "Paaji"
}

So messagePayload.content worked fine in Postman testing!
But in React frontend you were sending:

javascriptsocket.emit("ai-message", {
  chat: activeChat,
  content: input  // ❌ Changed to "message" later
})

Wait, actually you changed it to:
javascriptsocket.emit("ai-message", {
  chat: activeChat,
  message: input  // ✅ Now "message" not "content"
})
*/