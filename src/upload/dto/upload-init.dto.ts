import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { GetPresignedUrlReqDto } from 'src/file/dto/presigned-url.dto';

export class UploadInitReqDto extends GetPresignedUrlReqDto {}

export class UploadInitResDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'S3 Upload Id',
  })
  uploadId: string;
}
