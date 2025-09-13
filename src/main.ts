import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle(`${process.env.SWAGGER_TITLE}`)
    .setDescription(`${process.env.SWAGGER_DESCRIPTION}`)
    .addBearerAuth() // JWT 인증 추가 옵션
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    console.log(`Success, listen to ${process.env.PORT}...`);
  })
  .catch(() => {
    console.log('에러 발생');
  });
