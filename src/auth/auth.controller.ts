import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
    // console.log(req.user);
    try {
      if (!req.user) {
        throw new Error('구글 인증에 실패했습니다.');
      }

      const user = await this.userService.findOrCreate(req.user);

      const { access_token } = this.authService.issueToken(user);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      });

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
    } catch (error) {
      console.error(error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
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
