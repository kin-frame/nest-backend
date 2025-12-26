import {
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type Request, type Response } from 'express';

import { AuthGuard } from 'src/common/auth.guard';
import {
  ApiPageableResponse,
  PageableReqDto,
} from 'src/common/dto/pageable.dto';
import { StatusGuard } from 'src/common/status.guard';
import { DirectoryService } from 'src/directory/directory.service';
import { CustomJwtPayload } from 'src/types/express';
import { CompleteUploadReqDto, CompleteUploadResDto } from './dto/complete.dto';
import { FileListItemDto } from './dto/file-list.dto';
import {
  GenerateThumbnailReqDto,
  GenerateThumbnailResDto,
} from './dto/generate-thumbnail.dto';
import {
  GetPresignedUrlReqDto,
  GetPresignedUrlResDto,
  PresignedUrlReqDto,
  PresignedUrlResDto,
} from './dto/presigned-url.dto';
import { File, FileStatus } from './file.entity';
import { FileService } from './file.service';

import { Readable } from 'stream';

@Controller('file')
export class FileController {
  constructor(
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  @Get('presigned-url')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: 'S3 버킷에 접근할 수 있는 presigned url 요청',
  })
  @ApiQuery({
    type: PresignedUrlReqDto,
    description: 'presigned url 요청 쿼리',
  })
  @ApiOkResponse({
    type: PresignedUrlResDto,
    description: 'presigned url 정보',
  })
  async getPresignedUrl(@Query() query: { fileId: number }) {
    const meta = await this.fileService.getFileKey(query.fileId);

    const isExpired =
      !meta?.expiresAt || new Date(meta.expiresAt).getTime() < Date.now();

    if (isExpired) {
      const [url, thumbnailUrl] = await Promise.all([
        getSignedUrl(
          this.s3,
          new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: meta?.key,
          }),
          {
            expiresIn: 24 * 60 * 60,
          },
        ),
        meta?.thumbnailKey &&
          getSignedUrl(
            this.s3,
            new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: meta.thumbnailKey,
            }),
            {
              expiresIn: 24 * 60 * 60,
            },
          ),
      ]);

      await Promise.all([
        this.fileService.updatePresignedUrl(query.fileId, url),
        thumbnailUrl &&
          this.fileService.updatePresignedThumbnailUrl(
            query.fileId,
            thumbnailUrl,
          ),
      ]);

      return { url, thumbnailUrl };
    } else {
      return { url: meta.fileUrl, thumbnailUrl: meta.thumbnailUrl };
    }
  }

  @Get('presigned-url/thumbnail')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    deprecated: true,
    summary:
      'S3 버킷에 접근할 수 있는 썸네일 presigned url 요청 (presigned url요청으로 통합)',
  })
  async getPresignedThumbnailUrl(@Query() query: { fileId: number }) {
    const meta = await this.fileService.getFileKey(query.fileId);

    const isExpired =
      !meta?.expiresAt || new Date(meta.expiresAt).getTime() < Date.now();

    if (isExpired) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: meta?.thumbnailKey,
      });
      const url = await getSignedUrl(this.s3, command, {
        expiresIn: 24 * 60 * 60,
      });
      await this.fileService.updatePresignedThumbnailUrl(query.fileId, url);

      return { url };
    } else {
      return { url: meta.thumbnailUrl };
    }
  }

  @Post('presigned-url')
  @UseGuards(AuthGuard, StatusGuard)
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

    const directory = await this.directoryService.getInfo(
      body.directoryId,
      jwtPayload.id,
    );

    if (!directory) {
      return new NotFoundException('디렉토리를 찾을 수 없습니다.');
    }

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
        width: body.width,
        height: body.height,
        directory,
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
  @UseGuards(AuthGuard, StatusGuard)
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
      await this.fileService.updateThumbnail(body.id);
      return { success: true };
    } catch {
      throw new ServiceUnavailableException({
        success: false,
      });
    }
  }

  @Post('generate-thumbnail')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '이미지 또는 동영상의 썸네일을 생성/교체',
  })
  @ApiOkResponse({
    type: GenerateThumbnailResDto,
  })
  async generateThumbnail(@Body() body: GenerateThumbnailReqDto) {
    try {
      await this.fileService.updateThumbnail(body.id);
      return { success: true };
    } catch (error) {
      console.error('generateThumbnail', error);
      throw new ServiceUnavailableException({
        success: false,
      });
    }
  }

  @Get()
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '사용자가 업로드한 파일 목록 반환',
  })
  @ApiPageableResponse(FileListItemDto)
  async getFiles(@Query() query: PageableReqDto, @Req() req: Request) {
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

  @Get(':id')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '사용자가 업로드한 파일 상세정보 반환',
  })
  @ApiOkResponse({
    type: FileListItemDto,
    description: '파일 상세정보',
  })
  async getFile(@Param('id') id: number) {
    return this.fileService.getFileKey(id);
  }

  @Get('stream/:id')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '동영상 스트리밍',
  })
  async streamVideo(
    @Param('id') id: number,
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    // 1. DB에서 S3 key 조회
    const file = await this.fileService.getFileKey(id);

    // 2. 파일 크기 알아오기 (HEAD 요청)
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: file?.key,
    });
    const head = await this.s3.send(headCommand); // v3에서는 HeadObjectCommand 사용

    const fileSize = Number(head.ContentLength);
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    try {
      // 3. Range로 S3에서 가져오기
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: file?.key,
        Range: `bytes=${start}-${end}`,
      });
      const s3Object = await this.s3.send(command);

      // 4. 응답 헤더 설정
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': file?.fileType, // ex: video/mp4
      });

      const stream = s3Object.Body as Readable;
      stream.pipe(res);
    } catch (error) {
      console.error('stream', error);
      throw new ServiceUnavailableException({
        success: false,
      });
    }
  }
}
