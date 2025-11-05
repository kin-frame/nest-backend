import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { AdminGuard } from 'src/common/admin.guard';
import { AuthGuard } from 'src/common/auth.guard';
import {
  GetAdminUserInfoResDto,
  GetAdminUserListReqDto,
  UpdateAdminUserInfoReqDto,
} from './dto/user.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('user')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({
    summary: '관리자 > 사용자 목록 조회',
    description: '사용자 목록을 조회합니다.',
  })
  getAdminUserList(@Query() query: GetAdminUserListReqDto) {
    const sortArr: string[] = [];

    return this.adminService.getUserList(
      query.page,
      query.size,
      sortArr.concat(query.sort),
      query.keywordType,
      query.keyword,
    );
  }

  @Get('user/:id/info')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({
    summary: '관리자 > 사용자 정보 조회',
    description: '사용자 정보를 조회합니다.',
  })
  @ApiOkResponse({
    type: GetAdminUserInfoResDto,
    description: '사용자 상세 정보 반환',
  })
  getAdminUserInfo(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserInfo(id);
  }

  @Patch('user/:id/info')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({
    summary: '관리자 > 사용자 정보 수정',
    description: 'fileCount, maxFileSize만 수정할 수 있습니다.',
  })
  @ApiOkResponse({
    type: GetAdminUserInfoResDto,
    description: '수정된 사용자 정보 반환',
  })
  updateAdminUserInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserInfoReqDto,
  ) {
    return this.adminService.updateUserInfo(id, dto);
  }
}
