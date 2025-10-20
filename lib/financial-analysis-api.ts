// Financial Analysis Microservice API Client

const ANALYSIS_API_URL = process.env.NEXT_PUBLIC_ANALYSIS_API_URL || 'http://localhost:8000';

interface UploadResponse {
  job_id: string;
  status: string;
  message: string;
  files_count: number;
}

interface JobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  created_at: string;
  completed_at?: string;
  result?: {
    analysis_id: string;
    company_id: string;
    company_name: string;
    summary: {
      total_files: number;
      successful_files: number;
      failed_files: number;
      total_pages: number;
      health_status: string;
    };
    message: string;
  };
  error?: string;
}

interface AnalysisResult {
  analysis_id: string;
  company_id: string;
  created_at: string;
  document_count: number;
  total_pages_processed: number;
  filenames: string[];
  summary: {
    liquidity_status: string;
    profitability_status: string;
    confidence_score: number;
    key_strengths: string[];
    key_concerns: string[];
  };
  company_information: any;
  balance_sheet_data: any;
  income_statement_data: any;
  cash_flow_data: any;
  financial_metrics: any;
  health_analysis: any;
  trend_analysis: any;
  risk_assessment: any;
  metadata: {
    analysis_method: string;
    model_used: string;
    consolidation_method: string;
  };
}

class FinancialAnalysisAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Upload financial documents (save only, no analysis)
   */
  async uploadDocuments(
    files: File[],
    companyId?: string,
    companyName?: string
  ): Promise<any> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    if (companyId) {
      formData.append('company_id', companyId);
    }
    if (companyName) {
      formData.append('company_name', companyName);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/analysis/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Get job status by job ID
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analysis/job/${jobId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get job status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get job status error:', error);
      throw error;
    }
  }

  /**
   * Get analysis results by analysis ID
   */
  async getAnalysis(analysisId: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analysis/${analysisId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('Get analysis error:', error);
      throw error;
    }
  }

  /**
   * Poll job status until completion
   */
  async pollJobStatus(
    jobId: string,
    onProgress?: (status: JobStatus) => void,
    pollInterval: number = 2000
  ): Promise<JobStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getJobStatus(jobId);

          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(status.error || 'Job failed'));
          } else {
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Trigger analysis for specific document IDs
   */
  async analyzeDocuments(
    documentIds: number[],
    companyId: string,
    companyName: string,
    analysisType: string = 'comprehensive'
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_ids: documentIds,
          company_id: companyId,
          company_name: companyName,
          analysis_type: analysisType
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to start analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('Analyze documents error:', error);
      throw error;
    }
  }

  /**
   * Get analysis history for a company
   */
  async getCompanyHistory(
    companyId: string,
    limit: number = 10
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/history/company/${companyId}?limit=${limit}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get history');
      }

      return await response.json();
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  }

  /**
   * Get all documents uploaded for a company (for selection in analysis)
   */
  async getCompanyDocuments(companyId: string, status?: string): Promise<any> {
    try {
      const url = status
        ? `${this.baseUrl}/api/analysis/documents/company/${companyId}?status=${status}`
        : `${this.baseUrl}/api/analysis/documents/company/${companyId}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }
}

// Create API instance
export const financialAnalysisApi = new FinancialAnalysisAPI(ANALYSIS_API_URL);

// Export types
export type { UploadResponse, JobStatus, AnalysisResult };
