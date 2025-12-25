import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { TextExtractionService } from '../extraction/text-extraction.service';
import { UnicampusExtractionService } from '../extraction/unicampus-extraction.service';
import { PaymentScheduleService } from '../payment/payment-schedule.service';
import { Contract } from '../database/database.types';
import * as fs from 'fs/promises';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly textExtractionService: TextExtractionService,
    private readonly unicampusExtractionService: UnicampusExtractionService,
    private readonly paymentScheduleService: PaymentScheduleService,
  ) {}

  /**
   * Upload a new contract
   */
  async uploadContract(
    fileName: string,
    fileType: string,
    fileSize: number,
    filePath: string,
  ): Promise<Contract> {
    this.logger.log(`Uploading contract: ${fileName}`);

    const { data, error } = await (this.supabaseService.contracts as any)
      .insert({
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_url: filePath,
        status: 'pending',
        is_analyzed: false,
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to upload contract: ${error?.message}`);
      throw new Error(`Failed to upload contract: ${error?.message}`);
    }

    this.logger.log(`Contract uploaded successfully: ${data.id}`);
    return data as Contract;
  }

  /**
   * Analyze a contract (extract text + extract data + generate payment schedules)
   */
  async analyzeContract(contractId: string): Promise<Contract> {
    this.logger.log(`Analyzing contract: ${contractId}`);

    // Get contract from database
    const { data: contract, error: fetchError } =
      await (this.supabaseService.contracts as any)
        .select('*')
        .eq('id', contractId)
        .single();

    if (fetchError || !contract) {
      throw new NotFoundException(`Contract not found: ${contractId}`);
    }

    try {
      // Update status to analyzing
      await (this.supabaseService.contracts as any)
        .update({ status: 'analyzing' })
        .eq('id', contractId);

      // Step 1: Extract text from file
      this.logger.log('Step 1: Extracting text from file');
      const extractionResult = await this.textExtractionService.extractText(
        contract.file_url,
        contract.file_type,
      );
      const cleanedText =
        this.textExtractionService.cleanText(extractionResult.text);

      // Step 2: Extract structured data using Unicampus patterns
      this.logger.log('Step 2: Extracting structured data');
      const unicampusResult =
        await this.unicampusExtractionService.extractContractData(cleanedText);

      // Step 3: Generate payment schedules
      this.logger.log('Step 3: Generating payment schedules');
      let paymentSchedules = null;

      if (unicampusResult.data.rent_total && unicampusResult.data.start_date) {
        const scheduleResult =
          this.paymentScheduleService.generatePaymentSchedule(
            unicampusResult.data.rent_total,
            unicampusResult.data.start_date,
            {
              first: unicampusResult.data.installment_1_date,
              second: unicampusResult.data.installment_2_date,
              third: unicampusResult.data.installment_3_date,
            },
          );
        paymentSchedules = scheduleResult.options;
      }

      // Step 4: Update contract with extracted data
      this.logger.log('Step 4: Saving analysis results');
      const { data: updatedContract, error: updateError } =
        await (this.supabaseService.contracts as any)
          .update({
            original_text: cleanedText,
            is_analyzed: true,
            extracted_data: unicampusResult.data,
            payment_schedules: paymentSchedules,
            extraction_confidence: unicampusResult.confidence.overall,
            analyzed_at: new Date().toISOString(),
            status: 'completed',
          })
          .eq('id', contractId)
          .select()
          .single();

      if (updateError) {
        throw new Error(`Failed to update contract: ${updateError.message}`);
      }

      this.logger.log(`Analysis completed successfully: ${contractId}`);
      return updatedContract as Contract;
    } catch (error) {
      this.logger.error(`Analysis failed: ${error.message}`);

      // Update status to error
      await (this.supabaseService.contracts as any)
        .update({ status: 'error' })
        .eq('id', contractId);

      throw error;
    }
  }

  /**
   * Get all contracts
   */
  async getAllContracts(): Promise<Contract[]> {
    const { data, error } = await (this.supabaseService.contracts as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }

    return (data || []) as Contract[];
  }

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<Contract> {
    const { data, error} = await (this.supabaseService.contracts as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Contract not found: ${id}`);
    }

    return data as Contract;
  }

  /**
   * Delete contract
   */
  async deleteContract(id: string) {
    // Get contract to delete file
    const contract = await this.getContractById(id);

    // Delete file if exists
    if (contract.file_url) {
      try {
        await fs.unlink(contract.file_url);
        this.logger.log(`Deleted file: ${contract.file_url}`);
      } catch (error) {
        this.logger.warn(`Failed to delete file: ${error.message}`);
      }
    }

    // Delete from database
    const { error } = await (this.supabaseService.contracts as any)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete contract: ${error.message}`);
    }

    this.logger.log(`Contract deleted: ${id}`);
    return { message: 'Contract deleted successfully', id };
  }
}
