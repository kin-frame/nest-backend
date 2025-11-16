import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

import { UserRole } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('구글 인증에 실패했습니다.');
      }

      const user = await this.userService.findOrCreate(req.user);
      const sessionId = await this.authService.issueSessionId(user.id);

      return res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?session_id=${sessionId}`,
      );
    } catch (error) {
      console.error(error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }

  @Get('token')
  async generateAccessToken(
    @Req() req: Request,
    @Query() query: { sessionId: string },
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.findBySessionId(query.sessionId);

      const { access_token } = this.authService.issueToken(user);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      });

      // 로그인 성공하고 날짜 및 IP 업데이트
      await this.userService.updateLastLoginedAt(user.id);
      await this.userService.updateLastLoginedIp(user.id, req.ip);
      await this.userService.deleteSessionId(user.id);

      /** 
      // PENDING이면 회원가입 페이지로 리다이렉트
      if (user.status === UserStatus.PENDING) {
        return res.redirect(`${process.env.CLIENT_URL}/signup`);
      }

      // 회원가입 신청을 완료했다면, 회원가입 완료 안내 페이지로 리다이렉트
      if (user.status === UserStatus.SUBMIT) {
        return res.redirect(`${process.env.CLIENT_URL}/signup/info`);
      }

      // APPROVED라면 홈으로 리다이렉트
      return res.redirect(`${process.env.CLIENT_URL}/home`);
      */
      return res.json({ status: user.status }).send();
    } catch {
      // return res.redirect(`${process.env.CLIENT_URL}/login`);
      throw new ServiceUnavailableException({
        status: null,
      });
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');

    return res.status(204).send();
  }

  @Get('check')
  check(@Req() req: Request) {
    const token = String(req.cookies['access_token'] || '');

    if (!token) {
      return { isLogin: false, exp: 0, role: UserRole.GUEST };
    }
    try {
      const { payload } = jwt.verify(
        token,
        process.env.JWT_SECRET || 'some_secret',
        {
          algorithms: ['HS256'], // RS256 쓰려면 공개키 필요
          complete: true,
        },
      );

      if (typeof payload === 'string') {
        return { isLogin: false, exp: 0, role: UserRole.GUEST };
      } else {
        return {
          isLogin: true,
          exp: payload.exp,
          role: payload.role as UserRole,
        };
      }
    } catch {
      return { isLogin: false, exp: 0, role: UserRole.GUEST };
    }
  }
}

export interface GoogleUser {
  provider: 'google';
  providerId: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}
