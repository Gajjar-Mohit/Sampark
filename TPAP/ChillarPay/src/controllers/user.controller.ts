import type { Request, Response } from "express";
import { CreateUserRequest } from "../types/user";
import { createUser } from "../services/user.service";

export const createUserController = async (req: Request, res: Response) => {
  const parsedBody = CreateUserRequest.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const response = await createUser(
    parsedBody.data.contactNo,
    parsedBody.data.name,
    parsedBody.data.email
  );

  return res.status(200).json({
    status: "Success",
    message: "User created successfully",
    data: response,
  });
};
