import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreateHistoryDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    const row = await this.prisma.history.create({
      data: {
        userId,
        title: dto.title.slice(0, 60),
        request: JSON.stringify(dto.request),
        response: JSON.stringify(dto.response),
        durationMs: dto.durationMs ?? 0,
      },
    });
    return { id: row.id, createdAt: row.createdAt };
  }

  @Get()
  async list(@Req() req: Request) {
    const userId = (req.user as any).id;
    const rows = await this.prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      durationMs: r.durationMs,
      createdAt: r.createdAt,
      request: JSON.parse(r.request),
      response: JSON.parse(r.response),
    }));
  }

  @Get(':id')
  async one(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const r = await this.prisma.history.findFirst({
      where: { id, userId },
    });
    if (!r) return null;
    return {
      ...r,
      request: JSON.parse(r.request),
      response: JSON.parse(r.response),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    try {
      await this.prisma.history.deleteMany({ where: { id, userId } });
    } catch {}
    return { deleted: true };
  }

  @Delete()
  async clear(@Req() req: Request) {
    const userId = (req.user as any).id;
    await this.prisma.history.deleteMany({ where: { userId } });
    return { cleared: true };
  }
}
