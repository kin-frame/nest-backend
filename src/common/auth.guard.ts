import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt, { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<RequestWithJWTPayload>();

    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();

    try {
      const token = auth.slice(7);

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'some_secret',
        {
          algorithms: ['RS256'],
        },
      );

      req.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

interface RequestWithJWTPayload extends Request {
  user: string | JwtPayload;
}
