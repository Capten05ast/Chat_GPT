

const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");


function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            // origin: "*" // This leads to CORS error, browser dosent supports all urls 
            origin: [
                "http://localhost:5173",
                "https://chat-gpt-lyj2.onrender.com"
            ],
            allowedHeaders: ["content-Type", "Authorization"],
            credentials: true
        }
    })


    // MIDDLEWARE :-
    // Like express middleware we also have middleware for scoket.io
    // OR opperator becoz if headers.cookie is undefined then instead of showing error it will assign emty string ""
    io.use( async (socket, next) => {


        // FINDING TOKEN :-
        // If you havent provided token inside socket req > headers > Cookie
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"));
        }


        // VERIFYING TOKEN :-
        // We used cookies.token becoz we have stored token inside cookies with the name 'token'
        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);
            socket.user = user; // Attach user info to socket object
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }


        // Till here it will just log the cookies, but wont connect becoz we have not called next()
        console.log("Socket connection cookies:", cookies)
    })




    // CONNECTION :-
    io.on("connection", (socket) => {
        console.log("User connected:", socket.user._id) 
        console.log("New socket connection:", socket.id) // socket.id is built in feature


        // EVENT LISTENER :-
        // mesagePayload is message inside message section (in JSON format) in socket.io request
        // messagePayload = {
        //   chatId: "64a5f3e2c8f1b2d3e4f5a6b7",
        //   content: "Hello AI"
        // }


        socket.on("ai-message", async (messagePayload) => {
            console.log("Message Object : ", messagePayload)
            const userContent = messagePayload.message;


            // OPTIMIZATION :-
            // We can execute -storing msg in MongoDB and -genrating vectors of user msg at the same time parallely

            // CODE BEFORE OPTIMIZATION (Part - 1):-
/*
            // USER PROMPT, STORING IN MONGODB:-
            const message = await messageModel.create({
                chat: messagePayload.chat, // chat ID and not token stored in headers in POSTMAN
                user: socket.user._id,
                content: messagePayload.content,
                role: "user"
            })
            
            // USER PROMPT VECTOR CREATION :-
            const vectors = await aiService.generateVector(messagePayload.content)
            console.log("Vectors generated : ", vectors)
*/


            // CODE AFTER OPTIMIZATION (Part - 1):-
            // Promuse.all method : Starts initializing both the thing at the same time
            const [ message, vectors ] = await Promise.all([

                // USER PROMPT, STORING IN MONGODB:-
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: userContent,
                    role: "user"
                }),

                // USER PROMPT VECTOR CREATION :-
                // aiService.generateVector(messagePayload.content)
                aiService.generateVector([
                    {
                        role: "user",
                        parts: [{ text: userContent }]
                    }
                ])
            ])


            // USER MSG, STORING IN LTM :-
            // But from this array of objects of 768 values we just want imp imp values
            // return response.embeedings[0].values
            await createMemory( {
                vectors,
                messageId: message._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: userContent
                }
            } )

            


            // CODE BEFORE OPTIMIZATION (Part - 2) :-
/*
            // STM CHAT HISTORY :-
            const chatHistory = (await messageModel.find({ 
                chat: messagePayload.chat
            }).sort({ createdAt: -1 }).limit(10).lean()).reverse()
            
            console.log("Chat History : ", chatHistory.map(item => {
                return {
                    role: item.role,
                    parts : [ {text: item.content} ]
                }
            }));


            // LTM CHAT HISTORY :-
            // > Query Memory :
            //   Now we will try to relate users current question with the previous questions stored in Pinecone
            const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,
                metadata: {
                    // user: socket.user._id
                    // If you do like this then only this particular users data will be fetched
                }
            })
*/


            // CODE AFTER OPTIMIZATION (Part - 2) :-
            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vectors,
                    limit: 3,
                    metadata: {
                        // user : socket.user._id
                    }
                }),

                messageModel
                    .find({ chat: messagePayload.chat })
                    .sort({ createdAt: -1})
                    .limit(10)
                    .lean()
                    .then(arr => arr.reverse())

                // .THEN :-
                // Mongoose returns a Promise, not an array.
                // .then() waits for the Promise to resolve and provides the actual array.
                // Only after that can we use array methods like .reverse().
                
                // Promise.all only waits for the Promises returned by each item, not the synchronous code inside them.
                // find().lean() returns a pending Promise, but calling reverse() immediately happens before it resolves.
                // Using .then(arr => arr.reverse()) makes reverse() run only after the Promise resolves into an array,
                // so Promise.all can correctly wait for the final (reversed) result.

                // ARR :-
                // arr represents the resolved value of the Promise, which in this case is an ARRAY.
            ])


            console.log(" ")
            console.log("Query Memory : Inter chat memory stored in Vector DB")
            console.log(memory)
            console.log(" ")




            // STM TO BE FEEDED TO GEMINI :-
            // > Syntax refer :
            //   Gemini docs > core capabilities > function calling > Step 2: Call the model with function declarations
            // > Passing chat history to model :
            //   But we cant pass the whole chat history to the AI model 
            //   (Short term memory to remember the previously asked questions), 
            //   so we will refer to the gemini docs
            const stm = chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [ { text: item.content } ]
                }
            })

            // LTM TO BE FEEDED TO GEMINI :-
            // > System :
            //   System is neither model nor user, its just sytem telling
            //   Vector DB about the context of the user message w.r.t old inter-chat msgs
            const ltm = [
                {
                    role: "user",
                    parts: [ { 
                        text: 
                        `These are some previous messages from the chat, use them to generate a response
                        ${memory.map(item => item.metadata.text).join("\n")}
                        ` 
                    } ]
                }
            ]
            console.log(" ")
            console.log("Long Term Memory :- ")
            console.log(ltm[0]);
            console.log(" ")
            console.log("Short Term Memory :- ")
            console.log(stm);
            console.log(" ")

            // PASSING LTM AND STM TO GEMINI :-
            const response = await aiService.generateResponse([...ltm, ...stm])
            


            
            // CODE AFTER OPTIMIZATION (Part - 4) :-
            // DISPLAY CHAT ON FRONTEND :-
            socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chat
            })
            console.log("********** CHAT-GPT **********")
            console.log("User Question : ", userContent)
            console.log("AI Response : ", response)




            // CODE BEFORE OPTIMIZATION (Part - 3) :-
