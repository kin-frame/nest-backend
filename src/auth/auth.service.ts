import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { type User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  issueToken(user: User) {
    const payload = { id: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
