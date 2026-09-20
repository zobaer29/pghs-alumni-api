import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('api')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('events')
  async getEvents() {
    return this.eventsService.getEvents();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('events')
  async createEvent(@Body() body: any, @GetUser('userId') userId: string) {
    return this.eventsService.createEvent({
      ...body,
      startsAt: new Date(body.startsAt),
      createdById: userId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }

  @Get('campaigns')
  async getCampaigns() {
    return this.eventsService.getCampaigns();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('campaigns')
  async createCampaign(@Body() body: any) {
    return this.eventsService.createCampaign({
      ...body,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    return this.eventsService.deleteCampaign(id);
  }
}
