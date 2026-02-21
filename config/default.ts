import dotenv from "dotenv";

dotenv.config();

export default {
  port: 5000,
  accessTokenTtl: "15m",
  JWT_SECRET: process.env.privateKey,
  issuer: "uni-rental-apps",
  audience: "uni-students-seeking-rooms",
};
