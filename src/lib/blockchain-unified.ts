import { ethers } from 'ethers';
import { BlockchainService } from './blockchain';
import { AlgorandService, AlgorandInvoice } from './algorand';
import algosdk from 'algosdk';
import { supabase } from './supabase';
import { InvoiceData } from '../types';

export type SupportedBlockchain = 'ethereum' | 'polygon' | 'algorand';

export interface UnifiedInvoice {
  id: string;
  amount: number;
  recipient: string;
  creator: string;
  dueDate: number;
  paid: boolean;
  refunded?: boolean;
  payer?: string;
  blockchain: SupportedBlockchain;
  contractAddress?: string;
  appId?: number;
  txId?: string;
  explorerUrl?: string;
}

export interface CreateInvoiceParams {
  invoiceId: string;
  recipient: string;
  amount: string | number;
  dueDate: number;
  description: string;
  blockchain: SupportedBlockchain;
  isEscrow?: boolean;
  tokenAddress?: string;
}

export interface BlockchainResponse {
  success: boolean;
  network: string;
  applicationId?: number;
  transactionId: string;
  blockNumber?: number;
  contractAddress: string;
  creatorAddress?: string;
  explorerUrl: string;
  transactionUrl?: string;
  error?: string;
}

export interface EmailResponse {
  success: boolean;
  emailId?: string;
  message: string;
  smartContract?: {
    success: boolean;
    transactionId?: string;
    status?: string;
    explorerUrl?: string;
    error?: string;
  };
}

export class UnifiedBlockchainService {
  private ethereumService: BlockchainService;
  private algorandService: AlgorandService;
  private currentBlockchain: SupportedBlockchain = 'ethereum';

  constructor() {
    this.ethereumService = new BlockchainService();
    this.algorandService = new AlgorandService();
  }

  // Switch between blockchains
  async switchBlockchain(blockchain: SupportedBlockchain): Promise<boolean> {
    this.currentBlockchain = blockchain;
    
    switch (blockchain) {
      case 'ethereum':
      case 'polygon':
        return await this.ethereumService.connectWallet();
      case 'algorand':
        // Algorand doesn't require wallet connection in the same way
        return true;
      default:
        return false;
    }
  }

