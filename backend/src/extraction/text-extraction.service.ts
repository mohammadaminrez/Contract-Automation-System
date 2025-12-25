import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs/promises';

export interface ExtractionResult {
  text: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    fileSize?: number;
  };
}

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);

  /**
   * Extract text from a file based on its type
   * @param filePath Absolute path to the file
   * @param fileType File extension (pdf, doc, docx)
   * @returns Extracted text and metadata
   */
  async extractText(
    filePath: string,
    fileType: string,
  ): Promise<ExtractionResult> {
    this.logger.log(`Extracting text from ${fileType} file: ${filePath}`);

    const normalizedType = fileType.toLowerCase().replace('.', '');

    try {
      switch (normalizedType) {
        case 'pdf':
          return await this.extractFromPDF(filePath);
        case 'doc':
        case 'docx':
          return await this.extractFromWord(filePath);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      this.logger.error(`Text extraction failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract text from PDF file using pdf-parse
   */
  private async extractFromPDF(filePath: string): Promise<ExtractionResult> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    this.logger.log(`Extracted ${data.numpages} pages from PDF`);

    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        wordCount: this.countWords(data.text),
        fileSize: dataBuffer.length,
      },
    };
  }

  /**
   * Extract text from Word document using mammoth
   */
  private async extractFromWord(filePath: string): Promise<ExtractionResult> {
    const result = await mammoth.extractRawText({ path: filePath });

    if (result.messages.length > 0) {
      this.logger.warn(`Word extraction warnings: ${JSON.stringify(result.messages)}`);
    }

    this.logger.log(`Extracted text from Word document`);

    const stats = await fs.stat(filePath);

    return {
      text: result.value,
      metadata: {
        wordCount: this.countWords(result.value),
        fileSize: stats.size,
      },
    };
  }

  /**
   * Count words in extracted text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Clean extracted text (remove extra whitespace, normalize line breaks)
   */
  cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line breaks
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/[ \t]+/g, ' ') // Normalize spaces
      .trim();
  }
}
