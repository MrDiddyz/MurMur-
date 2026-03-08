"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function GalleryScene() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Back Wall */}
        <mesh position={[0, 1, -5]}>
          <planeGeometry args={[10, 4]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>

        {/* Left Wall */}
        <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 1, 0]}>
          <planeGeometry args={[10, 4]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>

        {/* Right Wall */}
        <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 1, 0]}>
          <planeGeometry args={[10, 4]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>

        {/* Camera controls */}
        <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
      </Canvas>
    </div>
  );
}
