import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Grid } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

function useGroundTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#6b7a4a";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      const v = 90 + Math.random() * 50;
      g.fillStyle = `rgba(${v},${v + 15},${v - 30},0.35)`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 8);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

export default function RegionScene3D() {
  const tex = useGroundTexture();
  return (
    <Canvas
      shadows
      camera={{ position: [18, 18, 18], fov: 40 }}
      onCreated={({ gl }) => gl.domElement.parentElement?.setAttribute("data-scene-ready", "1")}
    >
      <color attach="background" args={["#9fb3bf"]} />
      <fog attach="fog" args={["#9fb3bf", 40, 90]} />
      <hemisphereLight args={["#dfe9ef", "#4d4532", 0.6]} />
      <directionalLight position={[15, 25, 10]} intensity={2} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} />
      <Environment>
        <Lightformer intensity={1.5} position={[0, 8, 0]} scale={[20, 20, 1]} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      {/* Region plot boundary */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[19.6, 20, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color="#e0a63a" />
      </mesh>
      <Grid position={[0, 0.03, 0]} args={[28, 28]} cellSize={1} sectionSize={4} cellColor="#55603a"
        sectionColor="#3a4228" fadeDistance={60} infiniteGrid={false} />
      <OrbitControls makeDefault enableDamping minDistance={8} maxDistance={60} maxPolarAngle={1.25} />
    </Canvas>
  );
}
