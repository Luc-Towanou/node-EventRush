import { Controller, Get, Query, Req } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeed(
    // @Req() req,
    @Query('userId') userId: string,
    @Query('pageType') pageType: string,
    @Query('limit') limit = 20,
    @Query('cursor') cursor?: string,
  ) {
    // const userId = req.user?.id;
    return this.feedService.getFeed(Number(userId), {
      // userId : Number(userId),
      // pageType,
      limit: Number(limit),
      cursor,
    });
  }
}


// import { Controller, Get, Query } from '@nestjs/common';
// import { FeedService } from './feed.service';

// @Controller('feed')
// export class FeedController {
//   constructor(private readonly feedService: FeedService) {}

//   @Get()
//   async getFeed(
//     @Query('limit') limit = 20,
//     @Query('pageType') pageType: string,
//     @Query('cursor') cursor?: number,
//   ) {
//     return this.feedService.getFeed(Number(limit), pageType, cursor);
//   }
// }