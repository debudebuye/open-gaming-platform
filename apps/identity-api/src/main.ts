import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  // Ensure no global prefix interferes with /health
  app.setGlobalPrefix('');

  const port = 3001;
  app.enableShutdownHooks();
  await app.listen(port);
}

bootstrap();

