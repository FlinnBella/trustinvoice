import React, { useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import boltLogo from '../../assets/bolt-logo.png';

gsap.registerPlugin(ScrollToPlugin);

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

  const scrollToSection = (sectionId: string) => {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: sectionId, offsetY: 80 },
      ease: "power2.inOut"
    });
  };

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 nav-bg">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-2xl font-semibold text-white professional-font">TrustInvoice</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-12">
              <button 
                onClick={() => scrollToSection('#features')}
                className="text-gray-300 hover:text-white transition-colors duration-300 professional-font text-lg cursor-pointer border-none bg-transparent"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('#security')}
                className="text-gray-300 hover:text-white transition-colors duration-300 professional-font text-lg cursor-pointer border-none bg-transparent"
              >
                Security
              </button>
              <button 
                onClick={() => scrollToSection('#pricing')}
                className="text-gray-300 hover:text-white transition-colors duration-300 professional-font text-lg cursor-pointer border-none bg-transparent"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('#about')}
                className="text-gray-300 hover:text-white transition-colors duration-300 professional-font text-lg cursor-pointer border-none bg-transparent"
              >
                About
              </button>
            </div>
          </div>

          {/* Right side - Bolt.new link */}
          <div className="hidden md:block">
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg group"
            >
              <img 
                src={boltLogo} 
                alt="Bolt" 
                className="w-5 h-5 filter invert group-hover:scale-110 transition-transform duration-200" 
              />
              <span className="text-black font-semibold text-sm">Bolt</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};