  // Create invoice on selected blockchain
  async createInvoice(params: CreateInvoiceParams, account?: algosdk.Account): Promise<UnifiedInvoice> {
    const { blockchain, invoiceId, recipient, amount, dueDate, description } = params;
    
    switch (blockchain) {
      case 'ethereum':
      case 'polygon': {
        if (blockchain === 'polygon') {
          await this.ethereumService.switchNetwork('polygon');
        }
        
        const result = await this.ethereumService.createInvoice({
          invoiceId,
          recipient,
          amount: amount.toString(),
          dueDate,
          description,
          tokenAddress: params.tokenAddress,
          isEscrow: params.isEscrow
        });
        
        return {
          id: invoiceId,
          amount: typeof amount === 'string' ? parseFloat(amount) : amount,
          recipient,
          creator: '', // Will be filled by the calling component
          dueDate,
          paid: false,
          blockchain,
          contractAddress: result.invoiceHash,
          txId: result.hash,
          explorerUrl: this.ethereumService.getExplorerUrl(result.hash)
        };
      }
      
      case 'algorand': {
        if (!account) {
          throw new Error('Algorand account required for invoice creation');
        }
        
        const amountInMicroAlgos = this.algorandService.algosToMicroAlgos(
          typeof amount === 'string' ? parseFloat(amount) : amount
        );
        
        const result = await this.algorandService.createInvoice(account, {
          id: invoiceId,
          amount: amountInMicroAlgos,
          recipient,
          dueDate
        });
        
        return {
          id: invoiceId,
          amount: typeof amount === 'string' ? parseFloat(amount) : amount,
          recipient,
          creator: account.addr,
          dueDate,
          paid: false,
          blockchain,
          appId: result.appId,
          txId: result.txId,
          explorerUrl: this.algorandService.getExplorerUrl(result.txId)
        };
      }
      
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  // Pay invoice on selected blockchain
  async payInvoice(
    invoiceHash: string,
    amount: string,
    blockchain: SupportedBlockchain,
    account?: algosdk.Account,
    recipient?: string
  ): Promise<string> {
    switch (blockchain) {
      case 'ethereum':
      case 'polygon':
        return await this.ethereumService.payInvoice(invoiceHash, amount);
      
      case 'algorand': {
        if (!account || !recipient) {
          throw new Error('Algorand account and recipient required for payment');
        }
        
        const amountInMicroAlgos = this.algorandService.algosToMicroAlgos(parseFloat(amount));
        return await this.algorandService.payInvoice(account, invoiceHash, amountInMicroAlgos, recipient);
      }
      
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  // Get invoice details from selected blockchain
  async getInvoiceDetails(
    invoiceHash: string,
    blockchain: SupportedBlockchain
  ): Promise<UnifiedInvoice | null> {
    switch (blockchain) {
      case 'ethereum':
      case 'polygon': {
        const details = await this.ethereumService.getInvoiceDetails(invoiceHash);
        return {
          id: details.invoiceId,
          amount: parseFloat(details.amount),
          recipient: details.recipient,
          creator: details.recipient, // Assuming recipient is creator for now
          dueDate: details.dueDate,
          paid: details.isPaid,
          refunded: details.isRefunded,
          payer: details.payer !== ethers.ZeroAddress ? details.payer : undefined,
          blockchain,
          contractAddress: invoiceHash,
          explorerUrl: this.ethereumService.getExplorerUrl(invoiceHash)
        };
      }
      
      case 'algorand': {
        const details = await this.algorandService.getInvoice(invoiceHash);
        if (!details) return null;
        
        return {
          id: details.id,
          amount: this.algorandService.microAlgosToAlgos(details.amount),
          recipient: details.recipient,
          creator: details.creator,
          dueDate: details.dueDate,
          paid: details.paid,
          refunded: details.refunded,
          payer: details.payer,
          blockchain,
          appId: details.appId,
          explorerUrl: details.txId ? this.algorandService.getExplorerUrl(details.txId) : undefined
        };
      }
      
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  // Check if invoice is overdue
  async isInvoiceOverdue(
    invoiceHash: string,
    blockchain: SupportedBlockchain
  ): Promise<boolean> {
    switch (blockchain) {
      case 'ethereum':
      case 'polygon':
        return await this.ethereumService.isInvoiceOverdue(invoiceHash);
      
      case 'algorand': {
        const invoice = await this.algorandService.getInvoice(invoiceHash);
        if (!invoice) return false;
        
        const now = Math.floor(Date.now() / 1000);
        return now > invoice.dueDate && !invoice.paid;
      }
      
      default:
        return false;
    }
  }

  // Refund invoice
  async refundInvoice(
    invoiceHash: string,
    blockchain: SupportedBlockchain,
    account?: algosdk.Account
  ): Promise<string> {
    switch (blockchain) {
      case 'ethereum':
      case 'polygon':
        return await this.ethereumService.refundInvoice(invoiceHash);
      
      case 'algorand': {
        if (!account) {
          throw new Error('Algorand account required for refund');
        }
        return await this.algorandService.refundInvoice(account, invoiceHash);
      }
      
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  // Get supported blockchains
  getSupportedBlockchains(): SupportedBlockchain[] {
    return ['ethereum', 'polygon', 'algorand'];
  }

  // Get current blockchain
  getCurrentBlockchain(): SupportedBlockchain {
    return this.currentBlockchain;
  }

  // Generate account for Algorand
  generateAlgorandAccount(): algosdk.Account {
    return this.algorandService.generateAccount();
  }

  // Get account info for Algorand
  async getAlgorandAccountInfo(address: string) {
    return await this.algorandService.getAccountInfo(address);
  }

  // Deploy contract for Algorand
  async deployAlgorandContract(account: algosdk.Account): Promise<number> {
    return await this.algorandService.deployInvoiceContract(account);
  }

  // Get explorer URL
  getExplorerUrl(txHash: string, blockchain: SupportedBlockchain): string {
    switch (blockchain) {
      case 'ethereum':
      case 'polygon':
        return this.ethereumService.getExplorerUrl(txHash);
      case 'algorand':
        return this.algorandService.getExplorerUrl(txHash);
      default:
        return '';
    }
  }

  async deployInvoiceContract(invoiceData: InvoiceData, accountMnemonic: string): Promise<BlockchainResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-smart-contract', {
        body: {
          invoiceId: invoiceData.id || `invoice-${Date.now()}`,
          invoiceNumber: invoiceData.invoiceNumber,
          amount: invoiceData.amount,
          recipientEmail: invoiceData.recipientEmail,
          dueDate: invoiceData.dueDate,
          accountMnemonic
        }
      });

      if (error) {
        throw new Error(`Smart contract deployment failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Smart contract deployment failed');
      }

      return {
        success: true,
        network: data.network,
        applicationId: data.applicationId,
        transactionId: data.transactionId,
        blockNumber: data.blockNumber,
        contractAddress: data.contractAddress,
        creatorAddress: data.creatorAddress,
        explorerUrl: data.explorerUrl,
        transactionUrl: data.transactionUrl
      };

    } catch (error: any) {
      console.error('Blockchain deployment error:', error);
      return {
        success: false,
        network: 'algorand-testnet',
        transactionId: '',
        contractAddress: '',
        explorerUrl: '',
        error: error.message
      };
    }
  }

  async sendInvoiceWithSmartContract(
    invoiceData: InvoiceData, 
    pdfUrl: string, 
    applicationId?: number,
    accountMnemonic?: string
  ): Promise<EmailResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          recipientEmail: invoiceData.recipientEmail,
          invoiceData: {
            invoiceNumber: invoiceData.invoiceNumber,
            amount: invoiceData.amount,
            dueDate: invoiceData.dueDate,
            companyName: invoiceData.companyName,
            applicationId,
            accountMnemonic: applicationId ? accountMnemonic : undefined
          },
          pdfUrl
        }
      });

      if (error) {
        throw new Error(`Email sending failed: ${error.message}`);
      }

      return {
        success: data.success,
        emailId: data.emailId,
        message: data.message,
        smartContract: data.smartContract
      };

    } catch (error: any) {
      console.error('Email sending error:', error);
      return {
        success: false,
        message: `Failed to send email: ${error.message}`
      };
    }
  }

  async markInvoiceAsPaid(applicationId: number): Promise<BlockchainResponse> {
    try {
      // This would be called when payment is confirmed
      // For now, we'll return a placeholder response
      return {
        success: true,
        network: 'algorand-testnet',
        transactionId: `payment-${Date.now()}`,
        contractAddress: `algorand-app-${applicationId}`,
        explorerUrl: `https://testnet.algoexplorer.io/application/${applicationId}`
      };
    } catch (error: any) {
      return {
        success: false,
        network: 'algorand-testnet',
        transactionId: '',
        contractAddress: '',
        explorerUrl: '',
        error: error.message
      };
    }
  }
}

export const unifiedBlockchainService = new UnifiedBlockchainService();

export class AlgorandBlockchainService {
  private accountMnemonic: string;

  constructor(accountMnemonic: string) {
    this.accountMnemonic = accountMnemonic;
  }

  async deployInvoiceContract(invoiceData: InvoiceData): Promise<BlockchainResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-smart-contract', {
        body: {
          invoiceId: invoiceData.id || `invoice-${Date.now()}`,
          invoiceNumber: invoiceData.invoiceNumber,
          amount: invoiceData.amount,
          recipientEmail: invoiceData.recipientEmail,
          dueDate: invoiceData.dueDate,
          accountMnemonic: this.accountMnemonic
        }
      });

      if (error) {
        throw new Error(`Smart contract deployment failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Smart contract deployment failed');
      }

      return {
        success: true,
        network: data.network,
        applicationId: data.applicationId,
        transactionId: data.transactionId,
        blockNumber: data.blockNumber,
        contractAddress: data.contractAddress,
        creatorAddress: data.creatorAddress,
        explorerUrl: data.explorerUrl,
        transactionUrl: data.transactionUrl
      };

    } catch (error: any) {
      console.error('Blockchain deployment error:', error);
      return {
        success: false,
        network: 'algorand-testnet',
        transactionId: '',
        contractAddress: '',
        explorerUrl: '',
        error: error.message
      };
    }
  }

  async sendInvoiceWithSmartContract(
    invoiceData: InvoiceData, 
    pdfUrl: string, 
    applicationId?: number
  ): Promise<EmailResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          recipientEmail: invoiceData.recipientEmail,
          invoiceData: {
            invoiceNumber: invoiceData.invoiceNumber,
            amount: invoiceData.amount,
            dueDate: invoiceData.dueDate,
            companyName: invoiceData.companyName,
            applicationId,
            accountMnemonic: applicationId ? this.accountMnemonic : undefined
          },
          pdfUrl
        }
      });

      if (error) {
        throw new Error(`Email sending failed: ${error.message}`);
      }

      return {
        success: data.success,
        emailId: data.emailId,
        message: data.message,
        smartContract: data.smartContract
      };

    } catch (error: any) {
      console.error('Email sending error:', error);
      return {
        success: false,
        message: `Failed to send email: ${error.message}`
      };
    }
  }

  async markInvoiceAsPaid(applicationId: number): Promise<BlockchainResponse> {
    try {
      // This would be called when payment is confirmed
      // For now, we'll return a placeholder response
      return {
        success: true,
        network: 'algorand-testnet',
        transactionId: `payment-${Date.now()}`,
        contractAddress: `algorand-app-${applicationId}`,
        explorerUrl: `https://testnet.algoexplorer.io/application/${applicationId}`
      };
    } catch (error: any) {
      return {
        success: false,
        network: 'algorand-testnet',
        transactionId: '',
        contractAddress: '',
        explorerUrl: '',
        error: error.message
      };
    }
  }
}