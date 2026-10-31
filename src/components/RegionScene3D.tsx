import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MapControls, Environment, Lightformer } from "@react-three/drei";
import { Suspense, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { MapControls as MapControlsType } from "three-stdlib";
import CityAssets3D from "@/components/CityAssets3D";
import { CITY_SIZE, STARTER_FACILITIES, type CityFocus } from "@/lib/city-layout";

function seededNoise(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

function useGroundTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = "#786044";
    g.fillRect(0, 0, 1024, 1024);
    let seed = 2718;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 110000; i++) {
      const r = 91 + random() * 43;
      const green = 62 + random() * 30;
      const b = 35 + random() * 20;
      g.fillStyle = `rgba(${r},${green},${b},0.28)`;
      g.fillRect(random() * 1024, random() * 1024, 1 + random() * 6, 1 + random() * 5);
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
    const distance = 95;
    camera.position.set(x + distance * 0.65, distance * 0.9, z + distance * 0.8);
    controls.current?.target.set(x, 0, z);
    controls.current?.update();
    invalidate();
  }, [focus, camera, size.width, invalidate]);
  return <MapControls
    ref={controls}
    makeDefault
    enableDamping
    enableZoom
    zoomSpeed={0.8}
    minDistance={58}
    maxDistance={215}
    enablePan
    minPolarAngle={1.25}
    maxPolarAngle={1.25}
  />;
}

function Ready() {
  const done = useRef(false);
  useFrame(({ gl }) => { if (!done.current) { gl.domElement.parentElement?.setAttribute("data-scene-ready", "1"); done.current = true; } });
  return null;
}

function Surface({ position, size, color }: { position: [number, number, number]; size: [number, number]; color: string }) {
  return <mesh position={position} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={size} /><meshStandardMaterial color={color} roughness={0.96} /></mesh>;
}

function Road({ position, length, width, alongX }: { position: [number, number, number]; length: number; width: number; alongX: boolean }) {
  const dashCount = Math.floor(length / 5);
  return <group position={position}>
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={alongX ? [length, width] : [width, length]} />
      <meshStandardMaterial color="#17191b" roughness={0.94} />
    </mesh>
    {Array.from({ length: dashCount }, (_, i) => {
      const offset = (i - (dashCount - 1) / 2) * 5;
      return <mesh key={i} position={alongX ? [offset, 0.035, 0] : [0, 0.035, offset]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={alongX ? [2.6, 0.16] : [0.16, 2.6]} />
        <meshBasicMaterial color="#f4f4ee" />
      </mesh>;
    })}
  </group>;
}

function NaturalLandscape() {
  const terrain = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(760, 760, 120, 120);
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = -positions.getY(i);
      const broad = Math.sin(x * 0.009) * Math.cos(z * 0.008) * 2.8;
      const detail = Math.sin(x * 0.035 + z * 0.021) * 0.7 + seededNoise(Math.round(x / 5), Math.round(z / 5)) * 0.55;
      positions.setZ(i, broad + detail);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  const ridges = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const points: THREE.Vector2[] = [];
    for (let j = 0; j <= 24; j++) {
      const x = -370 + j * (740 / 24);
      const peak = 34 + Math.sin(j * 0.72 + i * 0.8) * 13 + seededNoise(j, i) * 8;
      points.push(new THREE.Vector2(x, peak));
    }
    return points;
  }), []);
  return <group>
    <mesh geometry={terrain} rotation-x={-Math.PI / 2} position={[0, -0.2, 0]} receiveShadow>
      <meshStandardMaterial color="#71865a" roughness={1} />
    </mesh>
    {ridges.map((points, i) => <mesh key={i} position={[0, -1, -300 - i * 9]} receiveShadow>
      <shapeGeometry args={[(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-390, -20);
        points.forEach((p, j) => j === 0 ? shape.lineTo(p.x, p.y) : shape.lineTo(p.x, p.y));
        shape.lineTo(390, -20);
        shape.closePath();
        return shape;
      })()]} />
      <meshStandardMaterial color={i % 2 ? "#697d62" : "#78866e"} roughness={1} side={THREE.DoubleSide} />
    </mesh>)}
    {Array.from({ length: 190 }, (_, i) => {
      const x = seededNoise(i, 7) * 340;
      const z = seededNoise(i, 19) * 340;
      if (Math.abs(x) < 125 && Math.abs(z) < 125) return null;
      const h = 7 + Math.abs(seededNoise(i, 31)) * 8;
      return <group key={i} position={[x, 0, z]}>
        <mesh position={[0, h * 0.38, 0]}><cylinderGeometry args={[0.35, 0.65, h * 0.78, 9]} /><meshStandardMaterial color="#594431" roughness={1} /></mesh>
        {[0, 1, 2].map((k) => <mesh key={k} position={[(k - 1) * 0.65, h * (0.62 + k * 0.075), 0]} scale={[1.15 - k * 0.18, 1.15 - k * 0.12, 1.05]}><sphereGeometry args={[h * 0.29, 14, 11]} /><meshStandardMaterial color={["#355b36", "#416b3d", "#527744"][k]} roughness={1} /></mesh>)}
      </group>;
    })}
  </group>;
}

export default function RegionScene3D({ focus = "all" }: { focus?: CityFocus }) {
  const tex = useGroundTexture();
  return (
    <Canvas shadows frameloop="demand" dpr={[1, 1.5]}
      camera={{ position: [61.75, 85.5, 76], fov: 42, near: 0.1, far: 1200 }}>
      <color attach="background" args={["#b6d1da"]} />
      <fog attach="fog" args={["#b6d1da", 360, 900]} />
      <hemisphereLight args={["#eaf5ff", "#6f794f", 1.1]} />
      <directionalLight position={[-45, 65, 35]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-120} shadow-camera-right={120} shadow-camera-top={120} shadow-camera-bottom={-120} shadow-bias={-0.0003} />
      <Environment>
        <Lightformer intensity={1.5} position={[0, 8, 0]} scale={[20, 20, 1]} />
        <Lightformer intensity={2} color="#c5e7f1" position={[20, 15, 10]} scale={[30, 30, 1]} />
      </Environment>
      <NaturalLandscape />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[CITY_SIZE, CITY_SIZE]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      <Surface position={[-5, 0.025, 5]} size={[38, 28]} color="#c7ceca" />
      <Road position={[0, 0.04, 36]} length={40} width={6} alongX={false} />
      <Surface position={[35, 0.026, -28]} size={[27, 24]} color="#b2ad96" />
      <Road position={[17, 0.03, -14]} length={40} width={3} alongX />
      <Suspense fallback={null}><CityAssets3D /><Ready /></Suspense>
      <CameraRig focus={focus} />
    </Canvas>
  );
}