import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { type Request } from 'express';

import { AuthGuard } from 'src/common/auth.guard';
import { CustomJwtPayload } from 'src/types/express';
import { UserSignupDto } from './dto/signup.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '회원가입', description: '신규 회원을 등록합니다.' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 401, description: 'JWT 토큰 없음 또는 검증 실패' })
  async signup(@Body() dto: UserSignupDto, @Req() req: Request) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;

    return this.userService.signup(dto, jwtPayload.id);
  }
}
