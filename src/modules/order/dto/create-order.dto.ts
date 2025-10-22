import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
