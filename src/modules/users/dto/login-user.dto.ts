import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty() identifier: string; // email or phone
  @IsNotEmpty() password: string;
}
