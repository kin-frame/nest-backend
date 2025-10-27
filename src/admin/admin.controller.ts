import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AdminGuard } from 'src/common/admin.guard';
import { AuthGuard } from 'src/common/auth.guard';
import { PagebleReqDto } from 'src/common/dto/pageble.dto';
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
  getAdminUserList(@Query() query: PagebleReqDto) {
    const sortArr: string[] = [];

    return this.adminService.getUserList(
      query.page,
      query.size,
      sortArr.concat(query.sort),
    );
  }
}
