import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Novel } from './entities/novel.entity';
import { Chapter } from './entities/chapter.entity';
import { IngestionModule } from './ingestion/ingestion.module';
import { NovelsModule } from './novels/novels.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgre',
      database: 'webnovelui',
      entities: [Novel, Chapter],
      synchronize: true, // Auto-creates schema. Don't use in production.
    }),
    IngestionModule,
    NovelsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}