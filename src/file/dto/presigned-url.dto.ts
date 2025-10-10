import { ApiProperty } from '@nestjs/swagger';

export class GetPresignedUrlReqDto {
  @ApiProperty({
    description: '파일 최종 수정일자',
  })
  lastModified: string;

  @ApiProperty({
    description: '파일명',
  })
  fileName: string;

  @ApiProperty({
    description: '파일크기(Byte), input File 객체의 값 그대로',
  })
  fileSize: number;

  @ApiProperty({
    description: '파일 유형, input File 객체의 값 그대로 업로드',
  })
  fileType: string;

  @ApiProperty({
    description:
      '이미지 또는 비디오의 width. 이미지는 naturalWidth, 비디오는 videoWidth 사용',
  })
  width: number;

  @ApiProperty({
    description:
      '이미지 또는 비디오의 height. 이미지는 naturalHeight, 비디오는 videoHeight 사용',
  })
  height: number;
}

export class GetPresignedUrlResDto {
  @ApiProperty({
    description: 'S3 presigned url (PUT요청, body: multipart-form-data)',
  })
  url: string;

  @ApiProperty({
    description: '파일 id',
  })
  id: number;
}
