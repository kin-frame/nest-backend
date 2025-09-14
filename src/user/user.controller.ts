import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { type Request } from 'express';

import { AuthGuard } from 'src/common/auth.guard';
import { UserSignupDto } from './dto/signup.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @UseGuards(AuthGuard)
  async signup(@Body() dto: UserSignupDto, @Req() req: Request) {
    return this.userService.signup(dto, req.jwt.id as number);
  }
}
