import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Plus, Trash2, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { BlockchainSelector } from '../ui/BlockchainSelector';
import { BlockchainConnector } from '../blockchain/BlockchainConnector';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { InvoiceData, InvoiceItem } from '../../types';
import { emailService } from '../../lib/email-service';
import { useToast } from '../../hooks/useToast';
import { useBlockchainStore } from '../../store/blockchainStore';
import { unifiedBlockchainService, SupportedBlockchain } from '../../lib/blockchain-unified';

interface InvoiceCreationProps {
  onNext: (invoiceData: Partial<InvoiceData>) => void;
  onBack: () => void;
  userEmail: string;
  userPlan?: string;
}

export const InvoiceCreation: React.FC<InvoiceCreationProps> = ({ 
  onNext, 
  onBack, 
  userEmail,
  userPlan = 'basic'
}) => {
  const [invoiceData, setInvoiceData] = useState<Partial<InvoiceData>>({
    userEmail,
    invoiceNumber: `INV-${Date.now()}`,
    companyName: '',
    companyAddress: '',
    description: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  const [selectedBlockchain, setSelectedBlockchain] = useState<SupportedBlockchain>('ethereum');
  const [showConnector, setShowConnector] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { success, error } = useToast();
  const { isConnected, currentBlockchain, algorandAccount } = useBlockchainStore();

  const updateField = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const items = [...(invoiceData.items || [])];
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    
    updateField('items', items);
  };

  const addItem = () => {
    const items = [...(invoiceData.items || [])];
    items.push({ description: '', quantity: 1, rate: 0, amount: 0 });
    updateField('items', items);
  };

  const removeItem = (index: number) => {
    const items = [...(invoiceData.items || [])];
    items.splice(index, 1);
    updateField('items', items);
  };

  const calculateTotal = () => {
    return (invoiceData.items || []).reduce((total, item) => total + item.amount, 0);
  };

  const handleBlockchainConnect = (blockchain: SupportedBlockchain) => {
    setSelectedBlockchain(blockchain);
    success('Blockchain Connected', `Connected to ${blockchain} network`);
  };

  const handleNext = async () => {
    const total = calculateTotal();
    const finalInvoiceData = { ...invoiceData, amount: total };
    
    setIsCreating(true);
    
    try {
      // Create blockchain invoice if Pro/Premium and connected
      if (userPlan !== 'basic' && isConnected) {
        const blockchainInvoice = await unifiedBlockchainService.createInvoice({
          invoiceId: invoiceData.invoiceNumber || '',
          recipient: invoiceData.recipientEmail || '',
          amount: total,
          dueDate: Math.floor(new Date(invoiceData.dueDate || '').getTime() / 1000),
          description: invoiceData.description || '',
          blockchain: currentBlockchain
        }, algorandAccount || undefined);

        finalInvoiceData.smart_contract_address = blockchainInvoice.contractAddress || blockchainInvoice.appId?.toString();
        finalInvoiceData.blockchain_tx_hash = blockchainInvoice.txId;

        success('Smart Contract Created', 'Invoice secured on blockchain');
      }

      // Send contract deployment notification if applicable
      if (userPlan !== 'basic' && invoiceData.recipientEmail) {
        try {
          await emailService.sendContractDeployedEmail(
            userEmail,
            userEmail,
            {
              invoiceNumber: invoiceData.invoiceNumber || '',
              amount: total,
              description: invoiceData.description || '',
              companyName: invoiceData.companyName || '',
              dueDate: invoiceData.dueDate || '',
              contractAddress: finalInvoiceData.smart_contract_address || '',
              transactionHash: finalInvoiceData.blockchain_tx_hash || ''
            },
            userPlan
          );
        } catch (emailError) {
          console.error('Failed to send contract deployment email:', emailError);
        }
      }
      
      onNext(finalInvoiceData);
    } catch (err) {
      console.error('Invoice creation failed:', err);
      error('Creation Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCreating(false);
    }
  };

  const isValid = invoiceData.companyName && invoiceData.description && invoiceData.dueDate;

  return (
    <div className="min-h-screen py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Create Your Invoice
          </h2>
          <p className="text-xl text-gray-300">
            Fill in the details for your professional invoice
            {userPlan !== 'basic' && ' with blockchain security'}
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Company Information</h3>
              
              <Input
                label="Company Name"
                value={invoiceData.companyName || ''}
                onChange={(value) => updateField('companyName', value)}
                placeholder="Your Company Name"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Address
                </label>
                <textarea
                  value={invoiceData.companyAddress || ''}
                  onChange={(e) => updateField('companyAddress', e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Invoice Details</h3>
              
              <Input
                label="Invoice Number"
                value={invoiceData.invoiceNumber || ''}
                onChange={(value) => updateField('invoiceNumber', value)}
                placeholder="INV-001"
              />
              
              <Input
                label="Due Date"
                type="date"
                value={invoiceData.dueDate || ''}
                onChange={(value) => updateField('dueDate', value)}
                required
              />
              
              <Input
                label="Description"
                value={invoiceData.description || ''}
                onChange={(value) => updateField('description', value)}
                placeholder="Brief description of services"
                required
              />
            </div>
          </div>

          {/* Blockchain Selection for Pro/Premium */}
          {userPlan !== 'basic' && (
            <div className="mb-8 p-6 bg-blue-900/20 rounded-lg border border-blue-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-300">🔗 Blockchain Security</h3>
                {!isConnected && (
                  <Button
                    variant="outline"
                    onClick={() => setShowConnector(true)}
                    className="flex items-center space-x-2"
                  >
                    <Wallet size={16} />
                    <span>Connect Wallet</span>
                  </Button>
                )}
              </div>
              
              <BlockchainSelector
                selectedBlockchain={selectedBlockchain}
                onSelect={setSelectedBlockchain}
                disabled={!isConnected}
              />
              
              {isConnected && (
                <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                  <p className="text-sm text-green-300">
                    ✅ Connected to {currentBlockchain} - Your invoice will be secured with a smart contract
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Invoice Items</h3>
              <Button
                variant="outline"
                onClick={addItem}
                className="flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-4">
              {(invoiceData.items || []).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="col-span-5">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(value) => updateItem(index, 'description', value)}
                      placeholder="Item description"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      label="Qty"
                      type="number"
                      value={item.quantity.toString()}
                      onChange={(value) => updateItem(index, 'quantity', parseInt(value) || 0)}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      label="Rate"
                      type="number"
                      value={item.rate.toString()}
                      onChange={(value) => updateItem(index, 'rate', parseFloat(value) || 0)}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      label="Amount"
                      value={`$${item.amount.toFixed(2)}`}
                      onChange={() => {}}
                      className="bg-gray-700"
                      disabled
                    />
                  </div>
                  
                  <div className="col-span-1">
                    {(invoiceData.items || []).length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2 flex-1"
            disabled={isCreating}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isValid || isCreating}
            className="flex items-center space-x-2 flex-2"
          >
            {isCreating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <BlockchainConnector
        isOpen={showConnector}
        onClose={() => setShowConnector(false)}
        onConnect={handleBlockchainConnect}
      />
    </div>
  );
};