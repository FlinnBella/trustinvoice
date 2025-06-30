// Three.js setup utilities for 3D components
import * as THREE from 'three';

export interface ThreeSetupConfig {
  canvas?: HTMLCanvasElement;
  antialias?: boolean;
  alpha?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  stencil?: boolean;
  depth?: boolean;
  logarithmicDepthBuffer?: boolean;
}

export class ThreeSetup {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public clock: THREE.Clock;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, config: ThreeSetupConfig = {}) {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: config.antialias ?? true,
      alpha: config.alpha ?? true,
      powerPreference: config.powerPreference ?? 'high-performance',
      stencil: config.stencil ?? false,
      depth: config.depth ?? true,
      logarithmicDepthBuffer: config.logarithmicDepthBuffer ?? false
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    // Initialize clock
    this.clock = new THREE.Clock();

    // Append renderer to container
    container.appendChild(this.renderer.domElement);

    // Setup resize handling
    this.setupResize(container);
    this.resize(container);
  }

  private setupResize(container: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize(container);
    });
    this.resizeObserver.observe(container);
  }

  private resize(container: HTMLElement) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public startRenderLoop(renderCallback?: () => void) {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      if (renderCallback) {
        renderCallback();
      }
      
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }

  public stopRenderLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public dispose() {
    this.stopRenderLoop();
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Dispose of Three.js objects
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
  }

  // Utility methods for common 3D operations
  public addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    return { ambientLight, directionalLight };
  }

  public addOrbitControls() {
    // Note: This would require importing OrbitControls
    // import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    // const controls = new OrbitControls(this.camera, this.renderer.domElement);
    // return controls;
    console.warn('OrbitControls not implemented. Import from three/examples/jsm/controls/OrbitControls');
  }

  public loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  public loadModel(url: string): Promise<THREE.Group> {
    // Note: This would require importing GLTFLoader
    // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
    return new Promise((resolve, reject) => {
      console.warn('Model loading not implemented. Import GLTFLoader for model loading');
      reject(new Error('Model loading not implemented'));
    });
  }
}

// Utility functions for common 3D operations
export const createBasicMaterial = (color: number = 0xffffff, options: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.1,
    roughness: 0.2,
    ...options
  });
};

export const createGeometry = {
  box: (width = 1, height = 1, depth = 1) => new THREE.BoxGeometry(width, height, depth),
  sphere: (radius = 1, widthSegments = 32, heightSegments = 16) => 
    new THREE.SphereGeometry(radius, widthSegments, heightSegments),
  plane: (width = 1, height = 1) => new THREE.PlaneGeometry(width, height),
  cylinder: (radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8) =>
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
};

export const createMesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

// Animation helpers
export const createAnimation = {
  rotation: (object: THREE.Object3D, speed = 1) => {
    return (deltaTime: number) => {
      object.rotation.y += speed * deltaTime;
    };
  },
  
  float: (object: THREE.Object3D, amplitude = 0.5, frequency = 1) => {
    let time = 0;
    return (deltaTime: number) => {
      time += deltaTime;
      object.position.y += Math.sin(time * frequency) * amplitude * deltaTime;
    };
  },
  
  scale: (object: THREE.Object3D, min = 0.8, max = 1.2, frequency = 1) => {
    let time = 0;
    return (deltaTime: number) => {
      time += deltaTime;
      const scale = min + (max - min) * (Math.sin(time * frequency) + 1) / 2;
      object.scale.setScalar(scale);
    };
  }
};

export default ThreeSetup;