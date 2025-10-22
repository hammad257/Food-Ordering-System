import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.usersService.findByEmailOrPhone(identifier);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user;
  }

  private generateAccessToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  private async createRefreshTokenRecord(userId: string) {
   
    const random = randomBytes(64).toString('hex'); 
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const tokenHash = await bcrypt.hash(random, saltRounds);

    const expiresDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
    const expiresAt = addDays(new Date(), expiresDays);

    const rec = await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt, revoked: false },
    });

   
    return `${rec.id}.${random}`;
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshTokenRecord(user.id);


    const { password: _p, ...safe } = user as any;
    return { user: safe, accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token required');
    const [id, random] = refreshToken.split('.');
    if (!id || !random) throw new UnauthorizedException('Invalid refresh token format');

    const rec = await this.prisma.refreshToken.findUnique({ where: { id } });
    if (!rec || rec.revoked || rec.expiresAt <= new Date()) throw new UnauthorizedException('Invalid or expired refresh token');

    const ok = await bcrypt.compare(random, rec.tokenHash);
    if (!ok) throw new UnauthorizedException('Invalid refresh token');


    await this.prisma.refreshToken.update({ where: { id }, data: { revoked: true } });


    const newRefreshToken = await this.createRefreshTokenRecord(rec.userId);

    const user = await this.usersService.findById(rec.userId);
    const accessToken = this.generateAccessToken(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token required');
    const [id, random] = refreshToken.split('.');
    if (!id) return { success: true };

    const rec = await this.prisma.refreshToken.findUnique({ where: { id } });
    if (!rec) return { success: true };

    await this.prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
    return { success: true };
  }
}
