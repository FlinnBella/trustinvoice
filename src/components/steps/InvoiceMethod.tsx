import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface InvoiceMethodProps {
  onNext: (method: 'upload' | 'create') => void;
  onBack: () => void;
}

export const InvoiceMethod: React.FC<InvoiceMethodProps> = ({ onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            How would you like to create your invoice?
          </h2>
          <p className="text-xl text-gray-600">
            Choose the method that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card hover className="p-8 h-full cursor-pointer" onClick={() => onNext('upload')}>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-black mb-4">
                  Upload Existing PDF
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Already have an invoice PDF? Upload it and we'll extract the details
                  automatically for smart contract processing.
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Automatic data extraction</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>PDF validation</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Quick setup</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card hover className="p-8 h-full cursor-pointer" onClick={() => onNext('create')}>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-green-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-black mb-4">
                  Create New Invoice
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Use our professional templates to create a new invoice from scratch
                  with all the details you need.
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Professional templates</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Custom branding</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Smart calculations</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};