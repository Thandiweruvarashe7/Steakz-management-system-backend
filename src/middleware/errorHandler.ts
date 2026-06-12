
import { Request, Response, NextFunction } from 'express';

// A custom error type that can optionally carry an HTTP status code.
export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,    // the error that was thrown
  _req: Request,    // the original request (unused here, prefixed _ to show that)
  res: Response,    // the response object used to send the reply
  _next: NextFunction // required by Express but not used
): void => {
  // Use the error's statusCode if it has one; otherwise default to 500 (server error).
  const statusCode = err.statusCode || 500;

  // Use the error message if it has one; otherwise use a generic message.
  const message = err.message || 'Internal Server Error';

  // In development mode, print the full stack trace to the console so developers
  // can see exactly where the error happened.
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Send the error response back to the client.
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`, // tells the caller exactly which URL was wrong
  });
};
