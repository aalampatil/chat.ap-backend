import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  `http://localhost:${process.env.PORT}`
];

//
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


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
