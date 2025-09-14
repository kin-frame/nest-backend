import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅ Repository 등록
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController], // ✅ AuthModule에서 사용 가능하도록 export
})
export class UserModule {}
