# 🔗 Algorand Blockchain Integration Guide

## Overview
TrustInvoice now supports **Algorand blockchain** integration for secure, tamper-proof invoice management using **TEAL smart contracts** deployed to the **Algorand Testnet**.

## ✨ Features

### 🚀 **Smart Contract Deployment**
- **TEAL-based contracts** store invoice data on-chain
- **Automated deployment** to Algorand Testnet via [Nodely's free endpoints](https://nodely.io/docs/free/start)
- **Real-time status tracking** (created → sent → paid)

### 📧 **Email Integration**
- **Smart contract updates** when emails are sent
- **Blockchain verification** included in email notifications
- **Transaction links** to Algorand explorer

### 💰 **Crypto Payment Option**
- **Native ALGO payments** on the payment page
- **Testnet integration** for safe testing
- **Automatic conversion** from USD to ALGO amounts

## 🔧 Setup Instructions

### 1. **Pre-funded Algorand Account**
You'll need a testnet account with ALGO funds. Use the account mnemonic when deploying contracts.

### 2. **Environment Variables**
```bash
# Add to your .env file
RESEND_API_KEY=your_resend_api_key_here
```

### 3. **Usage Example**
```typescript
import { AlgorandBlockchainService } from './lib/blockchain-unified';

// Initialize with your pre-funded account mnemonic
const algorandService = new AlgorandBlockchainService('your 25-word mnemonic here');

// Deploy smart contract
const deployment = await algorandService.deployInvoiceContract(invoiceData);

// Send email with blockchain integration
const emailResult = await algorandService.sendInvoiceWithSmartContract(
  invoiceData, 
  pdfUrl, 
  deployment.applicationId
);
```

## 📋 Smart Contract Functions

### **Available TEAL Methods:**
- `mark_sent` - Called automatically when invoice email is sent
- `mark_paid` - Called when payment is confirmed  
- `get_status` - Query current invoice status

### **Global State Storage:**
- `invoice_id` - Unique invoice identifier
- `invoice_number` - Human-readable invoice number
- `amount` - Invoice amount in microAlgos
- `recipient` - Recipient email address
- `due_date` - Payment due date
- `status` - Current status (created/sent/paid)
- `created_at` - Contract creation timestamp
- `sent_at` - Email sent timestamp
- `paid_at` - Payment completion timestamp

## 🌐 Network Configuration

### **Algorand Testnet (via Nodely)**
- **API Endpoint:** `https://testnet-api.4160.nodely.dev`
- **Indexer:** `https://testnet-idx.4160.nodely.dev`
- **Explorer:** `https://testnet.algoexplorer.io`
- **No API Keys Required** ✅

## 💡 How It Works

1. **Contract Deployment**: Invoice data is stored in a TEAL smart contract on Algorand testnet
2. **Email Trigger**: When invoice email is sent, contract status updates to "sent"
3. **Payment Processing**: Crypto payments can be made directly in ALGO
4. **Status Tracking**: All state changes are recorded on-chain with timestamps

## 🔍 Transaction Tracking

All transactions provide:
- **Application ID**: Unique smart contract identifier
- **Transaction Hash**: Blockchain transaction reference
- **Explorer Links**: Direct links to view on Algorand explorer
- **Block Number**: Confirmation block reference

## 🚨 Important Notes

- This is configured for **Algorand Testnet** only
- Requires a **pre-funded testnet account**
- **TEAL contracts** are immutable once deployed
- **Gas fees** are paid in ALGO from the deploying account

## 🔗 Useful Links

- [Nodely Algorand Documentation](https://nodely.io/docs/free/start)
- [Algorand Developer Documentation](https://developer.algorand.org/)
- [TEAL Programming Guide](https://developer.algorand.org/docs/get-details/dapps/avm/teal/)
- [Algorand Testnet Explorer](https://testnet.algoexplorer.io)

---
*Powered by Algorand blockchain technology for secure, transparent invoice management.* 