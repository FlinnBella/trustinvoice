import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const FixedMcKinseyCurves: React.FC = () => {
  const curvesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (curvesRef.current) {
      const paths = curvesRef.current.querySelectorAll('path');
      
      // Animate curves drawing
      gsap.fromTo(paths, 
        { 
          strokeDasharray: "1000",
          strokeDashoffset: "1000"
        },
        {
          strokeDashoffset: "0",
          duration: 4,
          stagger: 0.8,
          ease: "power2.inOut"
        }
      );

      // Continuous floating animation
      gsap.to(paths, {
        y: "+=20",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3
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
        {/* Primary flowing curve - Most prominent */}
        <path
          d="M-300,600 Q200,100 600,500 T1200,300 Q1600,200 2200,400"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="3"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Secondary curve - Strong visibility */}
        <path
          d="M-200,800 Q400,200 800,600 T1400,400 Q1800,300 2400,500"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="2.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Tertiary curve - Medium visibility */}
        <path
          d="M-100,400 Q300,800 700,200 T1300,700 Q1700,100 2100,600"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Quaternary curve - Subtle but visible */}
        <path
          d="M-400,900 Q100,300 500,700 T1100,500 Q1500,800 1900,200"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1.8"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Additional flowing elements for depth */}
        <path
          d="M200,1100 Q600,0 1000,900 T1800,100 Q2000,500 2400,300"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {/* Extra curves for richness */}
        <path
          d="M-500,300 Q0,700 400,100 T1000,800 Q1400,0 1800,600"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1.2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};