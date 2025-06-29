import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export const LargeShield: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
      className="relative flex items-center justify-center"
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
      
      {/* Main shield container */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-mckinsey-strong"
      >
        {/* Inner shield icon */}
        <Shield className="w-48 h-48 lg:w-56 lg:h-56 text-white drop-shadow-2xl" strokeWidth={1.5} />
        
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-6 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-6 left-8 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-2000"></div>
        
        {/* Subtle border highlight */}
        <div className="absolute inset-2 border-2 border-white/20 rounded-2xl"></div>
      </motion.div>
      
      {/* Floating particles */}
      <motion.div
        animate={{ 
          x: [0, 20, -20, 0],
          y: [0, -30, 30, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 right-10 w-2 h-2 bg-blue-300 rounded-full"
      ></motion.div>
      
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
        className="absolute bottom-12 left-12 w-3 h-3 bg-teal-300 rounded-full"
      ></motion.div>
    </motion.div>
  );
};