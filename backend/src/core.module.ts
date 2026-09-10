import { Global, Module } from '@nestjs/common';
import { AppConfig } from './common/config';
import { PrismaService } from './prisma.service';
import { CryptoUtil } from './crypto/crypto.util';

@Global()
@Module({
  providers: [AppConfig, PrismaService, CryptoUtil],
  exports: [AppConfig, PrismaService, CryptoUtil],
})
export class CoreModule {}
