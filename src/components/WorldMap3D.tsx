import { Canvas } from "@react-three/fiber";
import { MapControls, Environment, Lightformer } from "@react-three/drei";
import { useState } from "react";
import { GRID_W, GRID_H, type Region } from "@/lib/regions";

// Tile colours for the 3D scene (WebGL needs literal colours, not CSS tokens).
const COLORS = {
  available: "#6aa77a",
  reserved: "#b5533f",
  unavailable: "#4a4640",
  mine: "#e0a63a",
  selected: "#f3e3b5",
};
const TILE = 1;
const GAP = 0.08;

function Tile({ r, mine, selected, onSelect }: { r: Region; mine: boolean; selected: boolean; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const base = mine ? COLORS.mine : COLORS[r.status as keyof typeof COLORS] ?? COLORS.unavailable;
  const h = selected ? 0.5 : hover ? 0.3 : r.status === "unavailable" ? 0.1 : 0.2;
  const x = (r.grid_x - GRID_W / 2 + 0.5) * TILE;
  const z = (r.grid_y - GRID_H / 2 + 0.5) * TILE;
  return (
    <mesh
      position={[x, h / 2, z]}
      castShadow
      receiveShadow
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[TILE - GAP, h, TILE - GAP]} />
      <meshStandardMaterial color={selected ? COLORS.selected : base} roughness={0.75} metalness={0.05} />
    </mesh>
  );
}

export default function WorldMap3D({
  regions, myId, selectedId, onSelect,
}: { regions: Region[]; myId?: number | undefined; selectedId?: number | undefined; onSelect: (id: number) => void }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 14, 12], fov: 45 }}
      onCreated={({ gl }) => gl.domElement.parentElement?.setAttribute("data-scene-ready", "1")}
    >
      <color attach="background" args={["#1d1a16"]} />
      <fog attach="fog" args={["#1d1a16", 25, 45]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 14, 6]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <Environment>
        <Lightformer intensity={1.5} position={[0, 6, 0]} scale={[12, 12, 1]} />
        <Lightformer intensity={0.6} color="#d9a868" position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[GRID_W + 4, GRID_H + 4]} />
        <meshStandardMaterial color="#2a2621" roughness={1} />
      </mesh>
      {regions.map((r) => (
        <Tile key={r.id} r={r} mine={r.id === myId} selected={r.id === selectedId} onSelect={() => onSelect(r.id)} />
      ))}
      <MapControls makeDefault enableDamping minDistance={5} maxDistance={30} maxPolarAngle={1.2} />
    </Canvas>
  );
}
