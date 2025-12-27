import { Injectable, Logger } from '@nestjs/common';
import { PaymentSchedule } from '../database/database.types';

export interface PaymentOption {
  type: 'installments' | 'single_with_discount';
  total_amount: number;
  installments?: PaymentSchedule[];
  discount_percentage?: number;
  discount_amount?: number;
  description: string;
}

export interface PaymentScheduleResult {
  options: PaymentOption[];
  recommended_option: 'installments' | 'single_with_discount';
}

@Injectable()
export class PaymentScheduleService {
  private readonly logger = new Logger(PaymentScheduleService.name);

  /**
   * Generate payment schedule options based on contract data
   * Option 1: N installments (using extracted amounts or equal split)
   * Option 2: Single payment with 3% discount
   */
  generatePaymentSchedule(
    totalAmount: number,
    startDate: string,
    numberOfInstallments: number,
    installmentDates?: Record<number, string>,
    extractedAmounts?: Record<number, number>,
  ): PaymentScheduleResult {
    this.logger.log(
      `Generating payment schedule for total: €${totalAmount} with ${numberOfInstallments} installments`,
    );

    const options: PaymentOption[] = [];

    // Option 1: N installments (using extracted amounts if available)
    const installmentsOption = this.generateInstallmentsOption(
      totalAmount,
      startDate,
      numberOfInstallments,
      installmentDates,
      extractedAmounts,
    );
    options.push(installmentsOption);

    // Option 2: Single payment with 3% discount
    const singlePaymentOption = this.generateSinglePaymentOption(
      totalAmount,
      startDate,
    );
    options.push(singlePaymentOption);

    // Recommend installments by default for amounts > €5000
    const recommended =
      totalAmount > 5000 ? 'installments' : 'single_with_discount';

    return {
      options,
      recommended_option: recommended,
    };
  }

  /**
   * Generate N installments option using extracted amounts from contract
   */
  private generateInstallmentsOption(
    totalAmount: number,
    startDate: string,
    numberOfInstallments: number,
    customDates?: Record<number, string>,
    extractedAmounts?: Record<number, number>,
  ): PaymentOption {
    const installments: PaymentSchedule[] = [];

    // Build amounts array dynamically
    const amounts: number[] = [];
    let hasExtractedAmounts = false;

    // Check if we have extracted amounts
    if (extractedAmounts) {
      for (let i = 0; i < numberOfInstallments; i++) {
        if (extractedAmounts[i + 1] !== undefined && extractedAmounts[i + 1] !== null) {
          amounts.push(extractedAmounts[i + 1]);
          hasExtractedAmounts = true;
        } else {
          amounts.push(null);
        }
      }
    }

    // If no extracted amounts, split equally
    if (!hasExtractedAmounts) {
      const equalAmount = Math.round((totalAmount / numberOfInstallments) * 100) / 100;
      for (let i = 0; i < numberOfInstallments; i++) {
        if (i === numberOfInstallments - 1) {
          // Last installment gets the remainder to avoid rounding issues
          const sumSoFar = equalAmount * (numberOfInstallments - 1);
          amounts.push(totalAmount - sumSoFar);
        } else {
          amounts.push(equalAmount);
        }
      }
    }

    // Generate installment records
    for (let i = 0; i < numberOfInstallments; i++) {
      const amount = amounts[i];
      if (!amount || amount <= 0) continue; // Skip invalid amounts

      const percentage = Math.round((amount / totalAmount) * 100 * 100) / 100;
      const dueDate = this.calculateDueDate(i, startDate, customDates);

      installments.push({
        installment_number: i + 1,
        amount,
        percentage,
        due_date: dueDate,
        description: `${i + 1}° rata`,
        payment_type: 'installment',
      });
    }

    return {
      type: 'installments',
      total_amount: totalAmount,
      installments,
      description: `Pagamento rateale in ${installments.length} rate`,
    };
  }

  /**
   * Generate single payment with 3% discount option
   */
  private generateSinglePaymentOption(
    totalAmount: number,
    startDate: string,
  ): PaymentOption {
    const discountPercentage = 3;
    const discountAmount = Math.round(totalAmount * (discountPercentage / 100) * 100) / 100;
    const finalAmount = totalAmount - discountAmount;

    return {
      type: 'single_with_discount',
      total_amount: finalAmount,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      installments: [
        {
          installment_number: 1,
          amount: finalAmount,
          percentage: 100,
          due_date: this.normalizeDate(startDate),
          description: `Pagamento unico con sconto ${discountPercentage}%`,
          payment_type: 'single_with_discount',
        },
      ],
      description: `Pagamento unico anticipato con sconto del ${discountPercentage}% (risparmio di €${discountAmount.toFixed(2)})`,
    };
  }

  /**
   * Calculate due date for installment
   */
  private calculateDueDate(
    installmentIndex: number,
    startDate: string,
    customDates?: Record<number, string>,
  ): string {
    // If custom dates provided, use them (1-indexed)
    if (customDates && customDates[installmentIndex + 1]) {
      return this.normalizeDate(customDates[installmentIndex + 1]);
    }

    // Otherwise, calculate based on start date
    // 1st installment: at start
    // 2nd installment: +4 months
    // 3rd installment: +8 months, etc.
    const date = new Date(this.normalizeDate(startDate));
    const monthsToAdd = installmentIndex * 4;
    date.setMonth(date.getMonth() + monthsToAdd);

    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
  }

  /**
   * Normalize Italian date format to ISO format
   */
  private normalizeDate(italianDate: string): string {
    try {
      // Handle formats like "10 ottobre 2025" or "10/10/2025"
      if (italianDate.includes('/')) {
        const [day, month, year] = italianDate.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const monthMap: Record<string, string> = {
        gennaio: '01',
        febbraio: '02',
        marzo: '03',
        aprile: '04',
        maggio: '05',
        giugno: '06',
        luglio: '07',
        agosto: '08',
        settembre: '09',
        ottobre: '10',
        novembre: '11',
        dicembre: '12',
      };

      const match = italianDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
      if (match) {
        const [, day, monthName, year] = match;
        const month = monthMap[monthName.toLowerCase()];
        if (month) {
          return `${year}-${month}-${day.padStart(2, '0')}`;
        }
      }

      // If already in ISO format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(italianDate)) {
        return italianDate;
      }

      throw new Error(`Unable to parse date: ${italianDate}`);
    } catch (error) {
      this.logger.warn(`Failed to normalize date: ${italianDate}`);
      // Return a fallback
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Format amount as Italian currency
   */
  formatCurrency(amount: number): string {
    return `€${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
