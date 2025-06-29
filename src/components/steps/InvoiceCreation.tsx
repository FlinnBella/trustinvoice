import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { InvoiceData, InvoiceItem } from '../../types';
import { emailService } from '../../lib/email-service';

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

  const handleNext = async () => {
    const total = calculateTotal();
    const finalInvoiceData = { ...invoiceData, amount: total };
    
    // If this is a pro/premium plan, send contract deployment notification
    if (userPlan !== 'basic' && invoiceData.recipientEmail) {
      try {
        await emailService.sendContractDeployedEmail(
          userEmail, // Send to the invoice creator
          userEmail,
          {
            invoiceNumber: invoiceData.invoiceNumber || '',
            amount: total,
            description: invoiceData.description || '',
            companyName: invoiceData.companyName || '',
            dueDate: invoiceData.dueDate || '',
            contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock contract address
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock transaction hash
          },
          userPlan
        );
      } catch (error) {
        console.error('Failed to send contract deployment email:', error);
      }
    }
    
    onNext(finalInvoiceData);
  };

  const isValid = invoiceData.companyName && invoiceData.description && invoiceData.dueDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-6">
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
                    />
                  </div>
                  
                  <div className="col-span-1">
                    {(invoiceData.items || []).length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
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

          {userPlan !== 'basic' && (
            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
              <h4 className="font-semibold text-blue-300 mb-2">🔗 Blockchain Features Enabled</h4>
              <p className="text-sm text-blue-300">
                This invoice will be secured with a smart contract and include advanced email tracking.
              </p>
            </div>
          )}
        </Card>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2 flex-1"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="flex items-center space-x-2 flex-2"
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};