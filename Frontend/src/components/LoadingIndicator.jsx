

// ============================================
// 2. src/components/LoadingIndicator.jsx
// ============================================


/*
So logically:
User sends a message
API takes time
During that time → isLoading = true
ChatArea sees isLoading = true → shows <LoadingIndicator />
When API responds → isLoading = false → indicator disappears
*/


import React from "react";

const LoadingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white flex-shrink-0">
        🤖
      </div>

      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
        <div
          className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </div>
  );
};

export default LoadingIndicator;

