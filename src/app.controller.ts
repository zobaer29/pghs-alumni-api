import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getAppInfo() {
    return {
      title: 'Pirojpur Govt High School Alumni Association API',
      status: 'Online',
      version: '1.0.0',
      frontendUrl: process.env.CLIENT_URL ?? '',
      documentation: {
        auth: '/api/auth (register, login, logout, me)',
        users: '/api/users (directory, status approval, role update)',
        posts: '/api/posts (feed, create post, moderation queue, review)',
        upload: '/api/upload (imgbb image upload)',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
