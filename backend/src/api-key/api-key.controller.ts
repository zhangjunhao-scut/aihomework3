import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CryptoUtil } from '../crypto/crypto.util';
import { PrismaService } from '../prisma.service';

class UpdateKeyDto {
  @IsString()
  @MinLength(10)
  apiKey: string;
}

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoUtil,
  ) {}

  /** 返回掩码 Key（不返回明文） */
  @Get(':provider')
  async get(@Param('provider') provider: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const row = await this.prisma.apiKey.findUnique({
      where: { userId_provider: { userId, provider } },
    });
    if (!row) return { provider, saved: false, masked: '' };
    const plain = this.crypto.decrypt(row.cipher, row.iv);
    return { provider, saved: true, masked: this.crypto.mask(plain) };
  }

  @Put(':provider')
  async set(
    @Param('provider') provider: string,
    @Body() dto: UpdateKeyDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    const { cipher, iv } = this.crypto.encrypt(dto.apiKey);
    const row = await this.prisma.apiKey.upsert({
      where: { userId_provider: { userId, provider } },
      update: { cipher, iv },
      create: { userId, provider, cipher, iv },
    });
    const plain = this.crypto.decrypt(row.cipher, row.iv);
    return { provider, saved: true, masked: this.crypto.mask(plain) };
  }

  @Delete(':provider')
  async remove(@Param('provider') provider: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    try {
      await this.prisma.apiKey.delete({
        where: { userId_provider: { userId, provider } },
      });
    } catch {}
    return { provider, saved: false };
  }
}
