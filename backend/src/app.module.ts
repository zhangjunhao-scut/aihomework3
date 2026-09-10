import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    CoreModule,
    AuthModule,
    ProvidersModule,
    ChatModule,
    ApiKeyModule,
    HistoryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
