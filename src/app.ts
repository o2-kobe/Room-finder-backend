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

const app = express();

app.use(express.json());
app.use(cookieParser());

// All routes mounted here
app.use("/api", routes);

export default app;
