

const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")


// After deployment scene :-
// DEPLOYMENT MIDDLEWARE :-
const path = require("path")


// Routes 
const authRoutes = require("./routes/auth.routes")
const chatRoutes = require("./routes/chat.routes")


// Middlewares
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())


// After deployment scenes 
// DEPLOYMENT MIDDLEWARE :-
app.use(express.static(path.join(__dirname, `../public`)))
// meaning : Whatever is there inside public folder, and whatever files make it publically accessible
// This makes it available to everyone publically on internet 

// Using Routes 
app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)


// After deployment scenes :-
// WILD CARD :-
app.get("*name", (re, res) => {
    res.sendFile(path.join(__dirname, `../public/index.html`))
})
// index.html in public folder is the main file where our react build worked
// and compressed our whole code into one file to be depolyed 


module.exports = app

