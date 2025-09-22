import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle(`${process.env.SWAGGER_TITLE}`)
    .setDescription(`${process.env.SWAGGER_DESCRIPTION}`)
    .addBearerAuth() // JWT 인증 추가 옵션
    .build();

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CLIENT_URL, // Next 프론트 주소
    credentials: true, // 쿠키 허용
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    console.dir(`Success, listen to ${process.env.PORT}...`);
  })
  .catch(() => {
    console.error('에러 발생');
  });
