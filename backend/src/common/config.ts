import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService) {}

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET') || 'dev-fallback-secret';
  }

  get aesKey(): string {
    return (
      this.config.get<string>('AES_KEY') ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );
  }

  get frontendOrigin(): string {
    return this.config.get<string>('FRONTEND_ORIGIN') || 'http://localhost:5173';
  }

  get allowCustomBaseUrl(): boolean {
    return this.config.get<string>('ALLOW_CUSTOM_BASEURL') === 'true';
  }

  get port(): number {
    return Number(this.config.get<string>('PORT') || '8787');
  }
}
