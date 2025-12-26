// TypeScript interfaces for database tables

export interface Contract {
  id: string;
  file_name: string;
  file_url: string | null;
  file_type: string;
  file_size: number | null;
  original_text: string | null;
  is_analyzed: boolean;
  extracted_data: ExtractedData | null;
  payment_schedules: PaymentSchedule[] | null;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  extraction_confidence: number | null;
  uploaded_at: string;
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedData {
  // Personal Information
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  birth_date?: string;
  birth_place?: string;
  fiscal_code?: string;
  residence_city?: string;
  residence_address?: string;

  // Property Information
  accommodation_address?: string;

  // Educational Information
  university?: string;
  academic_year?: string;

  // Contract Dates
  start_date?: string;
  end_date?: string;

  // Financial Information
  rent_total?: number;
  monthly_rent?: number;
  security_deposit?: number;
  number_of_installments?: number;
  installment_1_amount?: number;
  installment_1_date?: string;
  installment_2_amount?: number;
  installment_2_date?: string;
  installment_3_amount?: number;
  installment_3_date?: string;

  // Other
  contract_type?: string;
  provider?: string;
  utilities_included?: boolean;
  payment_method?: string;

  [key: string]: any; // Allow additional fields
}

export interface PaymentSchedule {
  installment_number: number;
  amount: number;
  percentage: number;
  due_date: string;
  description: string;
  payment_type: 'installment' | 'single_with_discount';
}

// Database schema for Supabase
export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: Contract;
        Insert: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'uploaded_at'>;
        Update: Partial<Omit<Contract, 'id' | 'created_at'>>;
      };
    };
  };
}
