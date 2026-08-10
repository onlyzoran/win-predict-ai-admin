import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { AuthService } from './auth.service'

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>()
    const user = this.auth.getSessionUser(req)
    if (!user) {
      throw new UnauthorizedException('Unauthorized')
    }
    ;(req as Request & { user?: unknown }).user = user
    return true
  }
}
