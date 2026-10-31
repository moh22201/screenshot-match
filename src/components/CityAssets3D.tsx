import { useGLTF, Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import commercial from "@/assets/models/commercial-center.glb.asset.json";
import recruitment from "@/assets/models/recruitment-center.glb.asset.json";
import parasol from "@/assets/models/rest-parasol.glb.asset.json";

function Model({ url, height, position = [0, 0, 0], rotation = 0 }: { url: string; height: number; position?: [number, number, number]; rotation?: number }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const object = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const factor = height / Math.max(size.y, 0.01);
    object.scale.setScalar(factor);
    object.position.set(-center.x * factor, -bounds.min.y * factor, -center.z * factor);
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; }
    });
    return object;
  }, [scene, height]);
  return <group position={position} rotation-y={rotation}><primitive object={clone} /></group>;
}

function OrganicTree({ position, scale = 1, pine = false }: { position: [number, number, number]; scale?: number; pine?: boolean }) {
  const clusters = pine ? 4 : 5;
  return <group position={position} scale={scale}>
    <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.18, 0.42, 4.4, 10]} />
      <meshStandardMaterial color="#60452e" roughness={1} />
    </mesh>
    {Array.from({ length: clusters }, (_, i) => {
      const angle = i * 2.39996;
      const y = pine ? 3.2 + i * 0.82 : 4.0 + (i % 2) * 0.7;
      const radius = pine ? 1.55 - i * 0.18 : 1.65;
      return <mesh key={i} position={[Math.cos(angle) * 0.35, y, Math.sin(angle) * 0.35]}
        scale={pine ? [radius * 0.8, 1.8 - i * 0.18, radius * 0.8] : [radius, 1.35 + (i % 3) * 0.2, radius * 0.92]}
        castShadow receiveShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color={pine ? "#315b37" : ["#477344", "#56814a", "#3f693d"][i % 3]} roughness={1} />
      </mesh>;
    })}
  </group>;
}

function NaturalRock({ position, scale = 1, color = "#877b68" }: { position: [number, number, number]; scale?: number; color?: string }) {
  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 3);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const n = 1 + Math.sin(p.getX(i) * 13.1 + p.getY(i) * 8.7 + p.getZ(i) * 11.3) * 0.11
        + Math.cos(p.getX(i) * 19 + p.getZ(i) * 7) * 0.055;
      p.setXYZ(i, p.getX(i) * n, p.getY(i) * n, p.getZ(i) * n);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geometry} position={position} scale={scale} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.98} flatShading={false} />
  </mesh>;
}

function GlassFacade({ width, height, z }: { width: number; height: number; z: number }) {
  return <group position={[0, height / 2 + 0.3, z]}>
    <mesh><boxGeometry args={[width, height, 0.08]} /><meshPhysicalMaterial color="#75acbb" metalness={0.55} roughness={0.12} clearcoat={1} /></mesh>
    {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[(i / 6 - 0.5) * width, 0, 0.07]}><boxGeometry args={[0.075, height, 0.08]} /><meshStandardMaterial color="#e3e9e7" metalness={0.7} roughness={0.3} /></mesh>)}
    {Array.from({ length: 4 }, (_, i) => <mesh key={i} position={[0, (i / 3 - 0.5) * height, 0.07]}><boxGeometry args={[width, 0.1, 0.08]} /><meshStandardMaterial color="#e3e9e7" metalness={0.7} roughness={0.3} /></mesh>)}
  </group>;
}

function BuildingName({ children, position, size }: { children: string; position: [number, number, number]; size: number }) {
  return <Text position={position} fontSize={size} color="#f7f7f2" outlineColor="#172326" outlineWidth={0.045}
    anchorX="center" anchorY="middle" maxWidth={8} textAlign="center">{children}</Text>;
}

export default function CityAssets3D() {
  return <group>
    <group position={[0, 0.12, 0]}>
      <Model url={commercial.url} height={14} />
      <GlassFacade width={7.4} height={11.5} z={3.85} />
      <BuildingName position={[0, 8.5, 4.02]} size={0.85}>COMMERCIAL CENTER</BuildingName>
    </group>
    <group position={[-16, 0.12, 4]}>
      <Model url={recruitment.url} height={8} />
      <GlassFacade width={4.5} height={6.5} z={2.8} />
      <BuildingName position={[0, 5.1, 2.98]} size={0.48}>RECRUITMENT CENTER</BuildingName>
    </group>
    {Array.from({ length: 30 }, (_, i) => {
      const angle = i * 2.39996;
      const radius = 3 + Math.sqrt(i) * 2.2;
      return <OrganicTree key={i} position={[-38 + Math.cos(angle) * radius, 0, -31 + Math.sin(angle) * radius]}
        scale={0.85 + (i % 5) * 0.12} pine={i % 3 === 0} />;
    })}
    <group position={[35, 0, -28]}>
      <NaturalRock position={[-9, 2.5, -6]} scale={[5.2, 7.2, 4.4] as any} color="#a99b83" />
      <NaturalRock position={[0, 3.1, -9]} scale={[6.4, 8.5, 5.2] as any} color="#91836f" />
      <NaturalRock position={[8, 2.2, -5]} scale={[4.8, 6.3, 4.1] as any} color="#b3a48b" />
      {Array.from({ length: 18 }, (_, i) => <NaturalRock key={i}
        position={[(i % 5) * 3.1 - 6, 0.8 + (i % 3) * 0.35, Math.floor(i / 5) * 2.8 - 2]}
        scale={0.9 + (i % 4) * 0.35} color={["#a99b83", "#8e806d", "#b5a58c"][i % 3]} />)}
    </group>
    {[[-7, 0.15, 12], [0, 0.15, 13], [7, 0.15, 12]].map((p, i) => <group key={i} position={p as [number, number, number]}>
      <Model url={parasol.url} height={3} />
      <mesh position={[0, 0.7, 0]} castShadow><cylinderGeometry args={[0.85, 0.85, 0.12, 24]} /><meshStandardMaterial color="#dce3e1" roughness={0.6} /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * 1.15, 0.42, 0]} castShadow><boxGeometry args={[0.65, 0.15, 1.3]} /><meshStandardMaterial color="#546a68" roughness={0.7} /></mesh>)}
    </group>)}
  </group>;
}