import { ApiProperty } from '@nestjs/swagger';

export class CompleteUploadReqDto {
  @ApiProperty({
    description: '파일 DB 아이디',
  })
  id: number;
}

export class CompleteUploadResDto {
  @ApiProperty({
    description: '업로드 성공 여부',
  })
  success: boolean;
}
