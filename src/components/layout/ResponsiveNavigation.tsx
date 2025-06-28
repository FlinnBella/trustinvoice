import React, { useEffect, useRef, useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export const ResponsiveNavigation: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: sectionId, offsetY: 80 },
      ease: "power2.inOut"
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Right side placeholder for balance on desktop */}
            <div className="hidden md:block w-32"></div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
          <div className="fixed top-0 left-0 w-80 h-full bg-gray-900 shadow-xl transform transition-transform duration-300">
            <div className="p-6 pt-20">
              <div className="space-y-6">
                <button 
                  onClick={() => scrollToSection('#features')}
                  className="block w-full text-left text-white hover:text-gray-300 transition-colors duration-300 professional-font text-lg py-3 border-b border-gray-700"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('#security')}
                  className="block w-full text-left text-white hover:text-gray-300 transition-colors duration-300 professional-font text-lg py-3 border-b border-gray-700"
                >
                  Security
                </button>
                <button 
                  onClick={() => scrollToSection('#pricing')}
                  className="block w-full text-left text-white hover:text-gray-300 transition-colors duration-300 professional-font text-lg py-3 border-b border-gray-700"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('#about')}
                  className="block w-full text-left text-white hover:text-gray-300 transition-colors duration-300 professional-font text-lg py-3"
                >
                  About
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};