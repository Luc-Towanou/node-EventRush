import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeedModule } from './feed/feed.module';
import { FeednewsModule } from './feednews/feednews.module';


@Module({
  imports: [FeedModule, FeednewsModule],
  controllers: [AppController],
  providers: [AppService],
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
