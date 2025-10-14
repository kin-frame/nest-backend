import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GenerateThumbnailReqDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '파일 DB 아이디',
  })
  id: number;
}

export class GenerateThumbnailResDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '썸네일 생성 성공 여부',
  })
  success: boolean;
}
