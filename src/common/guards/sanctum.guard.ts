// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';

// @Injectable()
// export class SanctumGuard implements CanActivate {
//   constructor(private prisma: PrismaService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();

//     const header = request.headers['authorization'];

//     if (!header) throw new UnauthorizedException('Missing Authorization header');

//     // header = "Bearer xxxxx"
//     const token = header.replace('Bearer ', '').trim();

//     if (!token) throw new UnauthorizedException('Invalid token format');

//     // Sanctum token format = id|plainTextToken
//     const [id, plain] = token.split('|');

//     if (!id || !plain)
//       throw new UnauthorizedException('Invalid Sanctum token format');

//     // Trouver le token en base
//     const tokenRow = await this.prisma.personal_access_tokens.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!tokenRow) throw new UnauthorizedException('Token not found');

//     // Vérifier le hash comme Sanctum
//     const crypto = await import('crypto');
//     const hashed = crypto
//       .createHash('sha256')
//       .update(plain)
//       .digest('hex');

//     console.log(
//       hashed
//     );
//     if (hashed !== tokenRow.token)
//       throw new UnauthorizedException('Invalid token');

//     // Le token est valide → attacher l'utilisateur
//     request.user = await this.prisma.utilisateurs.findUnique({
//       where: { id: tokenRow.tokenable_id },
//     });

//     if (!request.user) throw new UnauthorizedException('User not found');

//     return true;
//   }
// }

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class SanctumGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const parts = token.split('|');

    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [, plainToken] = parts;

    const hashedToken = createHash('sha256')
      .update(plainToken)
      .digest('hex');

    console.log(
     "guard hashed : ", hashedToken
    );
    const tokenRecord = await this.prisma.personal_access_tokens.findFirst({
      where: {
        token: hashedToken,
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = {
      id: tokenRecord.tokenable_id,
      type: tokenRecord.tokenable_type,
    };

    return true;
  }
}
