import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AdminGuard } from 'src/common/admin.guard';
import { AuthGuard } from 'src/common/auth.guard';
import { GetAdminUserListReqDto } from './dto/user.dto';
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
    console.log(query);

    return this.adminService.getUserList(
      query.page,
      query.size,
      sortArr.concat(query.sort),
      query.keywordType,
      query.keyword,
    );
  }
}
