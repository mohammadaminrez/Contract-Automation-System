import { Module } from '@nestjs/common';
import { TextExtractionService } from './text-extraction.service';
import { UnicampusExtractionService } from './unicampus-extraction.service';
import { OpenAIExtractionService } from './openai-extraction.service';

@Module({
  providers: [TextExtractionService, UnicampusExtractionService, OpenAIExtractionService],
  exports: [TextExtractionService, UnicampusExtractionService, OpenAIExtractionService],
})
export class ExtractionModule {}
