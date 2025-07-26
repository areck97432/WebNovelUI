import { Controller, Get, Param } from '@nestjs/common';
import { NovelsService } from './novels.service';

@Controller('api/novels')
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Get()
  findAll() {
    return this.novelsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.novelsService.findOne(slug);
  }

  @Get(':slug/chapter/:chapterNumber')
  findChapter(
    @Param('slug') slug: string,
    @Param('chapterNumber') chapterNumber: string,
  ) {
    return this.novelsService.findChapter(slug, +chapterNumber);
  }
}