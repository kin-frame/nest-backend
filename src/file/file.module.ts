import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { S3Provider } from 'src/common/aws-s3.provider';
import { UserModule } from 'src/user/user.module';
import { FileController } from './file.controller';
import { File } from './file.entity';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([File]), UserModule], // ✅ Repository 등록
  controllers: [FileController],
  providers: [FileService, S3Provider],
})
export class FileModule {}
