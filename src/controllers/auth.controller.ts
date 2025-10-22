import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from 'src/services/auth.service';
import { EmailService } from 'src/services/email.service';
import { OtpService } from 'src/services/otp.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @Post('send-otp')
    async sendOtp(@Body('email') email: string) {
        const otp = this.otpService.generateOtp();
        this.otpService.saveOtp(email, otp);
        await this.emailService.sendOtp(email, otp);
        return { message: 'OTP sent to Mailtrap' };
    }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @Post('verify-otp')
    async verifyOtp(@Body() body: { email: string; otp: string }) {
        const { email, otp } = body;
        const valid = this.otpService.verifyOtp(email, otp);
        if (!valid) return { success: false, message: 'Invalid or expired OTP' };

        const payload = { email };
        const token = this.jwtService.sign(payload);

        return { success: true, message: 'OTP verified, login successful', token };
    }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() body: { identifier: string; password: string }) {
        return this.authService.login(body.identifier, body.password);
    }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Body() body: { refreshToken: string }) {
        return this.authService.logout(body.refreshToken);
    }
}
