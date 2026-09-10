import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('该邮箱已注册');
    const password = bcrypt.hashSync(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password },
    });
    return this.signToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    const ok = bcrypt.compareSync(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('邮箱或密码错误');
    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    const accessToken = this.jwt.sign({ sub: userId, email });
    return { accessToken, user: { id: userId, email } };
  }
}
