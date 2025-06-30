import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ThreeSetup, { ThreeSetupConfig } from '../../lib/three-setup';

interface ThreeCanvasProps {
  className?: string;
  config?: ThreeSetupConfig;
  onSetup?: (threeSetup: ThreeSetup) => void;
  onRender?: (threeSetup: ThreeSetup, deltaTime: number) => void;
  style?: React.CSSProperties;
}

export interface ThreeCanvasRef {
  threeSetup: ThreeSetup | null;
}

export const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(({
  className = '',
  config = {},
  onSetup,
  onRender,
  style
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeSetupRef = useRef<ThreeSetup | null>(null);

  useImperativeHandle(ref, () => ({
    threeSetup: threeSetupRef.current
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js setup
    const threeSetup = new ThreeSetup(containerRef.current, config);
    threeSetupRef.current = threeSetup;

    // Call setup callback
    if (onSetup) {
      onSetup(threeSetup);
    }

    // Start render loop
    threeSetup.startRenderLoop(() => {
      const deltaTime = threeSetup.clock.getDelta();
      if (onRender) {
        onRender(threeSetup, deltaTime);
      }
    });

    // Cleanup
    return () => {
      threeSetup.dispose();
      threeSetupRef.current = null;
    };
  }, [config, onSetup, onRender]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={style}
    />
  );
});

ThreeCanvas.displayName = 'ThreeCanvas';