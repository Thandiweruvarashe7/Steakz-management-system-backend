// ──────────────────────────────────────────────────────────────────────────────
// middleware/errorHandler.ts
//
// This file handles what happens when something goes wrong anywhere in the app.
// Instead of the server crashing silently or sending a confusing response,
// these two functions catch problems and send back a clean, readable error message.
//
// Two functions are defined:
//   1. errorHandler — catches errors thrown inside route handlers
//   2. notFound     — catches requests to URLs that don't exist
// ──────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';

// A custom error type that can optionally carry an HTTP status code.
// For example: statusCode 404 means "not found", 500 means "server error".
export interface AppError extends Error {
  statusCode?: number;
}

// ── Function 1: errorHandler ─────────────────────────────────────────────────
// This is a global safety net. If any route or middleware throws an error,
// Express passes it here automatically. Think of it like a "catch-all" that
// prevents the server from crashing and sends the user a proper error message.
//
// Note: Express knows this is an error handler because it has FOUR parameters
// (err, req, res, next). That's a special Express convention.
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
  // In development, include the stack trace in the response for easier debugging.
  // In production, the stack is hidden so users can't see internal code details.
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// ── Function 2: notFound ─────────────────────────────────────────────────────
// This runs when someone visits a URL that doesn't exist on the server.
// For example: GET /api/unicorns — there's no such route, so this returns a
// 404 "Not Found" response with the URL that was requested.
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`, // tells the caller exactly which URL was wrong
  });
};
