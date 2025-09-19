import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
  } & JwtPayload;
}

export interface ValidationError {
  message: string;
  path?: (string | number)[];
  code?: string;
}
