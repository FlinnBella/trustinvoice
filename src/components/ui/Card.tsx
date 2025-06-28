import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' } : {}}
      className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
};