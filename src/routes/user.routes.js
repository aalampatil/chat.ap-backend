import { Router } from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateprofile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/login").post(login);
userRouter.route("/logout").post(verifyJWT, logout);
userRouter
  .route("/update-profile")
  .put(verifyJWT, upload.single("profilePicture"), updateprofile);
userRouter.route("/check-auth").get(verifyJWT, checkAuth);


export { userRouter };
