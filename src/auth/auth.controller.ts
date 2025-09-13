import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Request } from 'express';

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
  async googleCallback(@Req() req: Request) {
    // console.log(req.user);
    try {
      if (!req.user) {
        throw new Error('구글 인증에 실패했습니다.');
      }
      const user = await this.userService.findOrCreate(req.user);

      return this.authService.issueToken(user);
    } catch (error) {
      console.error(error);
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
