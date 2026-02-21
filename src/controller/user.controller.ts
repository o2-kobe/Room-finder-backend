import { Response, Request } from "express";
import { CreateUserRequest } from "../schema/user.schema";
import { createUser, deleteUser, getUser } from "../service/user.service";
import logger from "./../utils/logger";
import { AppError } from "../utils/AppError";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserRequest>,
  res: Response,
) {
  try {
    const { passwordConfirm, ...userData } = req.body;
    const user = await createUser(userData);
    res.status(201).json({ status: "success", user });
  } catch (error: any) {
    logger.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "Duplicate field value entered",
      });
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Failed to create user",
    });
  }
}

export async function getUserHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user.sub;
    const user = await getUser(userId);

    res.status(200).json({ status: "success", data: user });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to find user",
    });
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user.sub;
    await deleteUser(userId);
    res.status(204).send("User deleted successfully");
  } catch (error) {
    logger.error(error);
    res.status(500).send("Failed to delete user, Try again");
  }
}
