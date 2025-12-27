import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ExtractedData } from '../database/database.types';
import { ExtractionConfidence, UnicampusExtractionResult } from './unicampus-extraction.service';

@Injectable()
export class OpenAIExtractionService {
  private readonly logger = new Logger(OpenAIExtractionService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured - OpenAI extraction disabled');
    }
  }

  /**
   * Extract contract data using OpenAI GPT-4 - Works with ANY document type/language
   */
  async extractContractData(text: string): Promise<UnicampusExtractionResult> {
    if (!this.openai) {
      throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    this.logger.log('Extracting data using OpenAI GPT-4 (Universal Document Mode)');

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using mini for cost-effectiveness
        temperature: 0, // Deterministic for data extraction
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting structured data from rental contracts, leases, and housing agreements in ANY language.

Your task is to intelligently find the following information regardless of the document's:
- Language (Italian, English, Spanish, etc.)
- Format (formal contract, simple agreement, letter)
- Terminology (tenant/guest/renter/lessee are all equivalent)

CRITICAL RULES:
1. Use null for any field not found in the document
2. Keep dates in their ORIGINAL format from the document (don't convert)
3. Extract numbers WITHOUT currency symbols (€, $, etc.) or thousand separators
4. Be intelligent about equivalent terms:
   - "tenant" = "guest" = "renter" = "lessee" = "student" = "occupant"
   - "landlord" = "lessor" = "provider" = "owner"
   - "rent" = "monthly payment" = "rental fee"
   - "deposit" = "security deposit" = "caution" = "bond"
5. Look for payment schedules in any format (tables, lists, paragraphs)
6. Extract ALL available information even if the document uses non-standard formatting`,
          },
          {
            role: 'user',
            content: `Extract all relevant information from this rental/lease document (any language):

${text}

CRITICAL: Return a FLAT JSON object (NOT nested) with these exact field names at the root level (use null if not found):

{
  "guest_name": "tenant/guest full name",
  "birth_date": "date of birth in original format",
  "birth_place": "city/place of birth",
  "fiscal_code": "tax ID / fiscal code / SSN / national ID",
  "residence_city": "current city of residence",
  "residence_address": "full current address",
  "accommodation_address": "address of rented property",
  "university": "university/college name",
  "academic_year": "e.g. 2024/2025",
  "start_date": "lease start date in original format",
  "end_date": "lease end date in original format",
  "rent_total": 12345,
  "monthly_rent": 1234,
  "security_deposit": 500,
  "number_of_installments": 3,
  "installment_1_amount": 4120,
  "installment_1_date": "first payment due date",
  "installment_2_amount": 4120,
  "installment_2_date": "second payment due date",
  "installment_3_amount": 4120,
  "installment_3_date": "third payment due date",
  "installment_4_amount": null,
  "installment_4_date": null,
  "contract_type": "type of contract",
  "provider": "landlord/company name"
}

IMPORTANT INSTALLMENT EXTRACTION RULES:
- If the document has installment payments, extract ALL installment amounts AND dates
- Number each installment sequentially: installment_1_amount, installment_2_amount, etc.
- Always extract BOTH amount and date for each installment
- Set number_of_installments to the actual count of installments found
- Include installments up to installment_10 if they exist (support up to 10 installments)
- Use null for installments that don't exist

IMPORTANT:
- Return a FLAT object with all fields at the root level
- Do NOT group fields under categories like "PERSONAL INFORMATION" or "FINANCIAL INFORMATION"
- Return ONLY valid JSON
- Use null for missing fields, not empty strings`,
          },
        ],
      });

      const responseText = completion.choices[0].message.content;

      // Log the raw OpenAI response for debugging
      this.logger.debug(`OpenAI raw response: ${responseText.substring(0, 500)}...`);

      const extractedData = JSON.parse(responseText) as ExtractedData;

      // Log extracted data for debugging
      this.logger.debug(`Parsed data - guest_name: ${extractedData.guest_name}, rent_total: ${extractedData.rent_total}`);

      // Calculate confidence based on filled fields
      const confidence = this.calculateConfidence(extractedData);

      this.logger.log(`OpenAI extraction complete. Confidence: ${(confidence.overall * 100).toFixed(1)}%`);

      return {
        data: extractedData,
        confidence,
        rawMatches: { openai_response: responseText },
      };
    } catch (error) {
      this.logger.error('OpenAI extraction failed', error);
      throw new Error(`OpenAI extraction failed: ${error.message}`);
    }
  }

  private calculateConfidence(data: ExtractedData): ExtractionConfidence {
    const fieldScores: Record<string, number> = {};
    let totalFields = 0;
    let filledFields = 0;

    // Check each field
    for (const [key, value] of Object.entries(data)) {
      totalFields++;
      const isFilled = value !== null && value !== undefined && value !== '';
      fieldScores[key] = isFilled ? 1 : 0;
      if (isFilled) filledFields++;
    }

    const overall = totalFields > 0 ? filledFields / totalFields : 0;

    return {
      overall,
      fieldScores,
    };
  }
}
