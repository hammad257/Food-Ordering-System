import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email?: string; phone?: string; password: string; role?: 'USER' | 'ADMIN' }) {
  if (!data.email && !data.phone) throw new Error('EMAIL_OR_PHONE_REQUIRED');

  if (data.email) {
    const e = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (e) throw new ConflictException('Email already in use');
  }
  if (data.phone) {
    const p = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (p) throw new ConflictException('Phone already in use');
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const hashed = await bcrypt.hash(data.password, saltRounds);

  const roleToSet = data.role === 'ADMIN' ? 'ADMIN' : 'USER';

  const user = await this.prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashed,
      role: roleToSet,
      tokens: [],
    },
  });

  const { password, ...rest } = user as any;
  return rest;
}


  async findByEmailOrPhone(identifier: string) {
    if (!identifier) return null;
    if (identifier.includes('@')) {
      return this.prisma.user.findUnique({ where: { email: identifier } });
    }
    return this.prisma.user.findUnique({ where: { phone: identifier } });
  }

  async findById(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
}
