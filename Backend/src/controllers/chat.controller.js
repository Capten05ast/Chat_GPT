

const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model")
const { deleteMemory } = require("../services/vector.service"); // ✅ Import deleteMemory

async function createChat (req, res) {

    const { title } = req.body;
    const user = req.user; // from auth middleware

    const chat = await chatModel.create({
        user: user._id,
        title
    })

    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            _id: chat._id, // This is not user._id but chat._id from chat model
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user // user id
        }
    })
}


// FETCHING EXISTING CHATS :-
// > const user = req.user
//   Auth middleware = we got req.user from auth middleware
async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}


// FETCHING MESSAGES :-
async function getMessages(req, res) {
    try {
        const chatId = req.params.id;
        const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "messages retrived successfully",
            messages: messages
        })
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({
            error: err.message
        })
    }
}


// DELETE CHAT :- (DELETES CHAT, MESSAGES, AND VECTORS FROM PINECONE)
async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;
    const user = req.user;

    // ✅ Find chat and verify ownership
    const chat = await chatModel.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    if (chat.user.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✅ Delete all messages in MongoDB
    await messageModel.deleteMany({ chat: chatId });
    
    // ✅ Delete all vectors from Pinecone LTM
    await deleteMemory(chatId);
    
    // ✅ Delete the chat itself
    await chatModel.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ error: err.message });
  }
}


module.exports = {
    createChat,
    getChats,
    getMessages,
    deleteChat
}


// SOCKET.IO :-
// > search socket.io
// > Documentation
// > Server 
// > Installation
// > npm install socket.io