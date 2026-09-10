import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ApiKeyController } from './api-key.controller';

@Module({
  imports: [AuthModule],
  controllers: [ApiKeyController],
})
export class ApiKeyModule {}
