import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ReviewPostDto {
  @IsEnum(PostStatus)
  status: PostStatus;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
