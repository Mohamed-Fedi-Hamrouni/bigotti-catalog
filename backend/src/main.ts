import { NestFactory } from '@nestjs/core';
import { setDefaultResultOrder } from 'node:dns';
import { Agent, setGlobalDispatcher } from 'undici';
import { AppModule } from './app.module';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');

  setGlobalDispatcher(
    new Agent({
      connect: {
        timeout: 60_000,
      },
    }),
  );

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Apollo-Require-Preflight',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
