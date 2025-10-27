import {Router} from "express";
import { getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const messageRouter = Router();

messageRouter.route("/users").get(verifyJWT, getUsersForSidebar)
messageRouter.route("/:id").get(verifyJWT, getMessages)
messageRouter.route("/mark/:id").put(verifyJWT, markMessageAsSeen)
messageRouter.route("/send/:id").post(verifyJWT, upload.single("imageFile"), sendMessage)





export {messageRouter}