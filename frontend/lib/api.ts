// API client for contract automation backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  [key: string]: any;
}

export interface Contract {
  id: string;
  file_name: string;
  file_url: string | null;
  file_type: string;
  file_size: number | null;
  original_text: string | null;
  is_analyzed: boolean;
  extracted_data: ExtractedData | null;
  payment_schedules: any[] | null;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  extraction_confidence: number | null;
  uploaded_at: string;
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const api = {
  /**
   * Upload a contract file
   */
  async uploadContract(file: File): Promise<Contract> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/contracts/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload contract');
    }

    return response.json();
  },

  /**
   * Analyze a contract
   */
  async analyzeContract(contractId: string, method: 'regex' | 'openai' = 'regex'): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/analyze?method=${method}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze contract');
    }

    return response.json();
  },

  /**
   * Get all contracts
   */
  async getAllContracts(): Promise<Contract[]> {
    const response = await fetch(`${API_BASE_URL}/api/contracts`);

    if (!response.ok) {
      throw new Error('Failed to fetch contracts');
    }

    return response.json();
  },

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/api/contracts/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch contract');
    }

    return response.json();
  },

  /**
   * Delete contract
   */
  async deleteContract(id: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/contracts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete contract');
    }

    return response.json();
  },
};
