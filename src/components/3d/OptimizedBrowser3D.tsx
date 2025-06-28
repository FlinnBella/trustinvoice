import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Text, Box, Plane, Circle, Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

const BrowserModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Initial dramatic entrance animation
      gsap.fromTo(groupRef.current.rotation, 
        { y: Math.PI * 0.4, x: -Math.PI * 0.15, z: Math.PI * 0.1 },
        { y: 0, x: 0, z: 0, duration: 2.5, ease: "power3.out" }
      );

      gsap.fromTo(groupRef.current.position,
        { z: -4, y: 2, x: 1 },
        { z: 0, y: 0, x: 0, duration: 2.5, ease: "power3.out" }
      );

      gsap.fromTo(groupRef.current.scale,
        { x: 0.5, y: 0.5, z: 0.5 },
        { x: 1, y: 1, z: 1, duration: 2.5, ease: "back.out(1.7)" }
      );
    }
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Continuous elegant floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Browser Frame with premium materials */}
      <Box args={[5, 3.2, 0.2]} position={[0, 0, 0]}>
        <meshPhysicalMaterial 
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={0.8}
        />
      </Box>

      {/* Screen with realistic glow */}
      <Plane args={[4.6, 2.8]} position={[0, -0.05, 0.11]}>
        <meshPhysicalMaterial 
          color="#0d1117"
          metalness={0.1}
          roughness={0.05}
          emissive="#1a1a1a"
          emissiveIntensity={0.3}
          transparent
          opacity={0.95}
        />
      </Plane>

      {/* Top Navigation Bar */}
      <Plane args={[4.6, 0.35]} position={[0, 1.225, 0.111]}>
        <meshPhysicalMaterial 
          color="#21262d"
          metalness={0.2}
          roughness={0.3}
        />
      </Plane>

      {/* Traffic Light Buttons with glow effects */}
      <Circle args={[0.08, 16]} position={[-1.9, 1.225, 0.112]}>
        <meshPhysicalMaterial 
          color="#ff5f57"
          emissive="#ff5f57"
          emissiveIntensity={0.4}
          metalness={0.1}
          roughness={0.2}
        />
      </Circle>
      
      <Circle args={[0.08, 16]} position={[-1.65, 1.225, 0.112]}>
        <meshPhysicalMaterial 
          color="#ffbd2e"
          emissive="#ffbd2e"
          emissiveIntensity={0.4}
          metalness={0.1}
          roughness={0.2}
        />
      </Circle>
      
      <Circle args={[0.08, 16]} position={[-1.4, 1.225, 0.112]}>
        <meshPhysicalMaterial 
          color="#28ca42"
          emissive="#28ca42"
          emissiveIntensity={0.4}
          metalness={0.1}
          roughness={0.2}
        />
      </Circle>

      {/* Address Bar */}
      <Plane args={[3.5, 0.2]} position={[0.3, 1.225, 0.112]}>
        <meshPhysicalMaterial 
          color="#30363d"
          metalness={0.1}
          roughness={0.4}
        />
      </Plane>

      {/* Content Header */}
      <Plane args={[4.2, 0.3]} position={[0, 0.7, 0.112]}>
        <meshPhysicalMaterial 
          color="#f0f6fc"
          emissive="#f0f6fc"
          emissiveIntensity={0.1}
        />
      </Plane>

      {/* Content Blocks with subtle glow */}
      {[0, 1, 2].map((i) => (
        <Plane key={i} args={[3.8, 0.25]} position={[0, 0.25 - (i * 0.4), 0.112]}>
          <meshPhysicalMaterial 
            color="#c9d1d9"
            emissive="#c9d1d9"
            emissiveIntensity={0.05}
            metalness={0.05}
            roughness={0.6}
          />
        </Plane>
      ))}

      {/* Sidebar */}
      <Plane args={[1.2, 2.2]} position={[1.7, -0.1, 0.112]}>
        <meshPhysicalMaterial 
          color="#e6edf3"
          emissive="#e6edf3"
          emissiveIntensity={0.03}
        />
      </Plane>

      {/* TrustInvoice Branding */}
      <Text
        position={[0, 0.7, 0.113]}
        fontSize={0.18}
        color="#24292f"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
        fontWeight="600"
      >
        TrustInvoice
      </Text>

      {/* Subtle reflection plane */}
      <Plane args={[5.2, 3.4]} position={[0, 0, -0.11]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial 
          color="#000000"
          metalness={1}
          roughness={0.1}
          transparent
          opacity={0.1}
        />
      </Plane>
    </group>
  );
};

const LoadingFallback: React.FC = () => (
  <Html center>
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  </Html>
);

export const OptimizedBrowser3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Optimized Lighting Setup */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4f46e5" />
          <spotLight 
            position={[0, 10, 0]} 
            intensity={0.5} 
            angle={0.3} 
            penumbra={1} 
            color="#ffffff"
          />
          
          {/* Premium Environment */}
          <Environment preset="studio" />
          
          {/* Browser Model */}
          <BrowserModel />
          
          {/* Enhanced Contact Shadows */}
          <ContactShadows 
            position={[0, -1.8, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={3} 
            far={2} 
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
};