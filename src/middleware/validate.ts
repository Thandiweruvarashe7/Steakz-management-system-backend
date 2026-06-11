import { Request, Response, NextFunction } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map((e) => {
        const field = e.type === 'field' ? (e as FieldValidationError).path : 'unknown';
        return { field, message: e.msg };
      }),
    });
    return;
  }
  next();
};
