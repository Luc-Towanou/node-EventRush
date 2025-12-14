import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SanctumGuard } from 'src/common/guards/sanctum.guard';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // @Get()
  // async getFeed(
  //   // @Req() req,
  //   @Query('userId') userId: string,
  //   @Query('pageType') pageType: string,
  //   @Query('limit') limit = 20,
  //   @Query('cursor') cursor?: string,
  // ) {
  //   // const userId = req.user?.id;
  //   return this.feedService.getFeed(Number(userId), {
  //     // userId : Number(userId),
  //     // pageType,
  //     limit: Number(limit),
  //     cursor,
  //   });
  // }
  @Get()
  @ApiBearerAuth('sanctumAuth')
  @UseGuards(SanctumGuard)
  async getFeed(
    @Req() req,
    @Query('pageType') pageType: string,
    @Query('limit') limit = 20,
    @Query('cursor') cursor?: string,
  ) {
    const userId = req.user?.id; // injecté par ton guard/middleware

    return this.feedService.getFeed(Number(userId), {
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