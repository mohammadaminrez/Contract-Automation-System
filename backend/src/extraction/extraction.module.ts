import { Module } from '@nestjs/common';
import { TextExtractionService } from './text-extraction.service';
import { UnicampusExtractionService } from './unicampus-extraction.service';

@Module({
  providers: [TextExtractionService, UnicampusExtractionService],
  exports: [TextExtractionService, UnicampusExtractionService],
})
export class ExtractionModule {}
