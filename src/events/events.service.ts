import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getEvents() {
    return this.prisma.event.findMany({
      orderBy: { startsAt: 'asc' },
    });
  }

  async createEvent(data: {
    title: string;
    description: string;
    location?: string;
    startsAt: Date;
    coverUrl?: string;
    images?: string[];
    youtubeUrl?: string;
    createdById: string;
  }) {
    return this.prisma.event.create({
      data,
    });
  }

  async getCampaigns() {
    return this.prisma.campaign.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaign(data: {
    title: string;
    description: string;
    goalAmount?: number;
    startsAt: Date;
    endsAt?: Date;
    coverUrl?: string;
    images?: string[];
    youtubeUrl?: string;
  }) {
    return this.prisma.campaign.create({
      data,
    });
  }

  async deleteEvent(id: string) {
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted successfully.' };
  }

  async deleteCampaign(id: string) {
    await this.prisma.campaign.delete({ where: { id } });
    return { message: 'Campaign deleted successfully.' };
  }
}
