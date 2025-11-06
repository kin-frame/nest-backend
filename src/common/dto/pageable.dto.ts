import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PageableReqDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '페이지',
  })
  page: number;

  @IsNotEmpty()
  @ApiProperty({
    description: '페이지 사이즈',
  })
  size: number;

  @IsNotEmpty()
  @ApiProperty({
    description: '정렬방식. field,asc|desc 형식으로 사용',
  })
  sort: string[];
}

export class PageableResDto<T> {
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

// Helper: build an ApiOkResponse that binds T at usage time
export const ApiPageableResponse = <TModel extends new (...args: any[]) => any>(
  model: TModel,
) =>
  applyDecorators(
    ApiExtraModels(PageableResDto, model),
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(PageableResDto) }],
        properties: {
          content: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
    }),
  );
