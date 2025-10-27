import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { type Request } from 'express';

import { CustomJwtPayload } from 'src/types/express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const payload = req.jwt.payload as CustomJwtPayload;
    const userId = payload.id;

    const user = await this.userService.findById(userId);

    if (!user || user.role !== 'ADMIN') {
      return false;
    }

    return true;
  }
}
