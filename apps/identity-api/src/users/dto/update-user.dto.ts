import { IsEmail, IsOptional, IsString, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
