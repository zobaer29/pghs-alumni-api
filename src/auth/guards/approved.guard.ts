import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

@Injectable()
export class ApprovedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User context missing.');
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new ForbiddenException('Account pending approval by Admin.');
    }

    return true;
  }
}
