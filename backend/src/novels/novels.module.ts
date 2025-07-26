import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';
import { Novel } from '../entities/novel.entity';
import { Chapter } from '../entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Novel, Chapter])],
  controllers: [NovelsController],
  providers: [NovelsService],
})
export class NovelsModule {}