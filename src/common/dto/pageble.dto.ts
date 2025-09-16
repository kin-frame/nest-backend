import { ApiProperty } from '@nestjs/swagger';

export class PagebleReqDto {
  @ApiProperty({
    description: '페이지',
  })
  page: number;

  @ApiProperty({
    description: '페이지 사이즈',
  })
  size: number;

  @ApiProperty({
    description: '정렬방식. field,asc|desc 형식으로 사용',
  })
  sort: string[];
}

export class PagebleResDto<T> {
  content: T[];

  @ApiProperty({
    description: '응답의 현재 페이지',
  })
  page: number; // = pageNumber

  @ApiProperty({
    description: '응답의 현재 페이지 사이즈',
  })
  size: number; // = pageSize

  @ApiProperty({
    description: '전체 페이지 개수',
  })
  totalPages: number;

  @ApiProperty({
    description: '전체 아이템 개수',
  })
  totalCount: number; // = totalElements
}
