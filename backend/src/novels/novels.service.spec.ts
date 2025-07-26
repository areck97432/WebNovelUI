import { Test, TestingModule } from '@nestjs/testing';
import { NovelsService } from './novels.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Novel } from '../entities/novel.entity';
import { Chapter } from '../entities/chapter.entity';
import { Repository } from 'typeorm';

describe('NovelsService', () => {
  let service: NovelsService;
  let novelRepository: Repository<Novel>;
  let chapterRepository: Repository<Chapter>;

  const mockNovelRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockChapterRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NovelsService,
        {
          provide: getRepositoryToken(Novel),
          useValue: mockNovelRepository,
        },
        {
          provide: getRepositoryToken(Chapter),
          useValue: mockChapterRepository,
        },
      ],
    }).compile();

    service = module.get<NovelsService>(NovelsService);
    novelRepository = module.get<Repository<Novel>>(getRepositoryToken(Novel));
    chapterRepository = module.get<Repository<Chapter>>(getRepositoryToken(Chapter));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of novels', async () => {
      const novels = [{ id: 1, title: 'Test Novel' }] as Novel[];
      mockNovelRepository.find.mockResolvedValue(novels);

      const result = await service.findAll();

      expect(result).toEqual(novels);
    });
  });

  describe('findOne', () => {
    it('should return a single novel', async () => {
      const novel = { id: 1, title: 'Test Novel' } as Novel;
      mockNovelRepository.findOne.mockResolvedValue(novel);

      const result = await service.findOne('test-novel');

      expect(result).toEqual(novel);
    });
  });

  describe('findChapter', () => {
    it('should return a single chapter', async () => {
      const novel = { id: 1, title: 'Test Novel' } as Novel;
      const chapter = { id: 1, title: 'Test Chapter' } as Chapter;
      mockNovelRepository.findOne.mockResolvedValue(novel);
      mockChapterRepository.findOne.mockResolvedValue(chapter);

      const result = await service.findChapter('test-novel', 1);

      expect(result).toEqual(chapter);
    });
  });
});