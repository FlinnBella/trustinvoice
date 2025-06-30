import algosdk from 'algosdk';
import { AlgorandClient, Config } from '@algorandfoundation/algokit-utils';

// Algorand network configurations
//Look at here again for clarity later on 
export const ALGORAND_NETWORKS = {
  mainnet: {
    name: 'Algorand Mainnet',
    server: 'https://mainnet-api.4160.nodely.dev',
    //server: 'https://mainnet-api.algonode.cloud',
    port: 443,
    token: '',
    indexerServer: 'https://mainnet-idx.4160.nodely.dev',
    //indexerServer: 'https://mainnet-idx.algonode.cloud',
    explorerUrl: 'https://algoexplorer.io',
    chainId: 'mainnet-v1.0'
  },
  testnet: {
    name: 'Algorand Testnet',
    server: 'https://testnet-api.4160.nodely.dev',
    //server: 'https://testnet-api.algonode.cloud',
    port: 443,
    token: '',
    indexerServer: 'https://testnet-idx.4160.nodely.dev',
    //indexerServer: 'https://testnet-idx.algonode.cloud',
    explorerUrl: 'https://testnet.algoexplorer.io',
    chainId: 'testnet-v1.0'
  },
  betanet: {
    name: 'Algorand Betanet',
    server: 'https://betanet-api.4160.nodely.dev',
    //server: 'https://betanet-api.algonode.cloud',
    port: 443,
    token: '',
    indexerServer: 'https://betanet-idx.4160.nodely.dev',
    //indexerServer: 'https://betanet-idx.algonode.cloud',
    explorerUrl: 'https://betanet.algoexplorer.io',
    chainId: 'betanet-v1.0'
  }
};

// Smart contract source code for invoice management
const INVOICE_CONTRACT_SOURCE = `
#pragma version 8
txn ApplicationID
int 0
==
bnz main_l19
txn OnCompletion
int OptIn
==
bnz main_l18
txn OnCompletion
int CloseOut
==
bnz main_l17
txn OnCompletion
int UpdateApplication
==
bnz main_l16
txn OnCompletion
int DeleteApplication
==
bnz main_l15
txn OnCompletion
int NoOp
==
bnz main_l6
err
main_l6:
txna ApplicationArgs 0
byte "create_invoice"
==
bnz main_l14
txna ApplicationArgs 0
byte "pay_invoice"
==
bnz main_l13
txna ApplicationArgs 0
byte "get_invoice"
==
bnz main_l12
txna ApplicationArgs 0
byte "refund_invoice"
==
bnz main_l11
err
main_l11:
callsub refundinvoice_4
int 1
return
main_l12:
callsub getinvoice_3
int 1
return
main_l13:
callsub payinvoice_2
int 1
return
main_l14:
callsub createinvoice_1
int 1
return
main_l15:
int 1
return
main_l16:
int 1
return
main_l17:
int 1
return
main_l18:
int 1
return
main_l19:
callsub createapplication_0
int 1
return

// Create application
createapplication_0:
byte "creator"
txn Sender
app_global_put
byte "total_invoices"
int 0
app_global_put
retsub

// Create invoice
createinvoice_1:
txna ApplicationArgs 1
store 0
txna ApplicationArgs 2
btoi
store 1
txna ApplicationArgs 3
btoi
store 2
txna ApplicationArgs 4
store 3
byte "invoice_"
load 0
concat
store 4
load 4
byte "amount"
concat
load 1
app_global_put
load 4
byte "due_date"
concat
load 2
app_global_put
load 4
byte "recipient"
concat
load 3
app_global_put
load 4
byte "paid"
concat
int 0
app_global_put
load 4
byte "creator"
concat
txn Sender
app_global_put
byte "total_invoices"
byte "total_invoices"
app_global_get
int 1
+
app_global_put
retsub

// Pay invoice
payinvoice_2:
txna ApplicationArgs 1
store 5
byte "invoice_"
load 5
concat
store 6
load 6
byte "paid"
concat
app_global_get
int 0
==
assert
load 6
byte "amount"
concat
app_global_get
store 7
gtxn 1 TypeEnum
int pay
==
assert
gtxn 1 Amount
load 7
==
assert
load 6
byte "recipient"
concat
app_global_get
store 8
gtxn 1 Receiver
load 8
==
assert
load 6
byte "paid"
concat
int 1
app_global_put
load 6
byte "payer"
concat
txn Sender
app_global_put
retsub

// Get invoice details
getinvoice_3:
txna ApplicationArgs 1
store 9
byte "invoice_"
load 9
concat
store 10
load 10
byte "amount"
concat
app_global_get
itob
log
load 10
byte "paid"
concat
app_global_get
itob
log
retsub

// Refund invoice
refundinvoice_4:
txna ApplicationArgs 1
store 11
byte "invoice_"
load 11
concat
store 12
load 12
byte "creator"
concat
app_global_get
txn Sender
==
assert
load 12
byte "paid"
concat
app_global_get
int 1
==
assert
load 12
byte "amount"
concat
app_global_get
store 13
load 12
byte "payer"
concat
app_global_get
store 14
itxn_begin
int pay
itxn_field TypeEnum
load 14
itxn_field Receiver
load 13
itxn_field Amount
itxn_submit
load 12
byte "refunded"
concat
int 1
app_global_put
retsub
`;

