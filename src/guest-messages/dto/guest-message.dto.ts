import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { GuestMessageStatus } from '@prisma/client';

export class CreateGuestMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  message: string;
}

export class UpdateGuestMessageDto {
  @IsEnum(GuestMessageStatus)
  status: GuestMessageStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}