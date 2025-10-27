import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅ Repository 등록
  providers: [AdminService, UserService],
  controllers: [AdminController],
})
export class AdminModule {}
