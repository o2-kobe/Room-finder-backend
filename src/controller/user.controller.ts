import { Response, Request } from "express";
import { CreateUserRequest } from "../schema/user.schema";
import { createUser, deleteUser, getUser } from "../service/user.service";
import logger from "./../utils/logger";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserRequest>,
  res: Response,
) {
  try {
    const { passwordConfirm, ...userData } = req.body;
    const user = await createUser(userData);
    res.status(201).json({ status: "success", user });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "error", message: "Failed to create user" });
  }
}

export async function getUserHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user._id;
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
    const userId = res.locals.user._id;
    await deleteUser(userId);
    res.status(204).send("User deleted successfully");
  } catch (error) {
    logger.error(error);
    res.status(500).send("Failed to delete user, Try again");
  }
}
