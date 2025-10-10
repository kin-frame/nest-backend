import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserProfileResDto {
  @ApiProperty({
    description: '유저 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '유저 이메일',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
