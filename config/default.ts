import dotenv from "dotenv";

dotenv.config();

export default {
  port: 5000,
  accessTokenTtl: "15m",
  publicKey: process.env.publicKey,
  privateKey: process.env.privateKey,
  issuer: "uni-rental-apps",
  audience: "uni-students-seeking-rooms",
};
