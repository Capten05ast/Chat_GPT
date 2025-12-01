

import React from "react";
import { Plus, Trash2, MessageSquare, X } from "lucide-react";

const Sidebar = ({
  isOpen,
  chatHistory,
  activeChat,
  onNewChat,
  onSelectChat,
  onDeleteChat, // ✅ Added prop for delete handler
  theme,
  onThemeToggle,
  setSidebarOpen,
}) => {
  return (
    <>
      {/* THE MAIN DIV WHICH SLIDES */}
      <div
        className={`border-r-2 fixed lg:static inset-y-0 left-0 z-40 w-64 h-screen lg:h-auto bg-white dark:bg-gray-900 border-gray-700 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >


        {/* NEW CHAT BUTTON */}
        <div className="p-4 border-b-2 border-gray-400 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gray-300 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Plus size={18} />
            New chat
          </button>
        </div>


        {/* MAPPING THE CHATS FROM CHAT HISTORY - HIDDEN SCROLLBAR */}
        {/* flex-1 makes it take remaining space, overflow-y-auto enables scrolling */}
        {/* scrollbar-hide hides the scrollbar but allows scrolling */}
        <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <div key={chat.id} className="mb-2 group">
                <div
                  onClick={() => {
                    onSelectChat(chat);
                    // THIS WORKS FOR MOBILE, AFTER CLICKING ON CHAT, SIDE BAR CLOSES
                    setSidebarOpen(false);
                  }}

                  // STYLING THEME WISE :-
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeChat === chat.id
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"
                  }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="text-sm truncate flex-1 light:text-white font-semibold">{chat.title}</span>
                  
                  {/* DELETE BUTTON - TRASH2 ICON */}
                  {/* ✅ Always visible, turns red on hover */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Prevent triggering onSelectChat
                      onDeleteChat(chat.id); // ✅ Call delete handler with chat ID
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 cursor-pointer flex-shrink-0 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-3">
              No chats yet. Start a new chat!
            </p>
          )}
        </div>


        {/* LIGHT DARK THEME BTN */}
        <div className="border-t-2 border-gray-400 dark:border-gray-700 p-4 flex-shrink-0">
          <button
            onClick={onThemeToggle}
            className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-400 dark:bg-[#1F2937] text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
          </button>
        </div>
      </div>


      {/* THIS DIV EXISTS ONLY FOR MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

