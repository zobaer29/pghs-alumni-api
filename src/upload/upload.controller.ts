import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovedGuard } from '../auth/guards/approved.guard';
import { IsString } from 'class-validator';

class UploadImageDto {
  @IsString()
  image: string;
}

@Controller('api/upload')
@UseGuards(JwtAuthGuard, ApprovedGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  async uploadImage(@Body() dto: UploadImageDto) {
    return this.uploadService.uploadImage(dto.image);
  }
}
