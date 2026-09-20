import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus, Role } from '@prisma/client';
import { CreatePostDto, ReviewPostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(dto: CreatePostDto, authorId: string) {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      include: { profile: true },
    });

    if (!author) {
      throw new NotFoundException('User not found.');
    }

    // Auto-approve rule: Verified Alumni or Admin
    const isAutoApproved =
      author.profile?.verifiedAlumni ||
      author.role === Role.ADMIN;

    const initialStatus = isAutoApproved ? PostStatus.APPROVED : PostStatus.PENDING;

    const post = await this.prisma.post.create({
      data: {
        authorId,
        content: dto.content,
        imageUrl: dto.imageUrl || null,
        status: initialStatus,
      },
      include: {
        author: {
          select: {
            id: true,
            role: true,
            profile: true,
          },
        },
      },
    });

    return {
      message: isAutoApproved
        ? 'Post published successfully.'
        : 'Post submitted successfully and is pending admin review.',
      post,
      autoApproved: isAutoApproved,
    };
  }

  async getFeed(currentUserId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: PostStatus.APPROVED },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              role: true,
              profile: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where: { status: PostStatus.APPROVED } }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getModerationQueue(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: PostStatus.PENDING },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where: { status: PostStatus.PENDING } }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async reviewPost(targetPostId: string, dto: ReviewPostDto, reviewerId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: targetPostId } });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: targetPostId },
      data: {
        status: dto.status,
        reviewedById: reviewerId,
        reviewNote: dto.reviewNote,
      },
    });

    await this.prisma.actorAuditLog.create({
      data: {
        actorId: reviewerId,
        action: `POST_${dto.status}`,
        targetType: 'Post',
        targetId: targetPostId,
        note: dto.reviewNote || `Post review decision: ${dto.status}`,
      },
    });

    return {
      message: `Post marked as ${dto.status}.`,
      post: updatedPost,
    };
  }

  async deletePost(id: string, actorId: string, actorRole: Role) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (actorRole !== Role.ADMIN && post.authorId !== actorId) {
      throw new NotFoundException('You do not have permission to delete this post.');
    }

    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post deleted successfully.' };
  }
}
