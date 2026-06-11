import { Request } from 'express';

export type UserRole =
  | 'CUSTOMER'
  | 'WAITER_CASHIER'
  | 'CHEF'
  | 'KITCHEN_ASSISTANT'
  | 'BRANCH_MANAGER'
  | 'HQ_MANAGER'
  | 'ADMIN';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  branchId: string | null;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
