// ──────────────────────────────────────────────────────────────────────────────
// middleware/validate.ts
//
// This file contains a single function called "validate".
// Its job is to check whether the data sent in a request (e.g. a form submission)
// passed all the validation rules that were defined before it in the route.
//
// Think of it like a form checker at a job application office:
//   - First, each field is checked against rules (e.g. "email must be valid")
//   - If any rule fails, validate() stops the request and sends back the errors
//   - If everything is fine, it lets the request continue to the actual handler
//
// The validation rules themselves are defined in the route files using
// express-validator's body() function. validate() just reads the results.
// ──────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';

// Reads the validation results collected by express-validator and either
// rejects the request (if there are errors) or lets it continue (if clean).
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  // validationResult() collects any validation errors from the previous body() checks.
  const errors = validationResult(req);

  // If there are validation errors, stop here and send them back to the caller.
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      // Format each error into { field, message } so the frontend can display them
      // next to the correct form field.
      errors: errors.array().map((e) => {
        // e.type === 'field' means the error is about a specific input field (e.g. "email")
        // If it's a different kind of error, we call the field "unknown" as a fallback.
        const field = e.type === 'field' ? (e as FieldValidationError).path : 'unknown';
        return { field, message: e.msg };
      }),
    });
    return; // stop — don't call next()
  }

  // No errors — hand control to the next function (the actual route handler).
  next();
};
