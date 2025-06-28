import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

export const Browser3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const browserGroupRef = useRef<THREE.Group>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create browser mockup
    const browserGroup = new THREE.Group();
    browserGroupRef.current = browserGroup;

    // Browser window frame
    const frameGeometry = new THREE.BoxGeometry(4, 2.5, 0.1);
    const frameMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2a2a2a,
      shininess: 100
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    browserGroup.add(frame);

    // Browser screen
    const screenGeometry = new THREE.PlaneGeometry(3.6, 2.1);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1a1a1a,
      shininess: 50
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.051;
    browserGroup.add(screen);

    // Browser top bar
    const topBarGeometry = new THREE.PlaneGeometry(3.6, 0.3);
    const topBarMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333 
    });
    const topBar = new THREE.Mesh(topBarGeometry, topBarMaterial);
    topBar.position.set(0, 0.9, 0.052);
    browserGroup.add(topBar);

    // Browser buttons
    const buttonGeometry = new THREE.CircleGeometry(0.05, 16);
    const redButton = new THREE.Mesh(buttonGeometry, new THREE.MeshPhongMaterial({ color: 0xff5f57 }));
    const yellowButton = new THREE.Mesh(buttonGeometry, new THREE.MeshPhongMaterial({ color: 0xffbd2e }));
    const greenButton = new THREE.Mesh(buttonGeometry, new THREE.MeshPhongMaterial({ color: 0x28ca42 }));

    redButton.position.set(-1.5, 0.9, 0.053);
    yellowButton.position.set(-1.3, 0.9, 0.053);
    greenButton.position.set(-1.1, 0.9, 0.053);

    browserGroup.add(redButton, yellowButton, greenButton);

    // Content blocks (simulating webpage)
    const contentMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });
    
    // Header block
    const headerGeometry = new THREE.PlaneGeometry(3.2, 0.2);
    const header = new THREE.Mesh(headerGeometry, contentMaterial);
    header.position.set(0, 0.5, 0.053);
    browserGroup.add(header);

    // Content blocks
    for (let i = 0; i < 3; i++) {
      const blockGeometry = new THREE.PlaneGeometry(2.8, 0.15);
      const block = new THREE.Mesh(blockGeometry, new THREE.MeshPhongMaterial({ 
        color: 0xcccccc 
      }));
      block.position.set(0, 0.1 - (i * 0.3), 0.053);
      browserGroup.add(block);
    }

    scene.add(browserGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Initial animation
    gsap.fromTo(browserGroup.rotation, 
      { y: Math.PI * 0.3, x: -Math.PI * 0.1 },
      { y: 0, x: 0, duration: 2, ease: "power3.out" }
    );

    gsap.fromTo(browserGroup.position,
      { z: -2, y: 1 },
      { z: 0, y: 0, duration: 2, ease: "power3.out" }
    );

    // Floating animation
    gsap.to(browserGroup.rotation, {
      y: Math.PI * 0.05,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(browserGroup.position, {
      y: 0.2,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};