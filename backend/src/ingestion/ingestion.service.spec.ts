import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Novel } from '../entities/novel.entity';
import { Chapter } from '../entities/chapter.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';

// Mock the fs/promises module
jest.mock('fs/promises');

describe('IngestionService', () => {
  let service: IngestionService;
  let novelRepository: Repository<Novel>;
  let chapterRepository: Repository<Chapter>;

  const mockNovelRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockChapterRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
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

    service = module.get<IngestionService>(IngestionService);
    novelRepository = module.get<Repository<Novel>>(getRepositoryToken(Novel));
    chapterRepository = module.get<Repository<Chapter>>(getRepositoryToken(Chapter));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scanAndIngest', () => {
    it('should correctly ingest a new novel and its chapters', async () => {
      // Arrange
      const booksDirectory = '/fake/books';
      const novelFolder = "Emperor's Domination";
      const chapterFile = 'emperor-s-domination-chapter-1-zn.txt';
      const novelSlug = "emperor's-domination";

      (fs.readdir as jest.Mock).mockResolvedValueOnce([novelFolder]);
      (fs.stat as jest.Mock)
        .mockResolvedValueOnce({ isDirectory: () => true })
        .mockResolvedValueOnce({ isFile: () => true });
      (fs.readdir as jest.Mock).mockResolvedValueOnce([chapterFile]);
      (fs.readFile as jest.Mock).mockResolvedValueOnce('Chapter content');

      mockNovelRepository.findOne.mockResolvedValue(null);
      const newNovel = { id: 1, title: novelFolder, slug: novelSlug, totalChapters: 0 };
      mockNovelRepository.create.mockReturnValue(newNovel);
      mockNovelRepository.save.mockResolvedValue(newNovel);

      mockChapterRepository.findOne.mockResolvedValue(null);
      const newChapter = { novel: newNovel, chapterNumber: 1, title: 'Chapter 1', content: 'Chapter content' };
      mockChapterRepository.create.mockReturnValue(newChapter);
      mockChapterRepository.save.mockResolvedValue(newChapter);
      mockChapterRepository.count.mockResolvedValue(1);

      // Act
      await service.scanAndIngest(booksDirectory);

      // Assert
      expect(fs.readdir).toHaveBeenCalledWith(booksDirectory);
      expect(mockNovelRepository.findOne).toHaveBeenCalledWith({ where: { slug: novelSlug } });
      expect(mockNovelRepository.create).toHaveBeenCalledWith({
        title: novelFolder,
        slug: novelSlug,
        author: 'Unknown',
      });
      expect(mockNovelRepository.save).toHaveBeenCalledWith(newNovel);
      expect(mockChapterRepository.findOne).toHaveBeenCalledWith({ where: { novel: { id: newNovel.id }, chapterNumber: 1 } });
      expect(mockChapterRepository.create).toHaveBeenCalledWith({
        novel: newNovel,
        chapterNumber: 1,
        title: 'Chapter 1',
        content: 'Chapter content',
      });
      expect(mockChapterRepository.save).toHaveBeenCalledWith(newChapter);
      expect(mockNovelRepository.save).toHaveBeenCalledWith({ ...newNovel, totalChapters: 1 });
    });

    it('should correctly parse novel slug from folder name', () => {
      const novelFolder = 'Some Novel Name';
      const expectedSlug = 'some-novel-name';
      const actualSlug = novelFolder.toLowerCase().replace(/\s+/g, '-');
      expect(actualSlug).toEqual(expectedSlug);
    });

    it('should correctly parse chapter number from file name', () => {
      const chapterFile = 'some-novel-chapter-123-zn.txt';
      const chapterNumberMatch = chapterFile.match(/chapter-(\d+)/);
      if (chapterNumberMatch) {
        const chapterNumber = parseInt(chapterNumberMatch[1], 10);
        expect(chapterNumber).toEqual(123);
      }
    });
  });
});