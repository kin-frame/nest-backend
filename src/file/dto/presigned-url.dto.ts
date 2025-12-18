import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetPresignedUrlReqDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '파일 최종 수정일자',
  })
  lastModified: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '파일명',
  })
  fileName: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '파일크기(Byte), input File 객체의 값 그대로',
  })
  fileSize: number;

  @IsNotEmpty()
  @ApiProperty({
    description: '파일 유형, input File 객체의 값 그대로 업로드',
  })
  fileType: string;

  @IsNotEmpty()
  @ApiProperty({
    description:
      '이미지 또는 비디오의 width. 이미지는 naturalWidth, 비디오는 videoWidth 사용',
  })
  width: number;

  @IsNotEmpty()
  @ApiProperty({
    description:
      '이미지 또는 비디오의 height. 이미지는 naturalHeight, 비디오는 videoHeight 사용',
  })
  height: number;

  @IsNotEmpty()
  @ApiProperty({
    description: '디렉토리 ID',
  })
  directoryId: number;
}

export class GetPresignedUrlResDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'S3 presigned url (PUT요청, body: multipart-form-data)',
  })
  url: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '파일 id',
  })
  id: number;
}

export class PresignedUrlReqDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '파일 아이디',
  })
  fileId: number;
}

export class PresignedUrlResDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'S3 presigned url',
  })
  url: string;
}
