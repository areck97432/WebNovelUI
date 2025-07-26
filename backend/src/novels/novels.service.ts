import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Novel } from '../entities/novel.entity';
import { Chapter } from '../entities/chapter.entity';

@Injectable()
export class NovelsService {
  constructor(
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async findAll(): Promise<Novel[]> {
    return this.novelRepository.find();
  }

  async findOne(slug: string): Promise<Novel | null> {
    return this.novelRepository.findOne({ where: { slug }, relations: ['chapters'] });
  }

  async findChapter(slug: string, chapterNumber: number): Promise<Chapter | null> {
    const novel = await this.novelRepository.findOne({ where: { slug } });
    if (!novel) {
      throw new NotFoundException('Novel not found');
    }
    return this.chapterRepository.findOne({ where: { novel: { id: novel.id }, chapterNumber } });
  }
}
