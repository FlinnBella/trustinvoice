import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SupportedBlockchain } from '../../lib/blockchain-unified';

interface BlockchainSelectorProps {
  selectedBlockchain: SupportedBlockchain;
  onSelect: (blockchain: SupportedBlockchain) => void;
  disabled?: boolean;
}

const blockchainInfo = {
  ethereum: {
    name: 'Ethereum',
    description: 'Secure, decentralized smart contracts',
    color: 'from-blue-500 to-blue-600',
    icon: '⟠'
  },
  polygon: {
    name: 'Polygon',
    description: 'Fast, low-cost transactions',
    color: 'from-purple-500 to-purple-600',
    icon: '⬟'
  },
  algorand: {
    name: 'Algorand',
    description: 'Pure proof-of-stake blockchain',
    color: 'from-green-500 to-green-600',
    icon: '◆'
  }
};

export const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  selectedBlockchain,
  onSelect,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300 mckinsey-font">
        Select Blockchain Network
      </label>
      
      <div className="grid gap-3">
        {Object.entries(blockchainInfo).map(([key, info]) => {
          const blockchain = key as SupportedBlockchain;
          const isSelected = selectedBlockchain === blockchain;
          
          return (
            <motion.button
              key={blockchain}
              type="button"
              onClick={() => !disabled && onSelect(blockchain)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? 'border-white bg-white/10'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${info.color} flex items-center justify-center text-white text-lg font-bold`}>
                    {info.icon}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mckinsey-font">
                      {info.name}
                    </h3>
                    <p className="text-sm text-gray-400 mckinsey-font">
                      {info.description}
                    </p>
                  </div>
                </div>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check size={16} className="text-gray-900" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};