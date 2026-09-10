import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(AppConfig);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: config.frontendOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.use((req: any, _res: any, next: any) => {
    // 安全：避免把 Authorization / apiKey 打进日志
    const safe = { ...req.body };
    if (safe.apiKey) safe.apiKey = '***';
    new Logger('HTTP').verbose?.(
      `${req.method} ${req.url} body=${JSON.stringify(safe)}`,
    );
    next();
  });

  await app.listen(config.port);
  new Logger('Bootstrap').log(
    `后端已启动: http://localhost:${config.port}/api`,
  );
}
bootstrap();
