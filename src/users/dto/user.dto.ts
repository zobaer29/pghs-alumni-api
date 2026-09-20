import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus, Role } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
