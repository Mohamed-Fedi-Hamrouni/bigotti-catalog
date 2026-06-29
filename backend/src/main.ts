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
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
