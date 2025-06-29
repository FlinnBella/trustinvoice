import React from 'react';
import { motion } from 'framer-motion';

export const LaptopDisplay: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
      className="relative flex items-center justify-center perspective-1000"
    >
      {/* Laptop Base */}
      <div className="relative">
        {/* Screen */}
        <div className="relative w-80 h-52 lg:w-96 lg:h-60 bg-gradient-to-br from-gray-900 to-black rounded-t-2xl border-4 border-gray-700 shadow-2xl transform rotate-x-5">
          {/* Screen Bezel */}
          <div className="absolute inset-2 bg-black rounded-xl overflow-hidden">
            {/* Smart Contract Code Display */}
            <div className="p-4 h-full overflow-hidden">
              <div className="text-xs font-mono text-green-400 mb-2">
                // TrustInvoice Smart Contract
              </div>
              
              <motion.div 
                className="space-y-1 text-xs font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, stagger: 0.1 }}
              >
                <div className="text-blue-300">contract InvoicePayment &#123;</div>
                <div className="ml-2 text-gray-300">address payable recipient;</div>
                <div className="ml-2 text-gray-300">uint256 immutable amount;</div>
                <div className="ml-2 text-gray-300">bool private paid = false;</div>
                <div className="ml-2 text-gray-300">uint256 immutable dueDate;</div>
                <div className="ml-2 text-yellow-300">
                  modifier onlyAfterDue() &#123;
                </div>
                <div className="ml-4 text-gray-300">
                  require(block.timestamp {'>'} dueDate);
                </div>
                <div className="ml-4 text-gray-300">_;</div>
                <div className="ml-2 text-yellow-300">&#125;</div>
                <div className="ml-2 text-purple-300">
                  function payInvoice() external payable &#123;
                </div>
                <div className="ml-4 text-gray-300">
                  require(msg.value == amount);
                </div>
                <div className="ml-4 text-gray-300">paid = true;</div>
                <div className="ml-4 text-orange-300">
                  emit PaymentReceived(amount);
                </div>
                <div className="ml-2 text-purple-300">&#125;</div>
                <div className="text-blue-300">&#125;</div>
              </motion.div>
              
              {/* Terminal Cursor */}
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-green-400 ml-1"
              />
            </div>
            
            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 px-3 py-1 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300">Contract Deployed</span>
              </div>
              <span className="text-gray-400">Ethereum Mainnet</span>
            </div>
          </div>
          
          {/* Screen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none"></div>
        </div>
        
        {/* Laptop Base/Keyboard */}
        <div className="relative w-96 h-6 lg:w-[28rem] lg:h-8 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-3xl shadow-xl">
          {/* Trackpad */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-3 lg:w-20 lg:h-4 bg-gray-600 rounded-lg border border-gray-500"></div>
          
          {/* Keyboard suggestion */}
          <div className="absolute top-0.5 left-8 right-8 h-1 bg-gray-600 rounded opacity-50"></div>
        </div>
        
        {/* Laptop Shadow */}
        <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/20 rounded-full blur-xl"></div>
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-2xl blur-2xl scale-110 -z-10"></div>
      </div>
      
      {/* Floating Code Particles */}
      <motion.div
        animate={{ 
          x: [0, 30, -30, 0],
          y: [0, -20, 20, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-8 right-8 text-xs font-mono text-blue-300 opacity-60"
      >
        0x1a2b3c...
      </motion.div>
      
      <motion.div
        animate={{ 
          x: [0, -25, 25, 0],
          y: [0, 25, -25, 0],
          opacity: [0.4, 0.9, 0.4]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-12 left-8 text-xs font-mono text-green-300 opacity-60"
      >
        &#123;...&#125;
      </motion.div>
    </motion.div>
  );
};