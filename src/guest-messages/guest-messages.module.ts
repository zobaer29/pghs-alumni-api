import { Module } from '@nestjs/common';
import { GuestMessagesController } from './guest-messages.controller';
import { GuestMessagesService } from './guest-messages.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GuestMessagesController],
  providers: [GuestMessagesService],
})
export class GuestMessagesModule {}