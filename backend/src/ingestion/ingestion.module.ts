import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { Novel } from '../entities/novel.entity';
import { Chapter } from '../entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Novel, Chapter])],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}