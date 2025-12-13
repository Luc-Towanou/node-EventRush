import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SanctumAuthMiddleware } from 'src/common/middleware/sanctum-auth.middleware';
import { FeednewsController } from './feednews.controller';
import { FeednewsService } from './feednews.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SanctumGuard } from 'src/common/guards/sanctum.guard';

@Module({
  imports: [PrismaModule,],
  controllers: [FeednewsController],
  providers: [FeednewsService, SanctumGuard],
  exports: [FeednewsService],
})
export class FeednewsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SanctumAuthMiddleware).forRoutes('feednews', 'personal/*');
  }
}