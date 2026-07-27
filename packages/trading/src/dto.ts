import { IsString, IsEnum, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { OrderSide, OrderType } from './enums';

export class PlaceOrderDto {
  @IsString() instrumentId!: string;
  @IsEnum(OrderSide) side!: OrderSide;
  @IsEnum(OrderType) type!: OrderType;
  @IsNumber() @IsPositive() quantity!: number;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsNumber() @Min(0) stopPrice?: number;
}
