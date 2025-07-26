import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { IngestionModule } from '../ingestion/ingestion.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [IngestionModule, ConfigModule],
  controllers: [AdminController],
})
export class AdminModule {}
