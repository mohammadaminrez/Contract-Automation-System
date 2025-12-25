import { Injectable, Logger } from '@nestjs/common';
import { ExtractedData } from '../database/database.types';

export interface ExtractionConfidence {
  overall: number;
  fieldScores: Record<string, number>;
}

export interface UnicampusExtractionResult {
  data: ExtractedData;
  confidence: ExtractionConfidence;
  rawMatches: Record<string, any>;
}

@Injectable()
export class UnicampusExtractionService {
  private readonly logger = new Logger(UnicampusExtractionService.name);

  /**
   * Extract structured data from Unicampus contract text using regex patterns
   */
  async extractContractData(text: string): Promise<UnicampusExtractionResult> {
    this.logger.log('Extracting data from Unicampus contract');

    const rawMatches: Record<string, any> = {};
    const fieldScores: Record<string, number> = {};

    // Extract guest name
    const guestNameMatch = text.match(
      /(?:E:\s*)?Il\/La Sig\.\/Sig\.ra\s+([A-Z][A-Z\s]+),?\s+nato\/a/i
    );
    const guestName = guestNameMatch?.[1]?.trim();
    rawMatches.guestName = guestNameMatch;
    fieldScores.guestName = guestName ? 1 : 0;

    // Extract birth date and place
    const birthMatch = text.match(
      /nato\/a\s+a\s+([A-Z\s]+)\s+il\s+(\d{2}\/\d{2}\/\d{4})/i
    );
    const birthPlace = birthMatch?.[1]?.trim();
    const birthDate = birthMatch?.[2];
    rawMatches.birthInfo = birthMatch;
    fieldScores.birthDate = birthDate ? 1 : 0;

    // Extract fiscal code
    const fiscalCodeMatch = text.match(/C\.F\.\s+([A-Z0-9]{16})/i);
    const fiscalCode = fiscalCodeMatch?.[1];
    rawMatches.fiscalCode = fiscalCodeMatch;
    fieldScores.fiscalCode = fiscalCode ? 1 : 0;

    // Extract residence address
    const residenceMatch = text.match(
      /residente in\s+([A-Z\s]+),\s+([A-Z\s]+\d+)/i
    );
    const residenceCity = residenceMatch?.[1]?.trim();
    const residenceAddress = residenceMatch?.[2]?.trim();
    rawMatches.residence = residenceMatch;
    fieldScores.residence = residenceAddress ? 1 : 0;

    // Extract total rent (retta)
    const rentMatch = text.match(
      /retta\s+di\s+euro\s+([\d.,]+)/i
    );
    const rentTotal = rentMatch ? parseFloat(rentMatch[1].replace(',', '.')) : null;
    rawMatches.rentTotal = rentMatch;
    fieldScores.rentTotal = rentTotal ? 1 : 0;

    // Extract installment structure
    const installmentsMatch = text.match(/in numero (\d+) rate/i);
    const numberOfInstallments = installmentsMatch ? parseInt(installmentsMatch[1]) : null;
    rawMatches.installments = installmentsMatch;

    // Extract individual installment amounts
    const installment1Match = text.match(/€(\d+)\s+prima rata entro il (\d{2} \w+ \d{4}|\d{2}\/\d{2}\/\d{4})/i);
    const installment2Match = text.match(/€(\d+)\s+seconda rata entro il (\d{2} \w+ \d{4}|\d{2}\/\d{2}\/\d{4})/i);
    const installment3Match = text.match(/€(\d+)\s+terza rata entro il (\d{2} \w+ \d{4}|\d{2}\/\d{2}\/\d{4})/i);

    rawMatches.installment1 = installment1Match;
    rawMatches.installment2 = installment2Match;
    rawMatches.installment3 = installment3Match;

    // Extract deposit (deposito cauzionale) - look for perdita di €250 pattern
    const depositMatch = text.match(
      /perdita\s+di\s+€\s*([\d.,]+)/i
    );
    const securityDeposit = depositMatch ? parseFloat(depositMatch[1].replace(',', '.')) : null;
    rawMatches.securityDeposit = depositMatch;
    fieldScores.securityDeposit = securityDeposit ? 1 : 0;

    // Extract contract period
    const periodMatch = text.match(
      /godimento.*?dal\s+(\d{1,2}\s+\w+\s+\d{4}),?\s+al\s+(\d{1,2}\s+\w+\s+\d{4})/i
    );
    const startDate = periodMatch?.[1];
    const endDate = periodMatch?.[2];
    rawMatches.period = periodMatch;
    fieldScores.dates = (startDate && endDate) ? 1 : 0;

    // Extract accommodation address
    const accommodationMatch = text.match(
      /Via\s+Nomentum\s+([\d\/]+)/i
    ) || text.match(/immobile\s+in\s+Roma,\s+Via\s+([A-Za-z\s]+\d+[\d\/]*)/i);
    const accommodationAddress = accommodationMatch ? `Via Nomentum ${accommodationMatch[1] || accommodationMatch[1]}` : null;
    rawMatches.accommodation = accommodationMatch;
    fieldScores.accommodationAddress = accommodationAddress ? 1 : 0;

    // Extract university info
    const universityMatch = text.match(
      /Università\s+([A-Z]+).*?anno accademico\s+([\d\/]+)/i
    );
    const university = universityMatch?.[1];
    const academicYear = universityMatch?.[2];
    rawMatches.university = universityMatch;

    // Calculate overall confidence
    const totalFields = Object.keys(fieldScores).length;
    const successfulFields = Object.values(fieldScores).reduce((a, b) => a + b, 0);
    const overallConfidence = totalFields > 0 ? successfulFields / totalFields : 0;

    const extractedData: ExtractedData = {
      guest_name: guestName || undefined,
      guest_email: undefined, // Not typically in contract
      guest_phone: undefined, // Not typically in contract
      birth_date: birthDate,
      birth_place: birthPlace,
      fiscal_code: fiscalCode,
      residence_city: residenceCity,
      residence_address: residenceAddress,
      accommodation_address: accommodationAddress || undefined,
      rent_total: rentTotal || undefined,
      number_of_installments: numberOfInstallments || undefined,
      installment_1_amount: installment1Match ? parseFloat(installment1Match[1]) : undefined,
      installment_1_date: installment1Match?.[2],
      installment_2_amount: installment2Match ? parseFloat(installment2Match[1]) : undefined,
      installment_2_date: installment2Match?.[2],
      installment_3_amount: installment3Match ? parseFloat(installment3Match[1]) : undefined,
      installment_3_date: installment3Match?.[2],
      security_deposit: securityDeposit || undefined,
      start_date: startDate,
      end_date: endDate,
      university: university,
      academic_year: academicYear,
      contract_type: 'Contratto di Ospitalità e Alloggio',
      provider: 'UNICAMPUSRESIDENCE S.R.L.',
    };

    this.logger.log(
      `Extraction complete. Confidence: ${(overallConfidence * 100).toFixed(1)}%`
    );

    return {
      data: extractedData,
      confidence: {
        overall: parseFloat(overallConfidence.toFixed(2)),
        fieldScores,
      },
      rawMatches,
    };
  }

  /**
   * Normalize Italian date format to ISO format
   */
  private normalizeItalianDate(italianDate: string): string | null {
    try {
      // Handle formats like "10 ottobre 2025" or "10/10/2025"
      if (italianDate.includes('/')) {
        const [day, month, year] = italianDate.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const monthMap: Record<string, string> = {
        gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
        maggio: '05', giugno: '06', luglio: '07', agosto: '08',
        settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
      };

      const match = italianDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
      if (match) {
        const [, day, monthName, year] = match;
        const month = monthMap[monthName.toLowerCase()];
        if (month) {
          return `${year}-${month}-${day.padStart(2, '0')}`;
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to normalize date: ${italianDate}`);
      return null;
    }
  }
}
