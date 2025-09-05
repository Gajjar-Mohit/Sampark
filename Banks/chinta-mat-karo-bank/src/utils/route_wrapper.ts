import type { Request, Response, NextFunction } from "express";

type ControllerFunction = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: ControllerFunction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Only pass to error handler if response hasn't been sent
      if (!res.headersSent) {
        next(error);
      } else {
        console.error("Error after response sent:", req.originalUrl, error);
      }
    }
  };
};
