import React from 'react';
import { Shield } from 'lucide-react';

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-bg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-f5f5f5" />
            <span className="text-2xl font-bold text-f5f5f5">TrustInvoice</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-f5f5f5 transition-colors">Features</a>
            <a href="#security" className="text-gray-300 hover:text-f5f5f5 transition-colors">Security</a>
            <a href="#pricing" className="text-gray-300 hover:text-f5f5f5 transition-colors">Pricing</a>
          </div>
        </div>
      </div>
    </nav>
  );
};