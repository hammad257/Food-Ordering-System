import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.MAILTRAP_PORT) || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: '"Food Ordering App" <no-reply@foodapp.com>',
      to: email,
      subject: 'Your OTP Code',
      html: `<h3>Your OTP is <b>${otp}</b></h3>`,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  }
}
