
import { Request, Response, NextFunction } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';

// Reads the validation results collected by express-validator and either

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
      
        // If it's a different kind of error, we call the field "unknown" as a fallback.
        const field = e.type === 'field' ? (e as FieldValidationError).path : 'unknown';
        return { field, message: e.msg };
      }),
    });
    return; // stop — don't call next()
  }

  next();
};
