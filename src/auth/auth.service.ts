import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { type User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  issueToken(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async issueSessionId(userId: number) {
    const uuid = randomUUID();

    await this.userService.updateSessionId(userId, uuid);

    return uuid;
  }
}
