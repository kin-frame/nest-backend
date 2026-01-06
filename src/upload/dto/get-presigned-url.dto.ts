import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetPresignedUrlReqDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '업로드 요청 Id',
  })
  id: number;
}

export class GetPresignedUrlResDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '이번에 업로드할 순서',
  })
  partNumber: number;

  @IsNotEmpty()
  @ApiProperty({
    description: '청크를 업로드할 url',
  })
  url: string;
}
