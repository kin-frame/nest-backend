import {
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { type Request } from 'express';

import { AuthGuard } from 'src/common/auth.guard';
import { PagebleReqDto } from 'src/common/dto/pageble.dto';
import { CustomJwtPayload } from 'src/types/express';
import { CompleteUploadReqDto, CompleteUploadResDto } from './dto/complete.dto';
import {
  GetPresignedUrlReqDto,
  GetPresignedUrlResDto,
} from './dto/presigned-url.dto';
import { FileStatus } from './file.entity';
import { FileService } from './file.service';

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  @Get('presigned-url')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'S3 버킷에 접근할 수 있는 presigned url 요청',
  })
  async getPresignedUrl(@Query() query: { fileId: number }) {
    const meta = await this.fileService.getFileKey(query.fileId);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: meta?.key,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 60 });

    return { url };
  }

  @Post('presigned-url')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'presigned url 요청',
    description:
      'File을 업로드 하고 해당 파일의 메타를 전달. url에 PUT요청으로 파일 업로드. 완료 후 complete api 호출하여 등록 완료',
  })
  @ApiOkResponse({
    type: GetPresignedUrlResDto,
  })
  async getPresignedUploadUrl(
    @Req() req: Request,
    @Body()
    body: GetPresignedUrlReqDto,
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
        status: FileStatus.PENDING,
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
  @ApiOperation({
    summary: 'S3업로드 완료 후, 파일 메타 업데이트',
  })
  @ApiOkResponse({
    type: CompleteUploadResDto,
    description: '업로드 성공 여부',
  })
  async completeUpload(
    @Body() body: CompleteUploadReqDto,
  ): Promise<CompleteUploadResDto> {
    try {
      await this.fileService.updateStatus(body.id, FileStatus.UPLOADED);
      return { success: true };
    } catch {
      throw new ServiceUnavailableException({
        success: false,
      });
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '사용자가 업로드한 파일 목록 반환',
  })
  async getFiles(@Query() query: PagebleReqDto, @Req() req: Request) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;
    const sortArr: string[] = [];

    return this.fileService.getFiles(
      query.page,
      query.size,
      sortArr.concat(query.sort),
      {
        userId: jwtPayload.id,
      },
    );
  }
}
