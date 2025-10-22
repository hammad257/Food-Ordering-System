import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from 'src/services/auth.service';
import { JwtStrategy } from 'src/common/jwt.strategy';
import { AuthController } from 'src/controllers/auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from 'src/services/email.service';
import { OtpService } from 'src/services/otp.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService): Promise<any> => ({
        secret: cfg.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') || process.env.JWT_EXPIRES_IN || '900s' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    PrismaModule,
  ],
  providers: [AuthService, JwtStrategy, EmailService, OtpService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
