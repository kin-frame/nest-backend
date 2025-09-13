import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { logger } from './logger';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, url } = req;
    const ip = req.ip;

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        method,
        url,
        status: res.statusCode,
        ip,
        durationMs: duration,
      });
    });

    next();
  }
}
