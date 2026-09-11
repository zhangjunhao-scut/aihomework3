import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
  private readonly logger = new Logger(AppConfig.name);
  private readonly isProd: boolean;

  constructor(private readonly config: ConfigService) {
    this.isProd = this.config.get<string>('NODE_ENV') === 'production';
    this.validateSecrets();
  }

  /** 启动时校验：生产环境必须显式配置 JWT_SECRET / AES_KEY，禁止用默认值 */
  private validateSecrets() {
    const jwt = this.config.get<string>('JWT_SECRET');
    const aes = this.config.get<string>('AES_KEY');
    const insecureDefaults = [
      'dev-fallback-secret',
      'dev-jwt-secret-please-change-in-production-1234567890',
    ];
    if (this.isProd) {
      if (!jwt || insecureDefaults.includes(jwt) || jwt.length < 32) {
        throw new Error(
          '生产环境必须设置强随机 JWT_SECRET（≥32 字符），禁止使用默认值',
        );
      }
      if (!aes || aes === '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef') {
        throw new Error(
          '生产环境必须设置强随机 AES_KEY（64 hex 字符），禁止使用默认值',
        );
      }
    } else {
      // 开发环境也告警
      if (!jwt || insecureDefaults.includes(jwt)) {
        this.logger.warn('⚠️ JWT_SECRET 未设置或为默认值，仅限开发环境使用');
      }
      if (!aes || aes === '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef') {
        this.logger.warn('⚠️ AES_KEY 未设置或为默认值，仅限开发环境使用');
      }
    }
  }

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
