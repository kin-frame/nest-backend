import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { type Request } from 'express';

import { AuthGuard } from 'src/common/auth.guard';
import { StatusGuard } from 'src/common/status.guard';
import { CustomJwtPayload } from 'src/types/express';
import { CreateDirectoryDto } from './dto/createDirectory.dto';
import { DirectoryService } from './directory.service';

@Controller('directory')
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Post()
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '디렉토리 생성',
  })
  async createDirectory(
    @Req() req: Request,
    @Body()
    body: CreateDirectoryDto,
  ) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;

    const directory = await this.directoryService.create({
      directoryName: body.directoryName,
      parentId: body.parentId,
      userId: jwtPayload.id,
    });

    return { id: directory.id };
  }

  @Get()
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '디렉토리 하위 디렉토리/파일 조회',
  })
  async getDirectoryChildren(
    @Req() req: Request,
    @Query() query: { directoryId: number },
  ) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;

    const directories = await this.directoryService.getChildren(
      query.directoryId,
      jwtPayload.id,
    );
    const info = await this.directoryService.getInfo(
      query.directoryId,
      jwtPayload.id,
    );

    return {
      directories: directories.map((v) => ({
        id: v.id,
        directoryName: v.directoryName,
      })),
      files: info?.files || [],
    };
  }

  @Get('info')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '디렉토리 조회',
  })
  async getDirectoryInfo(
    @Req() req: Request,
    @Query() query: { directoryId: number },
  ) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;

    const directory = await this.directoryService.getInfo(
      query.directoryId,
      jwtPayload.id,
    );

    if (!directory) {
      throw new NotFoundException('디렉토리가 존재하지 않습니다.');
    }

    const { id, parentId, userId, directoryName, path } = directory;

    return { id, parentId, userId, directoryName, path };
  }

  @Get('root')
  @UseGuards(AuthGuard, StatusGuard)
  @ApiOperation({
    summary: '루트 디렉토리 조회',
  })
  async getRootId(@Req() req: Request) {
    const jwtPayload = req.jwt.payload as CustomJwtPayload;

    const info = await this.directoryService.getRoot(jwtPayload.id);

    if (!info) {
      throw new NotFoundException('루트 디렉토리를 찾을 수 없습니다.');
    }

    return {
      id: info.id,
    };
  }
}
