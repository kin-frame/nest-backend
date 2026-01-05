import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { S3Provider } from 'src/common/aws-s3.provider';
import { Directory } from 'src/directory/directory.entity';
import { DirectoryService } from 'src/directory/directory.service';
import { File } from 'src/file/file.entity';
import { FileService } from 'src/file/file.service';
import { UserModule } from 'src/user/user.module';
import { UploadController } from './upload.controller';
import { Upload } from './upload.entity';
import { UploadService } from './upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    TypeOrmModule.forFeature([Directory]),
    TypeOrmModule.forFeature([Upload]),
    UserModule,
  ], // ✅ Repository 등록
  providers: [FileService, DirectoryService, UploadService, S3Provider],
  controllers: [UploadController],
})
export class UploadModule {}
