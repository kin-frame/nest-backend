import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CompleteUploadReqDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '파일 DB 아이디',
  })
  id: number;
}

export class CompleteUploadResDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '업로드 성공 여부',
  })
  success: boolean;
}
