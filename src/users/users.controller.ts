import { Controller, Get, Patch, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserStatusDto, UpdateUserRoleDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApprovedGuard } from '../auth/guards/approved.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserStatus, Role } from '@prisma/client';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Update authenticated user's own profile
  @Put('me/profile')
  async updateMyProfile(
    @GetUser('userId') userId: string,
    @Body() dto: any,
  ) {
    return this.usersService.updateMyProfile(userId, dto);
  }

  @UseGuards(ApprovedGuard)
  @Get()
  async getUsers(
    @Query('status') status?: UserStatus,
    @Query('batchYear') batchYear?: number,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @GetUser('role') role?: Role,
  ) {
    return this.usersService.getUsers(
      { status, batchYear, search, page, limit },
      role || Role.MEMBER,
    );
  }

  // Admin can approve/reject pending member accounts
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @GetUser('userId') actorId: string,
  ) {
    return this.usersService.updateUserStatus(id, dto, actorId);
  }

  // Admin only role assignment
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @GetUser('userId') actorId: string,
  ) {
    return this.usersService.updateUserRole(id, dto, actorId);
  }

  // Admin only user deletion
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
