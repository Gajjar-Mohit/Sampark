import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prevent sending response if headers are already sent
  if (res.headersSent) {
    console.error(
      "Headers already sent in errorHandler:",
      req.originalUrl,
      err
    );
    return next();
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};
export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
  }
}
