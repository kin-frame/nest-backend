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
import { ApiPageableResponse } from 'src/common/dto/pageable.dto';
import { User, UserStatus } from 'src/user/user.entity';
import {
  GetAdminUserInfoResDto,
  GetAdminUserListReqDto,
  UpdateAdminUserInfoReqDto,
  UpdateUserRoleReqDto,
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
  @ApiPageableResponse(User)
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

  @Patch('user/:id/role')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({
    summary: '관리자 > 사용자 권한 수정',
    description: '사용자의 권한을 수정합니다.',
  })
  @ApiOkResponse({
    type: GetAdminUserInfoResDto,
    description: '수정된 사용자 정보 반환',
  })
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleReqDto,
  ) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Patch('user/:id/approve')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({
    summary: '관리자 > 사용자 회원가입 신청 허용',
    description: '사용자의 회원가입 신청상태를 APPROVED로 변경합니다.',
  })
  @ApiOkResponse({
    type: GetAdminUserInfoResDto,
    description: '수정된 사용자 정보 반환',
  })
  approveUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.updateUserStatus(id, {
      status: UserStatus.APPROVED,
    });
  }

  @Patch('user/:id/reject')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({
    summary: '관리자 > 사용자 회원가입 신청 거절',
    description: '사용자의 회원가입 신청상태를 REJECTED로 변경합니다.',
  })
  @ApiOkResponse({
    type: GetAdminUserInfoResDto,
    description: '수정된 사용자 정보 반환',
  })
  rejectUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.updateUserStatus(id, {
      status: UserStatus.REJECTED,
    });
  }
}
