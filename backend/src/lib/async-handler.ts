import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncController = (req: Request, res: Response) => Promise<void>;

export function asyncHandler(controller: AsyncController): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    controller(req, res).catch(next);
  };
}
