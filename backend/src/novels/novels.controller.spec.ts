import { Test, TestingModule } from '@nestjs/testing';
import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';

describe('NovelsController', () => {
  let controller: NovelsController;
  let service: NovelsService;

  const mockNovelsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findChapter: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NovelsController],
      providers: [
        {
          provide: NovelsService,
          useValue: mockNovelsService,
        },
      ],
    }).compile();

    controller = module.get<NovelsController>(NovelsController);
    service = module.get<NovelsService>(NovelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call the service to find all novels', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call the service to find a single novel', async () => {
      await controller.findOne('test-novel');
      expect(service.findOne).toHaveBeenCalledWith('test-novel');
    });
  });

  describe('findChapter', () => {
    it('should call the service to find a single chapter', async () => {
      await controller.findChapter('test-novel', '1');
      expect(service.findChapter).toHaveBeenCalledWith('test-novel', 1);
    });
  });
});