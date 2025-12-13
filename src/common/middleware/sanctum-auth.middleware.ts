// src/common/middleware/sanctum-auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SanctumAuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: any, res: any, next: () => void) {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) throw new UnauthorizedException('Missing Authorization header');

    const token = (auth as string).replace('Bearer ', '').trim();
    if (!token) throw new UnauthorizedException('Invalid token');

    const parts = token.split('|');

    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [, plainToken] = parts;

    const hashed = crypto.createHash('sha256').update(plainToken).digest('hex');

    console.log(
     "midd hashed : ", hashed
    );
    const tokenRecord = await this.prisma.personal_access_tokens.findUnique({
      where: { token: hashed },
    });

    if (!tokenRecord) throw new UnauthorizedException('Invalid or expired token');

    // attach user id
    req.user = { id: tokenRecord.tokenable_id, type: tokenRecord.tokenable_type };
    next();
  }
}
