import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AppConfig } from '../common/config';

/**
 * API Key 加解密工具：AES-256-GCM
 * 密文与 iv 存数据库；Key 仅在内存解密使用，不写日志。
 */
@Injectable()
export class CryptoUtil {
  constructor(private readonly config: AppConfig) {}

  private getKey(): Buffer {
    const raw = this.config.aesKey;
    // 取前 32 字节作为 AES-256 key
    return Buffer.from(raw.slice(0, 64).padEnd(64, '0'), 'hex');
  }

  encrypt(plain: string): { cipher: string; iv: string } {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getKey(), iv);
    const enc = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    // 把 tag 拼到密文尾部，便于解密
    const combined = Buffer.concat([enc, tag]).toString('base64');
    return { cipher: combined, iv: iv.toString('base64') };
  }

  decrypt(cipher: string, iv: string): string {
    const buf = Buffer.from(cipher, 'base64');
    const ivBuf = Buffer.from(iv, 'base64');
    const tag = buf.subarray(buf.length - 16);
    const enc = buf.subarray(0, buf.length - 16);
    const decipher = createDecipheriv('aes-256-gcm', this.getKey(), ivBuf);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([
      decipher.update(enc),
      decipher.final(),
    ]);
    return dec.toString('utf8');
  }

  /** 掩码展示：保留前 3 与后 4 */
  mask(plain: string): string {
    if (!plain || plain.length <= 8) return '****';
    return `${plain.slice(0, 3)}****${plain.slice(-4)}`;
  }
}
