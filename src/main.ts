import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config({
    path: ['.env.local', '.env'],
  });
  const app = await NestFactory.create(AppModule);
  if (process.env.IS_WORKER === '0') {
    await app.listen(3000);
  } else {
    await app.init();
  }
}
bootstrap();
