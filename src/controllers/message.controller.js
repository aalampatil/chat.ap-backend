import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { messageModel } from "../models/message.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { userModel } from "../models/user.model.js";
import { io, userSocketMap } from "../index.js";

const getUsersForSidebar = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "login to proceed");
  }

  // Get all users except the logged-in one
  const users = await userModel
    .find({ _id: { $ne: userId } })
    .select("-password -refreshToken");
  


  //get unseen messages grouped by sender
  const unseenMsgs =  await messageModel.aggregate([
    {$match: {receiverId: userId, seen: false}},
    {$group: {_id: "senderId", count : {$sum: 1}}}
  ])

  const unseenMessages = unseenMsgs.reduce((acc, msg) => {
    acc[msg._id] = msg.count;
    return acc;
  }, {})

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { users, unseenMessages },
        " user fetched successfully"
      )
    );
});

const getMessages = asyncHandler( async (req, res) => {
   const {id : selectedUserId} = req.params;
   const myId = req.user._id

   const messages = await messageModel.find({
    $or : [
      {senderId: myId, receiverId: selectedUserId},
      {senderId: selectedUserId, receiverId: myId}
    ]
   })

   await  messageModel.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true})
   
   return res.status(200).json(new ApiResponse(200, {messages}))
})

//mark mesage as seen
const markMessageAsSeen = asyncHandler (async (req, res) => {
    const {id} = req.params;
    await messageModel.findByIdAndUpdate(id, {seen: true})
    return res.status(200).json(new ApiResponse(200, {}, "seen"))
})

//send message to selected user

const sendMessage = asyncHandler(async (req, res) => {
  const {text} = req.body

  const receiverId = req.params.id;
  const senderId = req.user._id;

  let imageLocalPath;

  if (
    req.file &&
    req.file.path
  ) {
    imageLocalPath = req.file.path;
  }

  let imageFile;

  if(imageLocalPath) {
      imageFile = await uploadOnCloudinary(imageLocalPath)
  }

  const newMessage = await messageModel.create({
    senderId,
    receiverId,
    text,
    image: imageFile?.url || ""
  })

  //emit the new message to the receivers socket
  const receiverSocketId = userSocketMap[receiverId];
  if(receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage)
  }

  return res.status(200).json(new ApiResponse(200, newMessage, "new message"))

})

export {getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage}
