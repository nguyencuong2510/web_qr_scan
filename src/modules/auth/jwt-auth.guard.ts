import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();

    if (err || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = user;
    return user;
  }
}
