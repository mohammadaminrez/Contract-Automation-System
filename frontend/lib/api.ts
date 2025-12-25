// API client for contract automation backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Contract {
  id: string;
  file_name: string;
  file_url: string | null;
  file_type: string;
  file_size: number | null;
  original_text: string | null;
  is_analyzed: boolean;
  extracted_data: any;
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
  async analyzeContract(contractId: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/analyze`, {
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
