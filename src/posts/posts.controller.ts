import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, ReviewPostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovedGuard } from '../auth/guards/approved.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('api/posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(ApprovedGuard)
  @Get()
  async getFeed(
    @GetUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getFeed(userId, Number(page) || 1, Number(limit) || 10);
  }

  @UseGuards(ApprovedGuard)
  @Post()
  async createPost(
    @Body() dto: CreatePostDto,
    @GetUser('userId') authorId: string,
  ) {
    return this.postsService.createPost(dto, authorId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('moderation')
  async getModerationQueue(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getModerationQueue(Number(page) || 1, Number(limit) || 20);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/review')
  async reviewPost(
    @Param('id') id: string,
    @Body() dto: ReviewPostDto,
    @GetUser('userId') reviewerId: string,
  ) {
    return this.postsService.reviewPost(id, dto, reviewerId);
  }

  @Delete(':id')
  async deletePost(
    @Param('id') id: string,
    @GetUser('userId') actorId: string,
    @GetUser('role') actorRole: Role,
  ) {
    return this.postsService.deletePost(id, actorId, actorRole);
  }
}
