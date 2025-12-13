
import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { FeednewsService } from './feednews.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SanctumGuard } from 'src/common/guards/sanctum.guard';

@Controller('feednews')
export class FeednewsController {
  constructor(private readonly feednewsService: FeednewsService) {}

  // GET /feed?page=1&limit=20
  @ApiBearerAuth('sanctumAuth')
  @UseGuards(SanctumGuard)
  @Get()
  async getFeed(@Req() req, @Query('page') page = '1', @Query('limit') limit = '30') {
    const userId = req.user?.id;
    return this.feednewsService.getGlobalFeed(Number(userId), Number(page), Number(limit));
  }

  @ApiBearerAuth('sanctumAuth')
  @UseGuards(SanctumGuard)
  @Get('eventNews')
  async getnewsFeed(@Req() req, @Query('page') page = '1', @Query('limit') limit = '30') {
    const userId = req.user?.id;
    return this.feednewsService.getHomeFeed(Number(userId));
  }
}
