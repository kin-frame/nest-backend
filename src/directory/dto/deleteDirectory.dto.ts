import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteDirectoryDto {
  @ApiProperty({ description: '삭제할 디렉토리 ID' })
  @IsNotEmpty()
  id: number;
}
