import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

const BrowserModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Initial animation
      gsap.fromTo(groupRef.current.rotation, 
        { y: Math.PI * 0.3, x: -Math.PI * 0.1 },
        { y: 0, x: 0, duration: 2, ease: "power3.out" }
      );

      gsap.fromTo(groupRef.current.position,
        { z: -3, y: 1 },
        { z: 0, y: 0, duration: 2, ease: "power3.out" }
      );
    }
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Browser Frame */}
      <mesh ref={frameRef} position={[0, 0, 0]}>
        <boxGeometry args={[4.5, 3, 0.15]} />
        <meshPhysicalMaterial 
          color="#2a2a2a"
          metalness={0.8}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, -0.1, 0.076]}>
        <planeGeometry args={[4.2, 2.4]} />
        <meshPhysicalMaterial 
          color="#0a0a0a"
          metalness={0.1}
          roughness={0.1}
          emissive="#111111"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Top Bar */}
      <mesh position={[0, 1.05, 0.076]}>
        <planeGeometry args={[4.2, 0.3]} />
        <meshPhysicalMaterial 
          color="#333333"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Traffic Light Buttons */}
      <mesh position={[-1.7, 1.05, 0.08]}>
        <circleGeometry args={[0.06, 16]} />
        <meshPhysicalMaterial 
          color="#ff5f57"
          emissive="#ff5f57"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[-1.5, 1.05, 0.08]}>
        <circleGeometry args={[0.06, 16]} />
        <meshPhysicalMaterial 
          color="#ffbd2e"
          emissive="#ffbd2e"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[-1.3, 1.05, 0.08]}>
        <circleGeometry args={[0.06, 16]} />
        <meshPhysicalMaterial 
          color="#28ca42"
          emissive="#28ca42"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Content Elements */}
      {/* Header */}
      <mesh position={[0, 0.6, 0.077]}>
        <planeGeometry args={[3.8, 0.25]} />
        <meshPhysicalMaterial 
          color="#f5f5f5"
          emissive="#f5f5f5"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Content blocks */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.2 - (i * 0.35), 0.077]}>
          <planeGeometry args={[3.4, 0.2]} />
          <meshPhysicalMaterial 
            color="#cccccc"
            emissive="#cccccc"
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}

      {/* Sidebar */}
      <mesh position={[1.5, -0.2, 0.077]}>
        <planeGeometry args={[1, 1.8]} />
        <meshPhysicalMaterial 
          color="#e5e5e5"
          emissive="#e5e5e5"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* TrustInvoice Logo on screen */}
      <Text
        position={[0, 0.6, 0.078]}
        fontSize={0.15}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        font="/fonts/EB_Garamond/EBGaramond-Regular.ttf"
      >
        TrustInvoice
      </Text>
    </group>
  );
};

export const PhotorealisticBrowser3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Browser Model */}
          <BrowserModel />
          
          {/* Contact Shadows */}
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.4} 
            scale={8} 
            blur={2.5} 
            far={1.5} 
          />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};