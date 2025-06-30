export interface InvoiceData {
  id?: string;
  userEmail: string;
  recipientEmail: string;
  amount: number;
  description: string;
  dueDate: string;
  invoiceNumber: string;
  companyName: string;
  companyAddress: string;
  items: InvoiceItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt?: string;
  pdfUrl?: string;
  smart_contract_address?: string;
  blockchain_tx_hash?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
  invoicesPerMonth: number;
}

export interface UserFlow {
  step: number;
  email: string;
  invoiceMethod: 'upload' | 'create';
  invoiceData: Partial<InvoiceData>;
  selectedPlan: PricingPlan | null;
  uploadedFile: File | null;
}