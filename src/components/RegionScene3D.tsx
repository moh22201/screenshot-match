import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MapControls, Environment, Lightformer } from "@react-three/drei";
import { Suspense, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { MapControls as MapControlsType } from "three-stdlib";
import CityAssets3D from "@/components/CityAssets3D";
import { CITY_SIZE, STARTER_FACILITIES, type CityFocus } from "@/lib/city-layout";

function useGroundTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = "#889b63";
    g.fillRect(0, 0, 1024, 1024);
    let seed = 2718;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 95000; i++) {
      const v = 85 + random() * 55;
      g.fillStyle = `rgba(${v + 20},${v + 37},${v - 15},0.3)`;
      g.fillRect(random() * 1024, random() * 1024, 1 + random() * 5, 1 + random() * 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 5);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

function CameraRig({ focus }: { focus: CityFocus }) {
  const controls = useRef<MapControlsType>(null);
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const facility = STARTER_FACILITIES.find((f) => f.id === focus);
    const x = facility?.x ?? 0;
    const z = facility?.z ?? -6;
    const distance = facility ? 33 : size.width < 600 ? 125 : 95;
    camera.position.set(x + distance * 0.65, distance * 0.9, z + distance * 0.8);
    controls.current?.target.set(x, 0, z);
    controls.current?.update();
    invalidate();
  }, [focus, camera, size.width, invalidate]);
  return <MapControls ref={controls} makeDefault enableDamping minDistance={12} maxDistance={220} maxPolarAngle={1.25} />;
}

function Ready() {
  const done = useRef(false);
  useFrame(({ gl }) => { if (!done.current) { gl.domElement.parentElement?.setAttribute("data-scene-ready", "1"); done.current = true; } });
  return null;
}

function Surface({ position, size, color }: { position: [number, number, number]; size: [number, number]; color: string }) {
  return <mesh position={position} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={size} /><meshStandardMaterial color={color} roughness={0.96} /></mesh>;
}

export default function RegionScene3D({ focus = "all" }: { focus?: CityFocus }) {
  const tex = useGroundTexture();
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [65, 85, 75], fov: 42, near: 0.1, far: 600 }}
    >
      <color attach="background" args={["#b6d1da"]} />
      <fog attach="fog" args={["#b6d1da", 210, 400]} />
      <hemisphereLight args={["#eaf5ff", "#6f794f", 1.1]} />
      <directionalLight position={[-45, 65, 35]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-80} shadow-camera-right={80} shadow-camera-top={80} shadow-camera-bottom={-80} shadow-bias={-0.0003} />
      <Environment>
        <Lightformer intensity={1.5} position={[0, 8, 0]} scale={[20, 20, 1]} />
        <Lightformer intensity={2} color="#c5e7f1" position={[20, 15, 10]} scale={[30, 30, 1]} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[CITY_SIZE, CITY_SIZE]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      <Surface position={[-5, 0.025, 5]} size={[38, 28]} color="#c7ceca" />
      <Surface position={[0, 0.04, 36]} size={[6, 40]} color="#6f7b7b" />
      <Surface position={[35, 0.026, -28]} size={[27, 24]} color="#b2ad96" />
      <Surface position={[17, 0.03, -14]} size={[40, 3]} color="#bfc5b9" />
      <Suspense fallback={null}><CityAssets3D /><Ready /></Suspense>
      <CameraRig focus={focus} />
    </Canvas>
  );
}
