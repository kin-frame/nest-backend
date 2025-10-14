import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from 'src/user/user.module';
import { DirectoryController } from './directory.controller';
import { Directory } from './directory.entity';
import { DirectoryService } from './directory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Directory]), UserModule], // ✅ Repository 등록
  providers: [DirectoryService],
  controllers: [DirectoryController],
})
export class DirectoryModule {}
