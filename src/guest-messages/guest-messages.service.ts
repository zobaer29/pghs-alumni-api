import { Injectable, NotFoundException } from '@nestjs/common';
import { GuestMessageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestMessageDto, UpdateGuestMessageDto } from './dto/guest-message.dto';

@Injectable()
export class GuestMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGuestMessageDto) {
    return this.prisma.guestMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        message: dto.message.trim(),
      },
    });
  }

  async findAll(status?: GuestMessageStatus) {
    return this.prisma.guestMessage.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateGuestMessageDto, adminId: string) {
    const existing = await this.prisma.guestMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Guest message not found.');

    const updated = await this.prisma.guestMessage.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedAt: dto.status === GuestMessageStatus.RESOLVED ? new Date() : null,
        resolvedBy: dto.status === GuestMessageStatus.RESOLVED ? adminId : null,
      },
    });

    await this.prisma.actorAuditLog.create({
      data: {
        actorId: adminId,
        action: `GUEST_MESSAGE_${dto.status}`,
        targetType: 'GuestMessage',
        targetId: id,
        note: dto.note || `Guest message marked as ${dto.status}.`,
      },
    });

    return updated;
  }
}