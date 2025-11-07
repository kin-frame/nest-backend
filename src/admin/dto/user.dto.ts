import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { PageableReqDto } from 'src/common/dto/pageable.dto';
import { User, UserRole, UserStatus } from 'src/user/user.entity';

export class GetAdminUserListItemResDto extends PickType(User, [
  'id',
  'email',
  'name',
  'status',
  'role',
]) {}

export class GetAdminUserInfoResDto extends PickType(User, [
  'id',
  'email',
  'name',
  'picture',
  'status',
  'role',
  'fileCount',
  'maxFileSize',
  'message',
  'createdAt',
  'updatedAt',
  'lastLoginedAt',
  'lastLoginedIp',
  'sessionId',
]) {}

export class GetAdminUserListReqDto extends PageableReqDto {
  @IsOptional()
  @IsString()
  @IsIn(['id', 'email', 'name', 'status', 'role', 'all'], {
    message: 'keywordType must be one of id, email, name, status, role, all',
  })
  @ApiPropertyOptional({
    description:
      '검색 타입 (id | email | name | status | role | all). all 또는 미지정 시 name/email 범위에서 검색',
    enum: ['id', 'email', 'name', 'status', 'role', 'all'],
  })
  keywordType?: 'id' | 'email' | 'name' | 'status' | 'role' | 'all';

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '검색 키워드' })
  keyword?: string;
}

export class UpdateAdminUserInfoReqDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ description: '허용 파일 개수', example: 5 })
  fileCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({
    description: '최대 허용 파일 크기(바이트)',
    example: 10485760,
  })
  maxFileSize?: number;
}

export class UpdateUserRoleReqDto {
  @IsEnum(UserRole)
  @ApiProperty({ description: '사용자 권한', example: 'GUEST' })
  role: UserRole;
}

export class UpdateUserStatusReqDto {
  @IsEnum(UserStatus)
  @ApiProperty({ description: '사용자 상태', example: 'APPROVED' })
  status: UserStatus;
}
