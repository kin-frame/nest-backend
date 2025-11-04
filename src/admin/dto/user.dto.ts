import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { PagebleReqDto } from 'src/common/dto/pageble.dto';
import { User } from 'src/user/user.entity';

export class GetAdminUserListItemResDto extends User {}

export class GetAdminUserListReqDto extends PagebleReqDto {
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
