import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Controller('api/stats')
export class StatsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getStats() {
    const [totalMembers, totalMentors, totalEvents, distinctBatches] = await Promise.all([
      this.prisma.user.count({ where: { status: UserStatus.APPROVED } }),
      this.prisma.profile.count({ where: { isMentor: true } }),
      this.prisma.event.count(),
      this.prisma.profile.groupBy({
        by: ['batchYear'],
      }),
    ]);

    return {
      totalMembers,
      totalMentors,
      totalEvents,
      totalBatches: distinctBatches.length,
    };
  }
}
