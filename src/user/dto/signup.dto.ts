import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length } from 'class-validator';

export enum SignupStatus {
  SUBMIT = 'SUBMIT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export class UserSignupDto {
  @ApiProperty({
    description: '회원 이름 (2~20자)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  name: string;

  @ApiProperty({
    description: '회원가입 요청 메시지 300자 이하(필수)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 300)
  message: string;
}

export class UserSignupCheckResDto {
  @ApiProperty({
    description: '회원가입 상태 ',
    enum: SignupStatus, // Swagger enum으로 표시
  })
  status: SignupStatus;
}
