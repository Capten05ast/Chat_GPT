

import React, { useState, useRef, useEffect } from "react";
import { Send, Menu, X, LogOut } from "lucide-react";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";


const ChatArea = ({
  // ATTRIBUTES = PROPS :- 
  theme,
  messages,
  isLoading,
  onSendMessage,
  sidebarOpen,
  setSidebarOpen,
}) => {


  // USER MESSAGE :-
  const [input, setInput] = useState("");
  
  // ✅ CHECK IF USER IS LOGGED IN
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  // ✅ CHECK LOGIN STATUS ON MOUNT
  useEffect(() => {
    // Check if user is logged in by checking for token in cookies or localStorage
    const token = localStorage.getItem("token") || getCookie("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);


  // ✅ HELPER FUNCTION TO GET COOKIE VALUE
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };


  // SMOOTH SCROLLING :-
  // Smooth scrolling when messages exceed the height of the screen 
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // SEND MESSAGE :-
  const handleSendMessage = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };


  // ENTER KEY :-
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Clear cookies (if token is stored in cookies)
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  return (
    // MAIN CHATAREA CONTAINER :-
    // flex-1 = takes remaining space after sidebar
    // flex flex-col = stacks header, messages, input vertically
    // h-screen = full screen height (prevents overflow)
    <div className="flex-1 flex flex-col h-screen bg-white dark:bg-gray-950">
      
      {/* HEADER - FIXED AT TOP */}
      {/* flex-shrink-0 = header doesn't shrink, stays at fixed height */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        

        {/* THIS BTN ONLY FOR MOBILE */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all dark:text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* HEADER TITLE */}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          🎓 ChatGPT Clown
        </h1>

        {/* ✅ LOGIN/LOGOUT BUTTON */}
        <div className="w-10 lg:flex lg:items-center lg:mr-12 gap-2">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => window.location.href = "/login"}
              className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all"
              title="Login"
            >
              <span>Login</span>
            </button>
          )}
        </div>
      </div>


      {/* DISPLAY MSGS - SCROLLABLE IN MIDDLE */}
      {/* flex-1 = takes remaining space between header and input */}
      {/* overflow-y-auto = scrolls when messages exceed height */}
      {/* scrollbar-hide = hides scrollbar but allows scrolling */}
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:py-8 max-w-4xl mx-auto w-full scrollbar-hide">
        
        {/* MSGS = 0 - WELCOME SCREEN */}
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 dark:text-white">🎓 ChatGPT</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                How can I help you today?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="bg-gray-300 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all text-left">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    💡 Explain concepts
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get a clear explanation of a concept
                  </p>
                </div>
                <div className="bg-gray-300 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all text-left">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    ✍️ Write code
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Write and debug code in any language
                  </p>
                </div>
                <div className="bg-gray-300 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all text-left">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    📚 Get advice
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get advice on how to handle a situation
                  </p>
                </div>
                <div className="bg-gray-300 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all text-left">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    🔍 Brainstorm
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Brainstorm a topic together
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
          {/* MSGS != 0 - DISPLAY ALL MESSAGES */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <LoadingIndicator />}

            {/* SMOOTH SCROLLING REFERENCE */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>


      {/* INPUT AREA - FIXED AT BOTTOM */}
      {/* flex-shrink-0 = input area doesn't shrink, stays at fixed height */}
      <div className="border-t border-gray-500 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-950 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            {/* TEXTAREA FOR INPUT */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}

              onKeyPress={handleKeyPress}

              placeholder="Message ChatGPT..."
              rows="1"
              className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-800 border border-gray-800 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition-all resize-none max-h-32"
              style={{ overflow: "hidden" }}
              onInput={(e) => {

                // MSG INCREASES = HEIGHT INCREASES 
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
              }}
            />


            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gray-400 text-black font-extrabold dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-600 dark:text-white p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
          {/* DISCLAIMER */}
          <p className="text-xs text-black dark:text-gray-400 mt-2">
            Free Research Preview. ChatGPT may produce inaccurate information about people, places, or facts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

