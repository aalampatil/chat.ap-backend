import "./config/env.js";
import { app } from "./app.js";
import http from "http";
import { connectDB } from "./db/db.js";
import {Server, Socket} from "socket.io"
import { log } from "console";


//http server
const server = http.createServer(app);
const PORT = process.env.PORT;

//initialising socket.io server
export const io = new Server(server, {cors: {origin: "*"}})

//online users
export const userSocketMap = {}; //{userId: socketId}

//socket.io connection handler
io.on("connection", (Socket) => {
  const userId = Socket.handshake.query.userId;
  //console.log("user connected", userId);

  if(userId){
    userSocketMap[userId] = Socket.id
  }

  //Emit online users to all connected client
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  Socket.on("disconnect", () => {
    // console.log("user connected", userId);
    delete userSocketMap[userId]
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    
  })
  
})

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("\n index.js connectDB on error", error);
    });

    server.listen(PORT , () => {
      console.log(`\n server is running on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("\n index.js connectDB catch error", error);
  });
