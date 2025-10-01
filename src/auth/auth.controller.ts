import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Request, type Response } from 'express';

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

      if (user.status === 'PENDING') {
        // PENDING이면 회원가입 페이지로 리다이렉트
        return res.redirect(`${process.env.CLIENT_URL}/signup`);
      }

      if (user.status === 'SUBMIT') {
        // 회원가입 신청을 완료했다면, 회원가입 완료 안내 페이지로 리다이렉트
        return res.redirect(`${process.env.CLIENT_URL}/signup/info`);
      }

      // APPROVED라면 홈으로 리다이렉트
      return res.redirect(`${process.env.CLIENT_URL}/home`);
    } catch {
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');

    return res.status(204).send();
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
