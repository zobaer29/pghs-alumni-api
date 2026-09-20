import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GuestMessageStatus, Role } from '@prisma/client';
import { GuestMessagesService } from './guest-messages.service';
import { CreateGuestMessageDto, UpdateGuestMessageDto } from './dto/guest-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('api/guest-messages')
export class GuestMessagesController {
  constructor(private guestMessagesService: GuestMessagesService) {}

  @Post()
  create(@Body() dto: CreateGuestMessageDto) {
    return this.guestMessagesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query('status') status?: GuestMessageStatus) {
    return this.guestMessagesService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGuestMessageDto,
    @GetUser('userId') adminId: string,
  ) {
    return this.guestMessagesService.update(id, dto, adminId);
  }
}