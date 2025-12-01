

// ============================================
// 1. src/components/MessageBubble.jsx
// ============================================


import React, { useState } from "react";
import { Copy, Check } from "lucide-react";


const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";
  // If isUser = True , then user
  // If isUser = False, then bot
  const [copied, setCopied] = useState(false);



  // COPY TO CLIPBOARD :-
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    
    // Reset after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };



  return (
    // User msg at right extreme
    // Bot  msg at left  extreme
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className="flex gap-3 max-w-2xl">
        
        
        {/* BOT EMOJI AT LEFT END */}
        {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white flex-shrink-0 text-2xl">
          🤖
        </div>
        )}


        {/* BOT AND USER MSG DEPENDING UPON CONTEXT */}
        <div
          className={`px-4 py-3 rounded-lg ${
            isUser
              ? "bg-gray-700 dark:bg-gray-600 text-white rounded-br-none ml-auto"
              : "bg-gray-300 dark:bg-gray-800 text-black dark:text-gray-100 rounded-bl-none"
          }`}
        >
          {/* MESSAGE TEXT AND COPY BUTTON CONTAINER */}
          <div className="flex gap-2 items-start">
            <p className="text-sm leading-relaxed break-words flex-1">{message.text}</p>
            
            {/* COPY ICON - ONLY FOR AI MESSAGES */}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="flex-shrink-0 hover:opacity-70 transition-opacity ml-2"
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} className="opacity-60 hover:opacity-100" />
                )}
              </button>
            )}
          </div>
        </div>


        {/* USER EMOJI AT RIGHT END */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gray-600 dark:bg-gray-700 flex items-center justify-center text-white flex-shrink-0 text-2xl">
            👨
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

