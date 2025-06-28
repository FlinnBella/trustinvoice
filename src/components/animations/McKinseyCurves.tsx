import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const McKinseyCurves: React.FC = () => {
  const curvesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (curvesRef.current) {
      const paths = curvesRef.current.querySelectorAll('path');
      
      gsap.set(paths, { drawSVG: "0%" });
      
      gsap.to(paths, {
        drawSVG: "100%",
        duration: 3,
        stagger: 0.5,
        ease: "power2.inOut"
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        ref={curvesRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Primary flowing curve */}
        <path
          d="M-200,800 Q200,200 600,600 T1400,400 Q1600,300 2000,500"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Secondary curve */}
        <path
          d="M-100,900 Q400,100 800,700 T1600,300 Q1800,200 2200,400"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Tertiary curve */}
        <path
          d="M0,1000 Q300,300 700,800 T1300,500 Q1700,200 2100,600"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Quaternary curve */}
        <path
          d="M-300,700 Q100,400 500,500 T1200,700 Q1500,600 1900,300"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="0.8"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Additional flowing elements */}
        <path
          d="M200,1100 Q600,0 1000,900 T1800,100"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1.2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};