import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BlockchainSelector } from '../ui/BlockchainSelector';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { useBlockchainStore } from '../../store/blockchainStore';
import { unifiedBlockchainService, SupportedBlockchain } from '../../lib/blockchain-unified';

interface BlockchainConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (blockchain: SupportedBlockchain) => void;
}

export const BlockchainConnector: React.FC<BlockchainConnectorProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<SupportedBlockchain>('ethereum');
  const [isConnecting, setIsConnecting] = useState(false);
  const { success, error } = useToast();
  const { setBlockchain, setConnected, setAccount, setAlgorandAccount } = useBlockchainStore();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      if (selectedBlockchain === 'algorand') {
        // Generate new Algorand account for demo purposes
        const account = unifiedBlockchainService.generateAlgorandAccount();
        setAlgorandAccount(account);
        setAccount(account.addr);
        
        success('Algorand Account Generated', `Address: ${account.addr.slice(0, 8)}...`);
      } else {
        // Connect to Ethereum/Polygon wallet
        const connected = await unifiedBlockchainService.switchBlockchain(selectedBlockchain);
        if (!connected) {
          throw new Error('Failed to connect wallet');
        }
        
        success('Wallet Connected', `Connected to ${selectedBlockchain}`);
      }
      
      setBlockchain(selectedBlockchain);
      setConnected(true);
      onConnect(selectedBlockchain);
      onClose();
      
    } catch (err) {
      console.error('Connection failed:', err);
      error('Connection Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect to Blockchain" size="md">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mckinsey-font mb-2">
            Secure Blockchain Connection
          </h3>
          <p className="text-gray-400 mckinsey-font">
            Choose your preferred blockchain network for secure invoice processing
          </p>
        </div>

        <BlockchainSelector
          selectedBlockchain={selectedBlockchain}
          onSelect={setSelectedBlockchain}
          disabled={isConnecting}
        />

        {selectedBlockchain === 'algorand' && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-300 mckinsey-font">
                  Algorand Demo Mode
                </h4>
                <p className="text-sm text-blue-300 mckinsey-font mt-1">
                  A new Algorand account will be generated for demonstration purposes. 
                  In production, you would connect your existing Algorand wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConnecting}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex-2 flex items-center justify-center space-x-2"
          >
            {isConnecting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Wallet size={16} />
                <span>Connect to {selectedBlockchain}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};