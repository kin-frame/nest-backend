// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('헬스체크')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: '헬스체크 API',
    description: '서버 상태를 확인합니다.',
  })
  check() {
    return { status: 'ok', timestamp: new Date() };
  }
}