export interface AlgorandInvoice {
  id: string;
  amount: number;
  recipient: string;
  creator: string;
  dueDate: number;
  paid: boolean;
  refunded?: boolean;
  payer?: string;
  appId?: number;
  txId?: string;
}

export class AlgorandService {
  private client: algosdk.Algodv2;
  private indexer: algosdk.Indexer;
  private currentNetwork: keyof typeof ALGORAND_NETWORKS = 'testnet';
  private appId: number | null = null;

  constructor(network: keyof typeof ALGORAND_NETWORKS = 'testnet') {
    this.currentNetwork = network;
    const config = ALGORAND_NETWORKS[network];
    
    this.client = new algosdk.Algodv2(config.token, config.server, config.port);
    this.indexer = new algosdk.Indexer(config.token, config.indexerServer, config.port);
  }

  // Deploy the invoice smart contract
  async deployInvoiceContract(creatorAccount: algosdk.Account): Promise<number> {
    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      // Compile the contract
      const compiledContract = await this.client.compile(Buffer.from(INVOICE_CONTRACT_SOURCE)).do();
      const approvalProgram = new Uint8Array(Buffer.from(compiledContract.result, 'base64'));
      
      // Clear state program (minimal)
      const clearProgram = new Uint8Array(Buffer.from('I6AB', 'base64'));
      
      // Create application transaction
      const createTxn = algosdk.makeApplicationCreateTxn(
        creatorAccount.addr,
        suggestedParams,
        algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram,
        clearProgram,
        2, // global state schema - num byte slices
        2, // global state schema - num ints
        1, // local state schema - num byte slices
        1, // local state schema - num ints
        undefined, // app args
        undefined, // accounts
        undefined, // foreign apps
        undefined, // foreign assets
        undefined, // note
        undefined, // lease
        undefined  // rekey to
      );

      // Sign and send transaction
      const signedTxn = createTxn.signTxn(creatorAccount.sk);
      const txId = createTxn.txID().toString();
      
      await this.client.sendRawTransaction(signedTxn).do();
      const result = await algosdk.waitForConfirmation(this.client, txId, 4);
      
      this.appId = result['application-index'];
      if (this.appId === null || this.appId === undefined) {
        throw new Error('Failed to deploy contract: No application ID returned');
      }
      return this.appId;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  // Create an invoice on Algorand
  async createInvoice(
    creatorAccount: algosdk.Account,
    invoiceData: {
      id: string;
      amount: number;
      recipient: string;
      dueDate: number;
    }
  ): Promise<{ txId: string; appId: number }> {
    if (!this.appId) {
      throw new Error('Contract not deployed. Call deployInvoiceContract first.');
    }

    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from('create_invoice')),
        new Uint8Array(Buffer.from(invoiceData.id)),
        algosdk.encodeUint64(invoiceData.amount),
        algosdk.encodeUint64(invoiceData.dueDate),
        new Uint8Array(Buffer.from(invoiceData.recipient))
      ];

      const createInvoiceTxn = algosdk.makeApplicationNoOpTxn(
        creatorAccount.addr,
        suggestedParams,
        this.appId,
        appArgs
      );

      const signedTxn = createInvoiceTxn.signTxn(creatorAccount.sk);
      const txId = createInvoiceTxn.txID().toString();
      
