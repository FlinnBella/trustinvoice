import React, { useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { gsap } from 'gsap';

export const Navigation: React.FC = () => {
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
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-f5f5f5" />
            <span className="text-2xl font-semibold text-f5f5f5 professional-serif">TrustInvoice</span>
          </div>
          
          {/* Centered Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-12">
              <a href="#features" className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg">Features</a>
              <a href="#security" className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg">Security</a>
              <a href="#pricing" className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg">About</a>
            </div>
          </div>

          {/* Right side placeholder for balance */}
          <div className="w-32"></div>
        </div>
      </div>
    </nav>
  );
};