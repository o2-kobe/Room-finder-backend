// // import cookieParser from "cookie-parser";

// // app.use(cookieParser());

// app.use(cors({
//   origin: "https://yourfrontend.com",
//   credentials: true,
// }));

// if hosting on vercel, render, nginx
// app.set("trust proxy", 1);

import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());

// All routes mounted here
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api", routes);

// Port is 5000
export default app;
