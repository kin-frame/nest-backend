import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
}
