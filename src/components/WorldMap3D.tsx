import { Canvas, useFrame } from "@react-three/fiber";
import { MapControls, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Region } from "@/lib/regions";
import { WORLD_WIDTH, WORLD_DEPTH, geographicPosition, worldCell } from "@/lib/world-geography";
import earth from "@/assets/earth.jpg.asset.json";

function GeographicSurface({ regions, onSelect }: { regions: Region[]; onSelect: (id: number) => void }) {
  const texture = useTexture(earth.url);
  texture.colorSpace = THREE.SRGBColorSpace;
  const ready = useRef(false);
  useFrame(({ gl }) => {
    if (!ready.current) {
      gl.domElement.parentElement?.setAttribute("data-scene-ready", "1");
      ready.current = true;
    }
  });
  return <mesh rotation-x={-Math.PI / 2} onClick={(event) => {
    if (!event.uv || event.delta > 5) return;
    event.stopPropagation();
    const cell = worldCell(event.uv.x, event.uv.y);
    const region = regions.find((r) => r.grid_x === cell.grid_x && r.grid_y === cell.grid_y);
    if (region) onSelect(region.id);
  }} onPointerOver={() => { document.body.style.cursor = "crosshair"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
    <planeGeometry args={[WORLD_WIDTH, WORLD_DEPTH]} />
    <meshBasicMaterial map={texture} />
  </mesh>;
}

function LocationMarker({ region, mine }: { region: Region; mine?: boolean }) {
  const { x, z } = geographicPosition(region.grid_x, region.grid_y);
  return <group position={[x, 0.08, z]}>
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.22, 0.28, 40]} />
      <meshBasicMaterial color={mine ? "#f5c565" : "#ffffff"} depthTest={false} />
    </mesh>
    <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.09, 12, 12]} /><meshBasicMaterial color={mine ? "#f5c565" : "#ffffff"} /></mesh>
  </group>;
}

export default function WorldMap3D({
  regions, myId, selectedId, onSelect,
}: { regions: Region[]; myId?: number | undefined; selectedId?: number | undefined; onSelect: (id: number) => void }) {
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 27, 10], fov: 48 }}
    >
      <color attach="background" args={["#071e2a"]} />
      <Suspense fallback={null}><GeographicSurface regions={regions} onSelect={onSelect} /></Suspense>
      {regions.filter((r) => r.id === selectedId || r.id === myId).map((r) => <LocationMarker key={r.id} region={r} mine={r.id === myId} />)}
      <MapControls makeDefault enableDamping enableRotate={false} minDistance={2} maxDistance={42} maxPolarAngle={0.4} />
    </Canvas>
  );
}
