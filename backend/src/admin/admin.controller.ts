import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestionService } from '../ingestion/ingestion.service';

@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly configService: ConfigService,
  ) {}

  @Post('scan-content')
  async scanContent() {
    // In a real application, you would secure this endpoint
    // e.g., with authentication and authorization guards.
    const booksDirectory = this.configService.get<string>('BOOKS_DIRECTORY');
    await this.ingestionService.scanAndIngest(booksDirectory as string);
    return { message: 'Content scan initiated successfully.' };
  }
}
