import { Injectable, BadRequestException } from '@nestjs/common';
import { uploadToImgBB } from '../utils/imgbb';

@Injectable()
export class UploadService {
  async uploadImage(imagePayload: string) {
    if (!imagePayload) {
      throw new BadRequestException('Image payload is required.');
    }

    const url = await uploadToImgBB(imagePayload);
    return {
      message: 'Image uploaded successfully.',
      url,
    };
  }
}
