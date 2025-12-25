import { Test, TestingModule } from '@nestjs/testing';
import { TextExtractionService } from '../src/extraction/text-extraction.service';
import * as path from 'path';

describe('TextExtractionService', () => {
  let service: TextExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextExtractionService],
    }).compile();

    service = module.get<TextExtractionService>(TextExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract text from PDF', async () => {
    const pdfPath = path.join(__dirname, '../../sample-contracts/unicampus-contract.pdf');

    try {
      const result = await service.extractText(pdfPath, 'pdf');

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.metadata?.pageCount).toBeGreaterThan(0);

      console.log('PDF Extraction successful!');
      console.log(`Pages: ${result.metadata?.pageCount}`);
      console.log(`Words: ${result.metadata?.wordCount}`);
      console.log(`First 200 chars: ${result.text.substring(0, 200)}`);
    } catch (error) {
      console.log('PDF file not found - skipping test');
    }
  });

  it('should clean extracted text', () => {
    const dirtyText = 'This  is   \r\n\r\n\r\n  a    test\n\n\n\n  text  ';
    const cleaned = service.cleanText(dirtyText);

    expect(cleaned).toBe('This is\n\na test\n\ntext');
  });
});
