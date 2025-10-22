import { Injectable } from '@nestjs/common';

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

@Injectable()
export class OtpService {
  private otpStore = new Map<string, OtpRecord>();

  generateOtp(length = 6): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  saveOtp(email: string, otp: string) {
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.otpStore.set(email, { otp, expiresAt });
  }

  verifyOtp(email: string, otp: string): boolean {
    const record = this.otpStore.get(email);
    if (!record) return false;
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(email);
      return false;
    }
    const isValid = record.otp === otp;
    if (isValid) this.otpStore.delete(email);
    return isValid;
  }
}
