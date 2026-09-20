import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus, Role } from '@prisma/client';
import { UpdateUserStatusDto, UpdateUserRoleDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(query: { status?: UserStatus; batchYear?: number; search?: string; page?: number; limit?: number }, userRole: Role) {
    const pageNum = query.page || 1;
    const limitNum = query.limit || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (query.status) {
      if (userRole === Role.ADMIN) {
        where.status = query.status;
      } else {
        where.status = UserStatus.APPROVED;
      }
    } else if (userRole !== Role.ADMIN) {
      where.status = UserStatus.APPROVED;
    }

    if (query.batchYear) {
      where.profile = {
        ...where.profile,
        batchYear: Number(query.batchYear),
      };
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { profile: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { profile: { occupation: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          profile: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async updateUserStatus(targetUserId: string, dto: UpdateUserStatusDto, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isApproval = dto.status === UserStatus.APPROVED;

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: dto.status,
        profile: {
          update: {
            verifiedAlumni: isApproval ? true : undefined,
          },
        },
      },
      include: { profile: true },
    });

    await this.prisma.actorAuditLog.create({
      data: {
        actorId,
        action: `USER_STATUS_UPDATE_${dto.status}`,
        targetType: 'User',
        targetId: targetUserId,
        note: dto.note || `User status changed to ${dto.status}`,
      },
    });

    return {
      message: `User status updated to ${dto.status}.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        profile: updatedUser.profile,
      },
    };
  }

  async updateUserRole(targetUserId: string, dto: UpdateUserRoleDto, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: dto.role },
      include: { profile: true },
    });

    await this.prisma.actorAuditLog.create({
      data: {
        actorId,
        action: `USER_ROLE_UPDATE_${dto.role}`,
        targetType: 'User',
        targetId: targetUserId,
        note: `User role updated to ${dto.role}`,
      },
    });

    return {
      message: `User role updated to ${dto.role}.`,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully.' };
  }

  async updateMyProfile(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const {
      fullName,
      batchYear,
      rollNumber,
      bio,
      photoUrl,
      coverPhotoUrl,
      occupation,
      organization,
      city,
      country,
      skills,
      linkedinUrl,
      facebookUrl,
      isMentor,
      phone,
      hidePhone,
      hideEmail,
    } = data;

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const updatedProfile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: fullName || 'Alumni Member',
        batchYear: batchYear ? Number(batchYear) : 2020,
        rollNumber,
        bio,
        photoUrl,
        coverPhotoUrl,
        occupation,
        organization,
        city,
        country,
        skills: parsedSkills || [],
        linkedinUrl,
        facebookUrl,
        isMentor: Boolean(isMentor),
        phone,
        hidePhone: hidePhone !== undefined ? Boolean(hidePhone) : true,
        hideEmail: hideEmail !== undefined ? Boolean(hideEmail) : true,
      },
      update: {
        fullName: fullName !== undefined ? fullName : undefined,
        batchYear: batchYear ? Number(batchYear) : undefined,
        rollNumber: rollNumber !== undefined ? rollNumber : undefined,
        bio: bio !== undefined ? bio : undefined,
        photoUrl: photoUrl !== undefined ? photoUrl : undefined,
        coverPhotoUrl: coverPhotoUrl !== undefined ? coverPhotoUrl : undefined,
        occupation: occupation !== undefined ? occupation : undefined,
        organization: organization !== undefined ? organization : undefined,
        city: city !== undefined ? city : undefined,
        country: country !== undefined ? country : undefined,
        skills: parsedSkills !== undefined ? parsedSkills : undefined,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : undefined,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : undefined,
        isMentor: isMentor !== undefined ? Boolean(isMentor) : undefined,
        phone: phone !== undefined ? phone : undefined,
        hidePhone: hidePhone !== undefined ? Boolean(hidePhone) : undefined,
        hideEmail: hideEmail !== undefined ? Boolean(hideEmail) : undefined,
      },
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: true,
      },
    });

    return {
      message: 'Profile updated successfully.',
      user: updatedUser,
    };
  }
}
