import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Novel } from '../entities/novel.entity';
import { Chapter } from '../entities/chapter.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async scanAndIngest(booksDirectory: string) {
    const novelFolders = await fs.readdir(booksDirectory);

    for (const novelFolder of novelFolders) {
      const novelFolderPath = path.join(booksDirectory, novelFolder);
      const stat = await fs.stat(novelFolderPath);

      if (stat.isDirectory()) {
        const novelSlug = novelFolder.toLowerCase().replace(/\s+/g, '-');
        let novel = await this.novelRepository.findOne({ where: { slug: novelSlug } });

        if (!novel) {
          novel = this.novelRepository.create({
            title: novelFolder,
            slug: novelSlug,
            author: 'Unknown', // Placeholder
          });
          await this.novelRepository.save(novel);
        }

        const chapterFiles = await fs.readdir(novelFolderPath);
        for (const chapterFile of chapterFiles) {
          const chapterFilePath = path.join(novelFolderPath, chapterFile);
          const chapterFileStat = await fs.stat(chapterFilePath);

          if (chapterFileStat.isFile() && chapterFile.endsWith('.txt')) {
            const chapterNumberMatch = chapterFile.match(/chapter-(\d+)/);
            if (chapterNumberMatch) {
              const chapterNumber = parseInt(chapterNumberMatch[1], 10);

              const existingChapter = await this.chapterRepository.findOne({ where: { novel: { id: novel.id }, chapterNumber } });

              if (!existingChapter) {
                const content = await fs.readFile(chapterFilePath, 'utf-8');
                const chapter = this.chapterRepository.create({
                  novel,
                  chapterNumber,
                  title: `Chapter ${chapterNumber}`,
                  content,
                });
                await this.chapterRepository.save(chapter);

                novel.totalChapters = (await this.chapterRepository.count({ where: { novel: { id: novel.id } } }));
                await this.novelRepository.save(novel);
              }
            }
          }
        }
      }
    }
  }
}
