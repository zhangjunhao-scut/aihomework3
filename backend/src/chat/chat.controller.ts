import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatRequest } from '../adapters/adapter.interface';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  @HttpCode(200)
  async send(@Body() req: ChatRequest, @Req() r: Request) {
    const userId = (r.user as any).id;
    return this.chat.chat(userId, req);
  }

  @Post('stream')
  async stream(@Body() req: ChatRequest, @Req() r: Request, @Res() res: Response) {
    const userId = (r.user as any).id;
    await this.chat.chatStream(userId, req, res);
  }
}
