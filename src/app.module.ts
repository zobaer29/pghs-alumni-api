import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { UploadModule } from './upload/upload.module';
import { EventsModule } from './events/events.module';
import { StatsModule } from './stats/stats.module';
import { GuestMessagesModule } from './guest-messages/guest-messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    UploadModule,
    EventsModule,
    StatsModule,
    GuestMessagesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
