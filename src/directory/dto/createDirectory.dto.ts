import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateDirectoryDto {
  @IsNotEmpty()
  @Length(1, 100, { message: '최대 100자까지 입력가능합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9 _\-()[\]]+$/, {
    message: '한글, 영문, 숫자, 공백 ()[]-_으로 구성해주세요.',
  })
  @ApiProperty({
    description: '디렉토리명',
  })
  directoryName: string;

  @ApiProperty({
    description: '상위 디렉토리 ID',
  })
  @IsNotEmpty()
  parentId: number;
}
