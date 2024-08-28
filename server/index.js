import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "console";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import messageRoutes from "./routes/messages.js";
import {createPost} from "./controllers/posts.js"
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Message from "./models/Message.js"; // Import the new Message model
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb" , extended: true}));
app.use(bodyParser.urlencoded ({limit: "30mb" , extended: true}));
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));
app.use(cors());

/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null, "public/assets");
    },
    filename: function (req, file,cb){
        cb(null, file.originalname);
    }
});
const upload = multer({ storage })

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost)

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/messages", messageRoutes);




/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    dbName: 'SocialMedia',
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
  console.log("Connected to MongoDB");
    /* ADD DATA ONE TIME FOR SETUP */
    //await mongoose.connection.db.dropDatabase();
    //User.insertMany(users);
    //Post.insertMany(posts);
}).catch((error) => console.log(`${error} did not connect`))

/* SOCKET.IO SETUP */
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your client's URL
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify token here
    // If valid, call next()
    // If invalid, call next(new Error("Invalid token"))
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on("send_message", async (messageData, callback) => {
    console.log("Message received on server:", messageData);
    
    if (!messageData.receiver) {
      console.error("No receiver specified for message");
      callback && callback("No receiver specified");
      return;
    }

    try {
      // Save message to database
      const newMessage = new Message(messageData);
      await newMessage.save();

      // Send to receiver
      socket.to(messageData.receiver).emit("receive_message", newMessage);
      console.log(`Message sent to receiver ${messageData.receiver}`);
      
      // Send back to sender (for confirmation)
      socket.emit("receive_message", newMessage);
      console.log(`Message sent back to sender ${messageData.sender}`);

      // Acknowledge successful send
      callback && callback(null, newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
      callback && callback(error);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

/* SERVER STARTUP */
server.listen(PORT, () => { 
  console.log(`Server Port: ${PORT}`);
});