import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import { checkForToken } from "./middlewares/auth.js";
import authRouter from "./routers/auth.js";
import bookRouter from "./routers/book.js";
import memberRouter from "./routers/member.js";
import borrowRouter from "./routers/borrow.js";
import { startCronJobs } from "./utils/cronJobs.js";

const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongodb connected!");
    startCronJobs();
  })
  .catch((err) => console.log("Mongodb connection error", err));

//Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForToken);

//Routes
app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/members", memberRouter);
app.use("/api/borrows", borrowRouter);
//Error Handler

//Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Shelfside server running on port ${PORT}`));
