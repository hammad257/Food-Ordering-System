import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty() name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
  
   @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';
}
