import { ethers } from 'ethers';
import { supabase } from './supabase';

// Contract ABIs (simplified for key functions)
const TRUST_INVOICE_ABI = [
  "function createInvoice(string memory _invoiceId, address payable _recipient, uint256 _amount, uint256 _dueDate, address _tokenAddress, bool _isEscrow, string memory _description) external returns (bytes32)",
  "function payInvoice(bytes32 _invoiceHash) external payable",
  "function getInvoice(bytes32 _invoiceHash) external view returns (tuple(address recipient, address payer, uint256 amount, uint256 dueDate, uint256 createdAt, address tokenAddress, bool isPaid, bool isRefunded, bool isEscrow, string invoiceId, string description))",
  "function isOverdue(bytes32 _invoiceHash) external view returns (bool)",
  "function releaseEscrow(bytes32 _invoiceHash) external",
  "function refundInvoice(bytes32 _invoiceHash) external",
  "event InvoiceCreated(bytes32 indexed invoiceHash, string indexed invoiceId, address indexed recipient, uint256 amount, uint256 dueDate, address tokenAddress)",
  "event InvoicePaid(bytes32 indexed invoiceHash, string indexed invoiceId, address indexed payer, uint256 amount, uint256 fee)"
];

// Network configurations
export const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    contractAddress: '0x...', // Deploy address
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    contractAddress: '0x...', // Deploy address
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  bsc: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    contractAddress: '0x...', // Deploy address
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    contractAddress: '0x...', // Deploy address
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    contractAddress: '0x...', // Deploy address
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  },
  // Testnets
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
    contractAddress: '0x...', // Deploy address
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  },
  mumbai: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    contractAddress: '0x...', // Deploy address
    explorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  }
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private currentNetwork: string = 'ethereum';

  async connectWallet(): Promise<boolean> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const network = await this.provider.getNetwork();
      this.currentNetwork = this.getNetworkName(Number(network.chainId));
      
      const networkConfig = NETWORKS[this.currentNetwork as keyof typeof NETWORKS];
      if (networkConfig) {
        this.contract = new ethers.Contract(
          networkConfig.contractAddress,
          TRUST_INVOICE_ABI,
          this.signer
        );
      }

      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  async switchNetwork(networkName: string): Promise<boolean> {
    if (!this.provider) return false;

    const network = NETWORKS[networkName as keyof typeof NETWORKS];
    if (!network) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });

      this.currentNetwork = networkName;
      this.contract = new ethers.Contract(
        network.contractAddress,
        TRUST_INVOICE_ABI,
        this.signer
      );

      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  async createInvoice(invoiceData: {
    invoiceId: string;
    recipient: string;
    amount: string;
    dueDate: number;
    tokenAddress?: string;
    isEscrow?: boolean;
    description: string;
  }): Promise<{ hash: string; invoiceHash: string }> {
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    const amount = ethers.parseEther(invoiceData.amount);
    const tokenAddress = invoiceData.tokenAddress || ethers.ZeroAddress;

    try {
      const tx = await this.contract.createInvoice(
        invoiceData.invoiceId,
        invoiceData.recipient,
        amount,
        invoiceData.dueDate,
        tokenAddress,
        invoiceData.isEscrow || false,
        invoiceData.description
      );

      const receipt = await tx.wait();
      const event = receipt?.logs?.find((log: any) => {
        try {
          const parsed = this.contract?.interface.parseLog(log);
          return parsed?.name === 'InvoiceCreated';
        } catch {
          return false;
        }
      });
      
      let invoiceHash = '';
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        invoiceHash = parsed?.args?.invoiceHash || '';
      }
      
      return {
        hash: tx.hash,
        invoiceHash
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  async payInvoice(invoiceHash: string, amount: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.payInvoice(invoiceHash, {
        value: ethers.parseEther(amount)
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw error;
    }
  }

  async getInvoiceDetails(invoiceHash: string): Promise<any> {
    if (!this.contract) {
      throw new Error('Wallet not connected');
    }

    try {
      const invoice = await this.contract.getInvoice(invoiceHash);
      return {
        recipient: invoice.recipient,
        payer: invoice.payer,
        amount: ethers.formatEther(invoice.amount),
        dueDate: Number(invoice.dueDate),
        createdAt: Number(invoice.createdAt),
        tokenAddress: invoice.tokenAddress,
        isPaid: invoice.isPaid,
        isRefunded: invoice.isRefunded,
        isEscrow: invoice.isEscrow,
        invoiceId: invoice.invoiceId,
        description: invoice.description
      };
    } catch (error) {
      console.error('Failed to get invoice details:', error);
      throw error;
    }
  }

  async isInvoiceOverdue(invoiceHash: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Wallet not connected');
    }

    try {
      return await this.contract.isOverdue(invoiceHash);
    } catch (error) {
      console.error('Failed to check if invoice is overdue:', error);
      return false;
    }
  }

  async releaseEscrow(invoiceHash: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.releaseEscrow(invoiceHash);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to release escrow:', error);
      throw error;
    }
  }

  async refundInvoice(invoiceHash: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.refundInvoice(invoiceHash);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to refund invoice:', error);
      throw error;
    }
  }

  getNetworkName(chainId: number): string {
    const network = Object.entries(NETWORKS).find(([, config]) => config.chainId === chainId);
    return network ? network[0] : 'unknown';
  }

  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  getExplorerUrl(txHash: string): string {
    const network = NETWORKS[this.currentNetwork as keyof typeof NETWORKS];
    return network ? `${network.explorerUrl}/tx/${txHash}` : '';
  }

  async getGasEstimate(method: string, params: any[]): Promise<string> {
    if (!this.contract || !this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const gasLimit = await this.contract[method].estimateGas(...params);
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      const gasCost = gasLimit * gasPrice;
      
      return ethers.formatEther(gasCost);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return '0';
    }
  }
}

export const blockchainService = new BlockchainService();