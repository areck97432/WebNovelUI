import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { IngestionService } from './../src/ingestion/ingestion.service';
import * as path from 'path';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('NovelsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const ingestionService = app.get(IngestionService);
    await ingestionService.scanAndIngest(path.resolve(__dirname, '../../Books'));
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/novels (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/novels')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/api/novels/:slug (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/novels/hacker')
      .expect(200)
      .expect((res) => {
        expect(res.body.slug).toBe('hacker');
        expect(res.body.chapters.length).toBeGreaterThan(0);
      });
  });

  it('/api/novels/:slug/chapter/:chapterNumber (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/novels/hacker/chapter/1')
      .expect(200)
      .expect((res) => {
        expect(res.body.chapterNumber).toBe(1);
        expect(res.body.content).toBeDefined();
      });
  });
});

describe('AdminController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/admin/scan-content (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/admin/scan-content')
      .expect(201) // NestJS returns 201 for POST by default
      .expect((res) => {
        expect(res.body.message).toBe('Content scan initiated successfully.');
      });
  });
});
