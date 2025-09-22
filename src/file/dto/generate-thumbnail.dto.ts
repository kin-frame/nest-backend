import { ApiProperty } from '@nestjs/swagger';

export class GenerateThumbnailReqDto {
  @ApiProperty({
    description: '파일 DB 아이디',
  })
  id: number;
}

export class GenerateThumbnailResDto {
  @ApiProperty({
    description: '썸네일 생성 성공 여부',
  })
  success: boolean;
}
