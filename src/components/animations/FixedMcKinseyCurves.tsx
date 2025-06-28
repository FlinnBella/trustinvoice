import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const FixedMcKinseyCurves: React.FC = () => {
  const curvesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (curvesRef.current) {
      const paths = curvesRef.current.querySelectorAll('path');
      
      // Animate curves drawing with McKinsey-style timing
      gsap.fromTo(paths, 
        { 
          strokeDasharray: "1200",
          strokeDashoffset: "1200"
        },
        {
          strokeDashoffset: "0",
          duration: 5,
          stagger: 1,
          ease: "power2.inOut"
        }
      );

      // Continuous elegant floating animation
      gsap.to(paths, {
        y: "+=15",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.4
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg
        ref={curvesRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Primary McKinsey-style curve - Sophisticated navy blue */}
        <path
          d="M-300,600 Q200,100 600,500 T1200,300 Q1600,200 2200,400"
          stroke="rgba(59, 130, 246, 0.15)"
          strokeWidth="2.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Secondary curve - Complementary teal */}
        <path
          d="M-200,800 Q400,200 800,600 T1400,400 Q1800,300 2400,500"
          stroke="rgba(20, 184, 166, 0.12)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Tertiary curve - Subtle slate */}
        <path
          d="M-100,400 Q300,800 700,200 T1300,700 Q1700,100 2100,600"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth="1.8"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Quaternary curve - Deep blue accent */}
        <path
          d="M-400,900 Q100,300 500,700 T1100,500 Q1500,800 1900,200"
          stroke="rgba(30, 58, 95, 0.1)"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Additional sophisticated curves */}
        <path
          d="M200,1100 Q600,0 1000,900 T1800,100 Q2000,500 2400,300"
          stroke="rgba(99, 102, 241, 0.06)"
          strokeWidth="1.2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M-500,300 Q0,700 400,100 T1000,800 Q1400,0 1800,600"
          stroke="rgba(74, 123, 167, 0.05)"
          strokeWidth="1"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {/* McKinsey gold accent curve */}
        <path
          d="M-150,1000 Q250,200 650,800 T1250,400 Q1650,600 2050,200"
          stroke="rgba(251, 191, 36, 0.04)"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};