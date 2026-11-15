import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const HeroMic3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 300;
    const isInitialMobile = width < 640;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isInitialMobile ? 48 : 38,
      width / height,
      0.1,
      100
    );
    camera.position.set(0, 0, isInitialMobile ? 8.5 : 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Electric Lime #00FF00 + Emerald #10B981)
    const ambientLight = new THREE.AmbientLight(0x022002, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00ff00, 3.5);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x10b981, 2.8);
    fillLight.position.set(-4, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x00ff00, 2.5, 18);
    rimLight.position.set(0, 4, 3);
    scene.add(rimLight);

    const neonAccentLight = new THREE.PointLight(0x00ff00, 2.2, 15);
    neonAccentLight.position.set(-2, 1, 2);
    scene.add(neonAccentLight);

    // 3. Materials
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x072907, // Deep Matrix Carbon Green
      roughness: 0.25,
      metalness: 0.45,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });

    const grillMaterial = new THREE.MeshStandardMaterial({
      color: 0x021402, // Deep Obsidian Carbon
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });

    const metalChrome = new THREE.MeshStandardMaterial({
      color: 0x00ff00, // Electric #00FF00 Chrome
      metalness: 0.85,
      roughness: 0.2,
    });

    const collarMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00, // Electric Lime #00FF00 Accent
      metalness: 0.95,
      roughness: 0.1,
    });

    // 4. Construct 3D Studio Microphone Model
    const micGroup = new THREE.Group();

    // Capsule Grill
    const grillGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.3, 32);
    const grill = new THREE.Mesh(grillGeo, grillMaterial);
    grill.position.y = 1.1;
    micGroup.add(grill);

    // Dome Top
    const domeGeo = new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, grillMaterial);
    dome.position.y = 1.75;
    micGroup.add(dome);

    // Middle Ring Collar
    const collarGeo = new THREE.TorusGeometry(0.78, 0.05, 16, 48);
    const collar = new THREE.Mesh(collarGeo, collarMaterial);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.1;
    micGroup.add(collar);

    // Microphone Cylindrical Body
    const bodyGeo = new THREE.CylinderGeometry(0.72, 0.68, 1.5, 32);
    const body = new THREE.Mesh(bodyGeo, bodyMaterial);
    body.position.y = -0.3;
    micGroup.add(body);

    // Chrome Accent Strip
    const stripeGeo = new THREE.CylinderGeometry(0.73, 0.73, 0.08, 32);
    const stripe = new THREE.Mesh(stripeGeo, metalChrome);
    stripe.position.y = 0.4;
    micGroup.add(stripe);

    // U-Shaped Shockmount Arm
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.15, -0.1, 0),
      new THREE.Vector3(-1.1, -1.0, 0),
      new THREE.Vector3(0, -1.35, 0),
      new THREE.Vector3(1.1, -1.0, 0),
      new THREE.Vector3(1.15, -0.1, 0),
    ]);
    const armGeo = new THREE.TubeGeometry(armCurve, 32, 0.06, 12, false);
    const arm = new THREE.Mesh(armGeo, metalChrome);
    micGroup.add(arm);

    // Side Pivot Knobs
    const knobGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.16, 16);
    const knobL = new THREE.Mesh(knobGeo, metalChrome);
    knobL.rotation.z = Math.PI / 2;
    knobL.position.set(-1.15, -0.1, 0);
    micGroup.add(knobL);

    const knobR = new THREE.Mesh(knobGeo, metalChrome);
    knobR.rotation.z = Math.PI / 2;
    knobR.position.set(1.15, -0.1, 0);
    micGroup.add(knobR);

    // Stand Stem & Base
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 16);
    const stem = new THREE.Mesh(stemGeo, metalChrome);
    stem.position.y = -1.8;
    micGroup.add(stem);

    const baseGeo = new THREE.CylinderGeometry(1.0, 1.1, 0.14, 32);
    const baseMesh = new THREE.Mesh(baseGeo, bodyMaterial);
    baseMesh.position.y = -2.25;
    micGroup.add(baseMesh);

    // Neon Base Ring Accent
    const baseRingGeo = new THREE.TorusGeometry(0.9, 0.03, 16, 48);
    const baseRing = new THREE.Mesh(baseRingGeo, collarMaterial);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -2.18;
    micGroup.add(baseRing);

    scene.add(micGroup);

    // 5. Floating Orbital Sound Wave Rings
    const ringGroup = new THREE.Group();

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
    });
    const ringGeo1 = new THREE.TorusGeometry(1.85, 0.02, 16, 64);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    ringGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.3,
    });
    const ringGeo2 = new THREE.TorusGeometry(2.35, 0.015, 16, 64);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 4;
    ringGroup.add(ring2);

    scene.add(ringGroup);

    // 6. Interactive Mouse Movement & Smooth Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = -y * 0.6;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth lerp mouse tracking
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Gentle floating animation
      micGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;
      micGroup.rotation.y = mouseX * 0.6 + Math.sin(elapsed * 0.5) * 0.05;
      micGroup.rotation.x = mouseY * 0.4 + 0.05;

      // Orbital wave rings rotation
      ringGroup.position.y = micGroup.position.y + 0.4;
      ring1.rotation.z = elapsed * 0.3;
      ring2.rotation.z = -elapsed * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          const isMobile = w < 640;
          camera.fov = isMobile ? 48 : 38;
          camera.aspect = w / h;
          camera.position.z = isMobile ? 8.5 : 7.5;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#00FF00]/10 text-[#00FF00] flex items-center justify-center border border-[#00FF00]/30 mb-3 shadow-[0_0_20px_rgba(0,255,0,0.3)]">
          <span className="text-3xl">🎙️</span>
        </div>
        <p className="text-xs text-slate-400 font-semibold">90.4 MHz Campus Studio Active</p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-[280px] sm:h-[340px] lg:h-[380px] flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
      title="Interactive SMCF Studio Microphone (Move cursor to orbit)"
    />
  );
};
