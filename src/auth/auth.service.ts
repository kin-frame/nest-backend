import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { type User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  issueToken(user: User) {
    if (user.status !== 'APPROVED') {
      throw new ForbiddenException('관리자 승인 필요');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
