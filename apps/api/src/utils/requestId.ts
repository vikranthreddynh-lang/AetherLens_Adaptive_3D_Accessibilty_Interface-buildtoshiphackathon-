import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id?: string;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
}
