// src/modules/health/health.controller.ts
import { Controller, Get, Sse } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';

import { concat, delay, from, interval, map, of, zip } from 'rxjs';

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

  @Sse('stream')
  @ApiOperation({
    summary: '헬스체크 Stream API',
    description: '서버 상태를 확인합니다. 응답을 stream으로 제공합니다.',
  })
  @ApiProduces('text/event-stream')
  stream() {
    const sentence =
      '오늘은 아침부터 맑고 상쾌한 바람이 불어서 기분이 참 좋습니다.\n커피 한 잔을 마시며 하루를 천천히 시작하는 이런 여유가 참 오랜만이네요.';
    const chars = sentence.split('');

    // 1️⃣ "message_start" 이벤트
    const startEvent = of({
      type: 'message_start',
      data: { id: 'msg_' + Date.now(), at: new Date().toISOString() },
    });

    // 2️⃣ 문자 하나씩 보내는 "content_block_delta" 이벤트
    const contentEvents = zip(interval(16), from(chars)).pipe(
      map(([, char], i) => ({
        type: 'content_block_delta',
        data: { index: i, char, at: new Date().toISOString() },
      })),
    );

    // 3️⃣ 종료 알림 "message_stop"
    const endEvent = of({
      type: 'message_stop',
      data: { reason: 'finished', at: new Date().toISOString() },
    }).pipe(delay(100));

    // 4️⃣ 스트림을 순서대로 연결
    return concat(startEvent, contentEvents, endEvent);
  }
}
