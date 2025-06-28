import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundCurves: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          d="M0,400 Q300,200 600,400 T1200,400"
          stroke="rgba(245, 245, 245, 0.15)"
          strokeWidth="3"
          fill="none"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.12 }}
          transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
          d="M0,300 Q400,100 800,300 T1200,300"
          stroke="rgba(245, 245, 245, 0.12)"
          strokeWidth="2"
          fill="none"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.08 }}
          transition={{ duration: 5, ease: "easeInOut", delay: 1 }}
          d="M0,500 Q200,300 400,500 T800,500 T1200,500"
          stroke="rgba(245, 245, 245, 0.08)"
          strokeWidth="1.5"
          fill="none"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.06 }}
          transition={{ duration: 6, ease: "easeInOut", delay: 1.5 }}
          d="M0,600 Q150,450 300,600 T600,600 T900,600 T1200,600"
          stroke="rgba(245, 245, 245, 0.06)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
};