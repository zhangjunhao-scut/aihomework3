import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CoreModule } from './core.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { HistoryModule } from './history/history.module';
import { ProvidersModule } from './providers/providers.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 全局限流：每 IP 每 60 秒 60 次请求，防暴力破解与滥用
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    CoreModule,
    AuthModule,
    ProvidersModule,
    ChatModule,
    ApiKeyModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [
    // 全局启用限流守卫
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
