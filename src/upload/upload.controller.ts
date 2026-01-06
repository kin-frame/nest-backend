import {
  Body,
  ConflictException,
  Controller,
  Inject,
  NotFoundException,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type Request } from 'express';
import { randomUUID } from 'crypto';

import { AuthGuard } from 'src/common/auth.guard';
import { StatusGuard } from 'src/common/status.guard';
import { DirectoryService } from 'src/directory/directory.service';
import { FileStatus } from 'src/file/file.entity';
import { FileService } from 'src/file/file.service';
import { CustomJwtPayload } from 'src/types/express';
import {
  GetPresignedUrlReqDto,
  GetPresignedUrlResDto,
} from './dto/get-presigned-url.dto';
import { UploadInitReqDto, UploadInitResDto } from './dto/upload-init.dto';
import { UploadService } from './upload.service';

const PART_SIZE = 5 * 1024 * 1024;

@Controller('upload')
export class UploadController {
  constructor(
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly uploadService: UploadService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  @Post('init')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: 'presigned url - 모바일 업로드 url 요청',
    description:
      '모바일 환경에서 multipart 방식으로 File을 업로드 하고 해당 파일의 메타를 전달. url에 PUT요청으로 파일 업로드. 완료 후 complete api 호출하여 등록 완료',
  })
  @ApiBody({
    type: UploadInitReqDto,
  })
  @ApiOkResponse({
    type: UploadInitResDto,
  })
  async initUpload(@Req() req: Request, @Body() body: UploadInitReqDto) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;
    const extension = body.fileType?.split('/')[1] || 'png';
    // NOTE: 모바일 업로드에서는 원본파일명을 추출하기 어려움
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const key = `uploads/${jwtPayload.id}/${fileName}`;

    const directory = await this.directoryService.getInfo(
      body.directoryId,
      jwtPayload.id,
    );

    if (!directory) {
      return new NotFoundException('디렉토리를 찾을 수 없습니다.');
    }

    let fileMeta: Awaited<ReturnType<FileService['createMeta']>> | null = null;

    try {
      // NOTE: DB에 PENDING 상태로 저장
      fileMeta = await this.fileService.createMeta({
        userId: jwtPayload.id,
        key,
        // NOTE: 모바일 exif date값 형식 확인 필요
        lastModified: body.lastModified
          ? new Date(body.lastModified)
          : new Date(),
        fileName,
        fileSize: body.fileSize,
        fileType: body.fileType,
        status: FileStatus.PENDING,
        width: body.width,
        height: body.height,
        directory,
      });

      const createCommand = new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: body.fileType,
      });

      const { UploadId } = await this.s3.send(createCommand);

      if (!UploadId) {
        throw new ServiceUnavailableException({
          success: false,
        });
      }

      const meta = await this.uploadService.createMeta({
        userId: jwtPayload.id,
        file: fileMeta,
        uploadId: UploadId,
        partCount: Math.ceil(fileMeta.fileSize / PART_SIZE),
      });

      return {
        id: meta.id,
        uploadId: UploadId,
        fileName,
      };
    } catch (error) {
      console.error(error);
      if (fileMeta?.id) {
        try {
          await this.fileService.deleteMeta(fileMeta.id);
        } catch (deleteError) {
          console.error(deleteError);
        }
      }

      throw new ConflictException(error);
    }
  }

  @Post('presigned-url')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: 'presigned url - 모바일 업로드 url 요청',
    description:
      '모바일 환경에서 multipart 방식으로 File을 업로드 하고 해당 파일의 메타를 전달. url에 PUT요청으로 파일 업로드. 완료 후 complete api 호출하여 등록 완료',
  })
  @ApiBody({
    type: GetPresignedUrlReqDto,
  })
  @ApiOkResponse({
    type: GetPresignedUrlResDto,
  })
  async getPresignedUrl(@Body() body: GetPresignedUrlReqDto) {
    const meta = await this.uploadService.findMeta(body.id);

    if (!meta) {
      throw new NotFoundException('업로드 요청이 존재하지 않습니다.');
    }

    const fileMeta = meta?.file;

    if (!fileMeta) {
      throw new NotFoundException(
        '업로드 요청에 해당하는 파일 메타를 찾을 수 없습니다.',
      );
    }

    if (!fileMeta.key) {
      throw new NotFoundException(
        '파일 메타에 S3버킷의 Key가 존재하지 않습니다.',
      );
    }

    const command = new UploadPartCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileMeta.key,
      UploadId: meta.uploadId,
      PartNumber: meta.partIndex,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 60 * 10, // 10분
      });

      await this.uploadService.updatePartIndex(meta.id, meta.partCount + 1);

      return { url: signedUrl, partNumber: meta.partIndex };
    } catch (error) {
      console.error(error);
      throw new ServiceUnavailableException('URL 발급 중 오류가 발생했습니다.');
    }
  }
}
