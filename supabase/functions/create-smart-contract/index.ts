/*
  # Create Algorand Smart Contract Function
  
  This edge function deploys TEAL smart contracts to Algorand testnet
  for invoice payment processing using Nodely's free endpoints.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AlgorandContractRequest {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  recipientEmail: string;
  dueDate: string;
  accountMnemonic: string; // Pre-funded account mnemonic
}

// TEAL Smart Contract for Invoice Management
const INVOICE_APPROVAL_PROGRAM = `
#pragma version 8

// Invoice Smart Contract
// Stores invoice data and handles payment verification

// Check if this is a create application call
txn ApplicationID
int 0
==
bnz create_app

// Handle application calls
txn OnCompletion
int NoOp
==
bnz handle_noop

// Handle other completion types
int 0
return

create_app:
    // Initialize global state
    byte "invoice_id"
    txna ApplicationArgs 0
    app_global_put
    
    byte "invoice_number" 
    txna ApplicationArgs 1
    app_global_put
    
    byte "amount"
    txna ApplicationArgs 2
    btoi
    app_global_put
    
    byte "recipient"
    txna ApplicationArgs 3
    app_global_put
    
    byte "due_date"
    txna ApplicationArgs 4
    app_global_put
    
    byte "status"
    byte "created"
    app_global_put
    
    byte "created_at"
    global LatestTimestamp
    app_global_put
    
    int 1
    return

handle_noop:
    // Check method being called
    txna ApplicationArgs 0
    byte "mark_sent"
    ==
    bnz mark_sent
    
    txna ApplicationArgs 0
    byte "mark_paid"
    ==
    bnz mark_paid
    
    txna ApplicationArgs 0
    byte "get_status"
    ==
    bnz get_status
    
    int 0
    return

mark_sent:
    // Mark invoice as sent (triggered by email)
    byte "status"
    byte "sent"
    app_global_put
    
    byte "sent_at"
    global LatestTimestamp
    app_global_put
    
    int 1
    return

mark_paid:
    // Mark invoice as paid
    byte "status"
    byte "paid"
    app_global_put
    
    byte "paid_at"
    global LatestTimestamp
    app_global_put
    
    int 1
    return

get_status:
    // Return current status
    int 1
    return
`;

// Clear state program (minimal)
const CLEAR_STATE_PROGRAM = `
#pragma version 8
int 1
return
`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, invoiceNumber, amount, recipientEmail, dueDate, accountMnemonic }: AlgorandContractRequest = await req.json();

    // Validate required fields
    if (!invoiceId || !invoiceNumber || !amount || !recipientEmail || !dueDate || !accountMnemonic) {
      throw new Error('Missing required fields');
    }

    // Import Algorand SDK dynamically
    const algosdk = await import('https://esm.sh/algosdk@2.7.0');
    
    // Configure Algorand client with Nodely testnet endpoints
    const algodClient = new algosdk.Algodv2(
      '', // No token needed for Nodely free tier
      'https://testnet-api.4160.nodely.dev',
      443
    );

    // Restore account from mnemonic
    const account = algosdk.mnemonicToSecretKey(accountMnemonic);
    
    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Compile the TEAL programs
    const approvalCompileResponse = await algodClient.compile(
      new Uint8Array(Buffer.from(INVOICE_APPROVAL_PROGRAM))
    ).do();
    
    const clearCompileResponse = await algodClient.compile(
      new Uint8Array(Buffer.from(CLEAR_STATE_PROGRAM))
    ).do();
    
    const approvalProgram = new Uint8Array(Buffer.from(approvalCompileResponse.result, 'base64'));
    const clearProgram = new Uint8Array(Buffer.from(clearCompileResponse.result, 'base64'));
    
    // Prepare application arguments
    const appArgs = [
      new Uint8Array(Buffer.from(invoiceId)),
      new Uint8Array(Buffer.from(invoiceNumber)),
      new Uint8Array(Buffer.from(amount.toString())),
      new Uint8Array(Buffer.from(recipientEmail)),
      new Uint8Array(Buffer.from(dueDate))
    ];
    
    // Create the application creation transaction
    const createTxn = algosdk.makeApplicationCreateTxnFromObject({
      from: account.addr,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram,
      clearProgram,
      numLocalInts: 0,
      numLocalByteSlices: 0,
      numGlobalInts: 3, // amount, created_at, sent_at, paid_at
      numGlobalByteSlices: 8, // invoice_id, invoice_number, recipient, due_date, status
      appArgs,
      note: new Uint8Array(Buffer.from(`TrustInvoice: ${invoiceNumber}`))
    });
    
    // Sign the transaction
    const signedTxn = createTxn.signTxn(account.sk);
    
    // Submit the transaction
    const txResponse = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = txResponse.txId;
    
    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    // Get the application ID from the confirmed transaction
    const applicationId = confirmedTxn['application-index'];
    
    // Get account info to check balance
    const accountInfo = await algodClient.accountInformation(account.addr).do();
    
    const response = {
      success: true,
      network: 'algorand-testnet',
      applicationId,
      transactionId: txId,
      blockNumber: confirmedTxn['confirmed-round'],
      contractAddress: `algorand-app-${applicationId}`,
      creatorAddress: account.addr,
      invoiceData: {
        invoiceId,
        invoiceNumber,
        amount,
        recipientEmail,
        dueDate,
        status: 'created'
      },
      transactionDetails: {
        fee: confirmedTxn.txn.txn.fee,
        round: confirmedTxn['confirmed-round'],
        timestamp: new Date().toISOString()
      },
      accountBalance: accountInfo.amount / 1000000, // Convert microAlgos to Algos
      explorerUrl: `https://testnet.algoexplorer.io/application/${applicationId}`,
      transactionUrl: `https://testnet.algoexplorer.io/tx/${txId}`,
      nextSteps: {
        markSent: `Call mark_sent method when email is sent`,
        markPaid: `Call mark_paid method when payment is received`,
        checkStatus: `Call get_status method to check current status`
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating Algorand smart contract:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        network: 'algorand-testnet'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});