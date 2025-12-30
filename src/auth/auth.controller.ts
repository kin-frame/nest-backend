import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  Handler,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import passport from 'passport';
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
  googleLogin(@Req() req: Request, @Res() res: Response, next: NextFunction) {
    const state = req.query.state as string;

    const authorize = passport.authenticate('google', {
      scope: ['profile', 'email'],
      state,
    }) as Handler;

    authorize(req, res, next);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('구글 인증에 실패했습니다.');
      }

      const redirectUri = req.query.state as string;

      const user = await this.userService.findOrCreate(req.user);
      const sessionId = await this.authService.issueSessionId(user.id);
      const HOUR = 60 * 60 * 1000;

      res.cookie('refresh_token', sessionId, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        expires: new Date(Date.now() + 24 * HOUR), // 24h
      });

      if (!redirectUri || redirectUri.startsWith('http'))
        return res.redirect(`${process.env.CLIENT_URL}/auth/callback`);

      const code = await this.authService.issueCode(user.id);

      return res.redirect(`${redirectUri}?code=${code}`);
    } catch (error) {
      console.error(error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }

  @Post('code')
  async getOauthToken(@Body() body: { code: string }, @Res() res: Response) {
    const user = await this.userService.findByCode(body.code);
    const sessionId = await this.authService.issueSessionId(user.id);
    await this.userService.deleteUserCOde(user.id);

    if (!body.code || !user) {
      throw new UnauthorizedException({
        status: null,
      });
    }

    const { access_token } = this.authService.issueToken(user);

    return res
      .json({
        status: user.status,
        accessToken: access_token,
        refreshToken: sessionId,
      })
      .send();
  }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.headers.authorization;

    if (!sessionId) {
      throw new UnauthorizedException({
        status: null,
      });
    }

    try {
      const user = await this.userService.findBySessionId(sessionId);

      const { access_token } = this.authService.issueToken(user);

      // 로그인 성공하고 날짜 및 IP 업데이트
      await this.userService.updateLastLoginedAt(user.id);
      await this.userService.updateLastLoginedIp(user.id, req.ip);

      return res
        .json({ status: user.status, accessToken: access_token })
        .send();
    } catch {
      // return res.redirect(`${process.env.CLIENT_URL}/login`);
      throw new ServiceUnavailableException({
        status: null,
      });
    }
  }

  @Get('token')
  async generateAccessToken(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.cookies['refresh_token'] as string;

    if (!sessionId) {
      throw new UnauthorizedException({
        status: null,
      });
    }

    try {
      const user = await this.userService.findBySessionId(sessionId);

      const { access_token } = this.authService.issueToken(user);

      // 로그인 성공하고 날짜 및 IP 업데이트
      await this.userService.updateLastLoginedAt(user.id);
      await this.userService.updateLastLoginedIp(user.id, req.ip);

      return res
        .json({ status: user.status, accessToken: access_token })
        .send();
    } catch {
      // return res.redirect(`${process.env.CLIENT_URL}/login`);
      throw new ServiceUnavailableException({
        status: null,
      });
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.cookies['refresh_token'] as string;

    try {
      const user = await this.userService.findBySessionId(sessionId);
      await this.userService.deleteSessionId(user.id);
      res.clearCookie('refresh_token');
      return res.status(204).send();
    } catch {
      // return res.redirect(`${process.env.CLIENT_URL}/login`);
      throw new ServiceUnavailableException({
        status: null,
      });
    }
  }

  @Get('check')
  check(@Req() req: Request) {
    const token = String(req.headers['access_token'] || '');

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
