

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", 
        // userModel in mongoDB, this tells that id is referencing to user collection
        required: true
    }, 
    title : {
        type : String,
        required : true
    },
    lastActivity : {
        type : Date,
        default : Date.now
    }
}, 
{
    // Meta data of createdAt and updatedAt
    timestamps : true
})


const chatModel = mongoose.model("chat", chatSchema)
module.exports = chatModel;