      await this.client.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.client, txId, 4);

      return { txId, appId: this.appId };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  // Pay an invoice
  async payInvoice(
    payerAccount: algosdk.Account,
    invoiceId: string,
    amount: number,
    recipient: string
  ): Promise<string> {
    if (!this.appId) {
      throw new Error('Contract not deployed');
    }

    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      // Create application call transaction
      const appArgs = [
        new Uint8Array(Buffer.from('pay_invoice')),
        new Uint8Array(Buffer.from(invoiceId))
      ];

      const appCallTxn = algosdk.makeApplicationNoOpTxn(
        payerAccount.addr,
        suggestedParams,
        this.appId,
        appArgs
      );

      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParams(
        payerAccount.addr,
        recipient,
        amount,
        undefined,
        undefined,
        suggestedParams
      );

      // Group transactions
      const txns = [appCallTxn, paymentTxn];
      algosdk.assignGroupID(txns);

      // Sign transactions
      const signedTxns = txns.map(txn => txn.signTxn(payerAccount.sk));
      
      // Send grouped transaction
      await this.client.sendRawTransaction(signedTxns).do();
      const txId = appCallTxn.txID().toString();
      
      await algosdk.waitForConfirmation(this.client, txId, 4);
      return txId;
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw error;
    }
  }

  // Get invoice details
  async getInvoice(invoiceId: string): Promise<AlgorandInvoice | null> {
    if (!this.appId) {
      throw new Error('Contract not deployed');
    }

    try {
      const appInfo = await this.client.getApplicationByID(this.appId).do();
      const globalState = appInfo.params['global-state'];
      
      const invoicePrefix = `invoice_${invoiceId}`;
      const invoice: Partial<AlgorandInvoice> = { id: invoiceId };
      
      for (const state of globalState) {
        const key = Buffer.from(state.key, 'base64').toString();
        
        if (key.startsWith(invoicePrefix)) {
          const field = key.replace(`${invoicePrefix}_`, '');
          
          switch (field) {
            case 'amount':
              invoice.amount = state.value.uint;
              break;
            case 'recipient':
              invoice.recipient = Buffer.from(state.value.bytes, 'base64').toString();
              break;
            case 'creator':
              invoice.creator = Buffer.from(state.value.bytes, 'base64').toString();
              break;
            case 'due_date':
              invoice.dueDate = state.value.uint;
              break;
            case 'paid':
              invoice.paid = state.value.uint === 1;
              break;
            case 'refunded':
              invoice.refunded = state.value.uint === 1;
              break;
            case 'payer':
              invoice.payer = Buffer.from(state.value.bytes, 'base64').toString();
              break;
          }
        }
      }
      
      if (invoice.amount !== undefined) {
        return invoice as AlgorandInvoice;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get invoice:', error);
      return null;
    }
  }

  // Refund an invoice
  async refundInvoice(
    creatorAccount: algosdk.Account,
    invoiceId: string
  ): Promise<string> {
    if (!this.appId) {
      throw new Error('Contract not deployed');
    }

    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from('refund_invoice')),
        new Uint8Array(Buffer.from(invoiceId))
      ];

      const refundTxn = algosdk.makeApplicationNoOpTxn(
        creatorAccount.addr,
        suggestedParams,
        this.appId,
        appArgs
      );

      const signedTxn = refundTxn.signTxn(creatorAccount.sk);
      const txId = refundTxn.txID().toString();
      
      await this.client.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.client, txId, 4);

      return txId;
    } catch (error) {
      console.error('Failed to refund invoice:', error);
      throw error;
    }
  }

  // Generate a new Algorand account
  generateAccount(): algosdk.Account {
    return algosdk.generateAccount();
  }

  // Get account information
  async getAccountInfo(address: string) {
    try {
      return await this.client.accountInformation(address).do();
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  // Get transaction details
  async getTransaction(txId: string) {
    try {
      return await this.indexer.lookupTransactionByID(txId).do();
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  // Get explorer URL for transaction
  getExplorerUrl(txId: string): string {
    const config = ALGORAND_NETWORKS[this.currentNetwork];
    return `${config.explorerUrl}/tx/${txId}`;
  }

  // Switch network
  switchNetwork(network: keyof typeof ALGORAND_NETWORKS) {
    this.currentNetwork = network;
    const config = ALGORAND_NETWORKS[network];
    
    this.client = new algosdk.Algodv2(config.token, config.server, config.port);
    this.indexer = new algosdk.Indexer(config.token, config.indexerServer, config.port);
    this.appId = null; // Reset app ID when switching networks
  }

  // Get current network
  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  // Convert microAlgos to Algos
  microAlgosToAlgos(microAlgos: number): number {
    return microAlgos / 1000000;
  }

  // Convert Algos to microAlgos
  algosToMicroAlgos(algos: number): number {
    return Math.round(algos * 1000000);
  }
}

export const algorandService = new AlgorandService();