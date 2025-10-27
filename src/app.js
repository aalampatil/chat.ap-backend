import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, //required for sending header in request
  })
);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));
app.use(express.static("public"));
app.use(cookieParser());


//routes declaration
import { userRouter } from "./routes/user.routes.js";
import { messageRouter } from "./routes/message.routes.js";

app.use("/api/user", userRouter)
app.use("/api/message", messageRouter)

export { app };
