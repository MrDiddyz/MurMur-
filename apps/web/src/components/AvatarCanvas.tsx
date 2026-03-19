// Three.js canvas that renders a placeholder avatar mesh.
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function AvatarCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1220");

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 5;

    const light = new THREE.DirectionalLight("#ffffff", 1.2);
    light.position.set(2, 3, 4);
    scene.add(light);

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.6),
      new THREE.MeshStandardMaterial({ color: "#6aa9ff" })
    );
    scene.add(mesh);

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = 420;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    const loop = () => {
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
}
