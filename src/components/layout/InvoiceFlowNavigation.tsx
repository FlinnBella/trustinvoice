import React, { useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { gsap } from 'gsap';
import boltLogo from '../../assets/bolt-logo.png';

export const InvoiceFlowNavigation: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 nav-bg">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left spacer for balance */}
          <div className="w-24"></div>
          
          {/* Centered Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-mckinsey-soft">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl mckinsey-font-semibold text-white">TrustInvoice</span>
          </div>
          
          {/* Right side - Bolt.new link */}
          <div className="w-24 flex justify-end">
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 transform hover:scale-105"
            >
              <img 
                src={boltLogo} 
                alt="Bolt" 
                className="w-8 h-8 cursor-pointer" 
              />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}; 