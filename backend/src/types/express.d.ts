import type { StaffUser } from '../auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      staffUser?: StaffUser;
    }
  }
}
