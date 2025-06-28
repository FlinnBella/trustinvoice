import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface InvoiceUploadProps {
  onNext: (file: File) => void;
  onBack: () => void;
}

export const InvoiceUpload: React.FC<InvoiceUploadProps> = ({ onNext, onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleNext = () => {
    if (uploadedFile) {
      onNext(uploadedFile);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Upload Your Invoice PDF
          </h2>
          <p className="text-xl text-gray-300">
            We'll automatically extract the details for smart contract processing
          </p>
        </div>

        <Card className="p-8 mb-8">
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-white bg-gray-800/50'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                className="space-y-4"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-white mb-2">
                    {isDragActive
                      ? 'Drop your PDF here'
                      : 'Drag & drop your invoice PDF here'}
                  </p>
                  <p className="text-gray-400">
                    or click to browse files
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Supports PDF files up to 10MB
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-4 bg-green-900/20 border border-green-600/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div>
                  <p className="font-medium text-green-300">{uploadedFile.name}</p>
                  <p className="text-sm text-green-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-green-800/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-green-400" />
              </button>
            </motion.div>
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
            disabled={!uploadedFile}
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