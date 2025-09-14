import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { type Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();

    // 1. 쿠키에서 먼저 확인
    const token = req.cookies['access_token'] as string;

    if (!token) {
      throw new UnauthorizedException('JWT 토큰이 없습니다.');
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'some_secret',
        {
          algorithms: ['HS256'], // RS256 쓰려면 공개키 필요
          complete: true,
        },
      );

      req.jwt = payload;

      return true;
    } catch {
      throw new UnauthorizedException('JWT 검증 실패');
    }
  }
}
