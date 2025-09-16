import {
  Body,
  ConflictException,
  Controller,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';

import { AuthGuard } from 'src/common/auth.guard';
import { CustomJwtPayload } from 'src/types/express';
import { FileService } from './file.service';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  @Post('presigned-url')
  @UseGuards(AuthGuard)
  async getPresignedUrl(
    @Req() req: Request,
    @Body()
    body: {
      lastModified: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    },
  ) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;
    const key = `uploads/${jwtPayload.id}/${Date.now()}-${body.fileName}`;

    try {
      // DB에 PENDING 상태로 저장
      const meta = await this.fileService.createMeta({
        userId: jwtPayload.id,
        key,
        lastModified: new Date(body.lastModified),
        fileName: body.fileName,
        fileSize: body.fileSize,
        fileType: body.fileType,
        status: 'PENDING',
      });

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: body.fileType,
      });

      const url = await getSignedUrl(this.s3, command, { expiresIn: 600 });

      return { url, id: meta.id };
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  @Post('complete')
  @UseGuards(AuthGuard)
  async completeUpload(@Body() body: { id: number }) {
    await this.fileService.updateStatus(body.id, 'UPLOADED');

    return { success: true };
  }
}
