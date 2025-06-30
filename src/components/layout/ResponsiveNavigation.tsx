import React, { useEffect, useRef, useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import boltLogo from '../../assets/bolt-logo.png';

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
    
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-mckinsey-soft">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl mckinsey-font-semibold text-white">TrustInvoice</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-12">
                <button 
                  onClick={() => scrollToSection('#features')}
                  className="text-slate-300 hover:text-white transition-colors duration-300 mckinsey-font-medium text-lg cursor-pointer border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3 py-2"
                >
                  Solutions
                </button>
                <button 
                  onClick={() => scrollToSection('#security')}
                  className="text-slate-300 hover:text-white transition-colors duration-300 mckinsey-font-medium text-lg cursor-pointer border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3 py-2"
                >
                  Technology
                </button>
                <button 
                  onClick={() => scrollToSection('#pricing')}
                  className="text-slate-300 hover:text-white transition-colors duration-300 mckinsey-font-medium text-lg cursor-pointer border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3 py-2"
                >
                  Investment
                </button>
                <button 
                  onClick={() => scrollToSection('#about')}
                  className="text-slate-300 hover:text-white transition-colors duration-300 mckinsey-font-medium text-lg cursor-pointer border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3 py-2"
                >
                  Impact
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Right side - Bolt.new link for desktop */}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed top-0 left-0 w-80 h-full mckinsey-card-gradient shadow-mckinsey-strong transform transition-transform duration-300 border-r border-slate-600/50">
            <div className="p-6 pt-20">
              <div className="space-y-6">
                <button 
                  onClick={() => scrollToSection('#features')}
                  className="block w-full text-left text-white hover:text-slate-300 transition-colors duration-300 mckinsey-font-medium text-lg py-3 border-b border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3"
                >
                  Solutions
                </button>
                <button 
                  onClick={() => scrollToSection('#security')}
                  className="block w-full text-left text-white hover:text-slate-300 transition-colors duration-300 mckinsey-font-medium text-lg py-3 border-b border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3"
                >
                  Technology
                </button>
                <button 
                  onClick={() => scrollToSection('#pricing')}
                  className="block w-full text-left text-white hover:text-slate-300 transition-colors duration-300 mckinsey-font-medium text-lg py-3 border-b border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3"
                >
                  Investment
                </button>
                <button 
                  onClick={() => scrollToSection('#about')}
                  className="block w-full text-left text-white hover:text-slate-300 transition-colors duration-300 mckinsey-font-medium text-lg py-3 border-b border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3"
                >
                  Impact
                </button>
                
                {/* Bolt.new link in mobile menu */}
                <div className="pt-4 border-t border-slate-600/30">
                  <a
                    href="https://bolt.new/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <img 
                      src={boltLogo} 
                      alt="Bolt" 
                      className="w-5 h-5 filter invert group-hover:scale-110 transition-transform duration-200" 
                    />
                    <span className="text-black font-semibold">Build with Bolt</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};