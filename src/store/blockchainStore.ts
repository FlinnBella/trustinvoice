import { create } from 'zustand';
import { SupportedBlockchain, UnifiedInvoice } from '../lib/blockchain-unified';
import algosdk from 'algosdk';

interface BlockchainState {
  currentBlockchain: SupportedBlockchain;
  isConnected: boolean;
  account: string | null;
  algorandAccount: algosdk.Account | null;
  invoices: UnifiedInvoice[];
  isLoading: boolean;
  error: string | null;
}

interface BlockchainActions {
  setBlockchain: (blockchain: SupportedBlockchain) => void;
  setConnected: (connected: boolean) => void;
  setAccount: (account: string | null) => void;
  setAlgorandAccount: (account: algosdk.Account | null) => void;
  addInvoice: (invoice: UnifiedInvoice) => void;
  updateInvoice: (id: string, updates: Partial<UnifiedInvoice>) => void;
  setInvoices: (invoices: UnifiedInvoice[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type BlockchainStore = BlockchainState & BlockchainActions;

const initialState: BlockchainState = {
  currentBlockchain: 'ethereum',
  isConnected: false,
  account: null,
  algorandAccount: null,
  invoices: [],
  isLoading: false,
  error: null
};

export const useBlockchainStore = create<BlockchainStore>((set, get) => ({
  ...initialState,

  setBlockchain: (blockchain) => set({ currentBlockchain: blockchain }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  setAccount: (account) => set({ account }),
  
  setAlgorandAccount: (account) => set({ algorandAccount: account }),
  
  addInvoice: (invoice) => set((state) => ({
    invoices: [...state.invoices, invoice]
  })),
  
  updateInvoice: (id, updates) => set((state) => ({
    invoices: state.invoices.map(invoice =>
      invoice.id === id ? { ...invoice, ...updates } : invoice
    )
  })),
  
  setInvoices: (invoices) => set({ invoices }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState)
}));