/*
            // MODEL MSG, STORING IN MONGODB :-
            const responseMessage = await messageModel.create({
                chat: messagePayload.chat, // chat ID and not token stored in headers in POSTMAN
                user: socket.user._id,
                content: response,
                role: "model"
            })
            
            // MODEL RESPONSE VECTOR CREATION :-
            const responseVectors = await aiService.generateVector(response)
*/


            // CODE AFTER OPTIMIZATION (Part - 3)
            const [responseMessage, responseVectors] = await Promise.all([
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: response,
                    role: "model"
                }),

                // aiService.generateVector(response)
                aiService.generateVector([
                    {
                        role: "model",
                        parts: [{ text: response }]
                    }
                ])
            ])

            // MODEL MSG, STORING IN LTM :-
            await createMemory ({
                vectors: responseVectors,
                messageId: responseMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                }
            })




            // BEFORE OPTIMIZATION (Part - 4):-
/*
            // DISPLAY CHAT ON FRONTEND :-
            socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chat
            })
            console.log("********** CHAT-GPT **********")
            console.log("User Question : ", messagePayload.content)
            console.log("AI Response : ", response)
*/

        })
    })
}

module.exports = initSocketServer;




// SOCKET.IO :-
// > search socket.io
// > Documentation
// > Server 
// > Installation
// > npm install socket.io

// > Server 
// > Initialisation > Standalone > Common JS 
// > copy paste code in this file and modify a lil bit according to lecture

// > Postman
// > New socket.io request
// > localhost:3000
// > Connect


// SOCKET.IO CONNECTION PREREQUISITES :-
// Before socket.io connection, we need to check whether user is logged in or not


// POSTMAN COOKIE SETUP AND SOCKET MIDDLEWARE :-
// > As we know that after logging in the user, a cookie is set in the POSTMAN Cookies section (Cohort-GPT-Project > Authentication > POST login)
// > Copy that cookie and paste it in the header of the socket.io request (Cohort-GPT-Project > messages > socket)
//   Headers
//   key: Cookie
//   value: paste the copied token here (token=ey...;)


// CHAT - SOCKET CONNECTION :-
// > create chat
// > Copy chat.id from newly created chat being displayed in the response of POSTMAN
// > paste it in the socket.io message section as JSON (message inside msg box is called as data) :
//   {
//      "chatId": "64a5f3e2c8f1b2d3e4f5a6b7", // user is messaging in this chat specifically, as we can have so may chats like we do in GPT, new chat 
//      "content": "Hello AI"                 // Message written by user
//   }
// 
// > In right side middle section, beside ACK, in message box, write the event name as "ai-message"
//   Emitting  Event:  ai-message  ->  from Frontend (POSTMAN)
//   Listening Event:  ai-message  ->  from backend (socket.server.js)
// 
// > Therefore this message written by user will go in "ai-message" event
// > connect
// > After connecting click on "ack[] ai-message send" 


// ai-message Event :-
// > listening in backend 
// > emitting in frontend
//   for displaying AI response in backend (VS code terminal)

// ai-response Event :-
// > listening in frontend
// > emitting in backend
//   for displaying AI response in frontend (POSTMAN)


// SHORT TERM MEMORY :-
// So far we have implemented short term memory, memory which is just valid for single chat'

// LONG TERM MEMORY (Vector DB):-
// > We will implement long term memory in next lecture
// > Where AI will remember Inter chat data also, we will use Vector DB


// .SORT IN CHAT HISTORY :-
// +----------------------------+-------------------------+-----------------------+
// | Step                       | Operation               | Result                |
// | -------------------------- | ----------------------- | --------------------- |
// | .sort({ createdAt: -1 })   | Sort by latest first    | newest → oldest       |
// | .limit(10)                 | Take last 10 messages   | still newest → oldest |
// | .reverse()                 | Flip order              | oldest → newest       |
// +----------------------------+-------------------------+-----------------------+




// FETCH CHAT HISTORY (STM v/s LTM) :-
// > Find all messages with the respective chat ID : messagePayload.chat
// > We refered syntax of return from :-
//   Gemini docs > core capabilities > function calling > Step 2: Call the model with function declarations
// > LIMIT 
//   Only last 10 messages will be fecthed from chat history
// > NEW CHAT ? 
//   If user creates new chat then we dont have any previous messages
//   to fetch from STM. At that time we will refer LTM. Because STM
//   stores inter-chat memory (beyond one single chat)
//   While creating new chat enter (chat id and token in headers)
// > STM = depends on chat messages
//   LTM = depends on the user messages