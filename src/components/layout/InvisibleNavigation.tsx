import React, { useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export const InvisibleNavigation: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: sectionId, offsetY: 100 },
      ease: "power3.inOut"
    });
  };

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50" style={{ background: 'transparent' }}>
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
              <button 
                onClick={() => scrollToSection('#features')}
                className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg cursor-pointer border-none bg-transparent"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('#security')}
                className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg cursor-pointer border-none bg-transparent"
              >
                Security
              </button>
              <button 
                onClick={() => scrollToSection('#pricing')}
                className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg cursor-pointer border-none bg-transparent"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('#about')}
                className="text-gray-300 hover:text-f5f5f5 transition-colors duration-300 professional-serif text-lg cursor-pointer border-none bg-transparent"
              >
                About
              </button>
            </div>
          </div>

          {/* Right side placeholder for balance */}
          <div className="w-32"></div>
        </div>
      </div>
    </nav>
  );
};