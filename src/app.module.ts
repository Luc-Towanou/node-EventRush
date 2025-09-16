import { Module } from '@nestjs/common';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [FeedModule],
})
export class AppModule {}


// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { FeedModule } from './feed/feed.module';

// @Module({
//   imports: [FeedModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
