

require("dotenv").config()
const app = require("./src/app")


// CONNECT DB :-
const connectDB = require("./src/db/db")
connectDB();


// SOCKET.IO :-
const initSocketServer = require("./src/sockets/socket.server")
const httpServer = require('http').createServer(app);
initSocketServer(httpServer);


// app.listen(3000, () => {
//     console.log("Server started on port 3000")
// })
httpServer.listen(3000, () => {
    console.log("Server started on port 3000")
})




// npx nodemon server.js :-
// We can write this in more easy way 
// > package.json
// > Scripts 
// > "dev" : "npx nodemon server.js"
// > npm run dev will execute the command "npx nodemon server.js"