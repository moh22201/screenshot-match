import { useGLTF, Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import commercial from "@/assets/models/commercial-center.glb.asset.json";
import recruitment from "@/assets/models/recruitment-center.glb.asset.json";
import oak from "@/assets/models/forest-oak.glb.asset.json";
import pine from "@/assets/models/forest-pine.glb.asset.json";
import rock from "@/assets/models/quarry-rock.glb.asset.json";
import cliff from "@/assets/models/quarry-cliff.glb.asset.json";
import parasol from "@/assets/models/rest-parasol.glb.asset.json";

function Model({ url, height, position = [0, 0, 0], rotation = 0, naturalTint }: { url: string; height: number; position?: [number, number, number]; rotation?: number; naturalTint?: string }) {
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
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (naturalTint && child.material) {
          const tintMaterial = (material: THREE.Material) => {
            const copy = material.clone();
            if ("color" in copy && (copy as THREE.MeshStandardMaterial).color) {
              (copy as THREE.MeshStandardMaterial).color.multiply(new THREE.Color(naturalTint));
            }
            if ("roughness" in copy) (copy as THREE.MeshStandardMaterial).roughness = 0.88;
            return copy;
          };
          child.material = Array.isArray(child.material) ? child.material.map(tintMaterial) : tintMaterial(child.material);
        }
      }
    });
    return object;
  }, [scene, height, naturalTint]);
  return <group position={position} rotation-y={rotation}><primitive object={clone} /></group>;
}

function GlassFacade({ width, height, z }: { width: number; height: number; z: number }) {
  return <group position={[0, height / 2 + 0.3, z]}>
    <mesh><boxGeometry args={[width, height, 0.08]} /><meshPhysicalMaterial color="#75acbb" metalness={0.55} roughness={0.12} clearcoat={1} /></mesh>
    {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[(i / 6 - 0.5) * width, 0, 0.07]}><boxGeometry args={[0.075, height, 0.08]} /><meshStandardMaterial color="#e3e9e7" metalness={0.7} roughness={0.3} /></mesh>)}
    {Array.from({ length: 4 }, (_, i) => <mesh key={i} position={[0, (i / 3 - 0.5) * height, 0.07]}><boxGeometry args={[width, 0.1, 0.08]} /><meshStandardMaterial color="#e3e9e7" metalness={0.7} roughness={0.3} /></mesh>)}
  </group>;
}

function BuildingName({ children, position, size }: { children: string; position: [number, number, number]; size: number }) {
  return <Text
    position={position}
    fontSize={size}
    color="#f7f7f2"
    outlineColor="#172326"
    outlineWidth={0.045}
    anchorX="center"
    anchorY="middle"
    maxWidth={8}
    textAlign="center"
  >{children}</Text>;
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
      return <Model key={`tree-${i}`} url={i % 3 === 0 ? pine.url : oak.url} height={5 + (i % 5)} position={[-38 + Math.cos(angle) * radius, 0, -31 + Math.sin(angle) * radius]} rotation={angle} naturalTint="#a8bd82" />;
    })}
    <group position={[35, 0, -28]}>
      {[[-9, 0, -6], [0, 0, -9], [8, 0, -5]].map((p, i) => <Model key={i} url={cliff.url} height={6 + i} position={p as [number, number, number]} rotation={i * 0.55} naturalTint="#b6a58a" />)}
      {Array.from({ length: 10 }, (_, i) => <Model key={`rock-${i}`} url={rock.url} height={1.2 + i % 3} position={[(i % 4) * 3 - 5, 0, Math.floor(i / 4) * 3]} rotation={i * 1.3} naturalTint="#b7aa96" />)}
    </group>
    {[[-7, 0.15, 12], [0, 0.15, 13], [7, 0.15, 12]].map((p, i) => <group key={i} position={p as [number, number, number]}>
      <Model url={parasol.url} height={3} />
      <mesh position={[0, 0.7, 0]} castShadow><cylinderGeometry args={[0.85, 0.85, 0.12, 24]} /><meshStandardMaterial color="#dce3e1" roughness={0.6} /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * 1.15, 0.42, 0]} castShadow><boxGeometry args={[0.65, 0.15, 1.3]} /><meshStandardMaterial color="#546a68" roughness={0.7} /></mesh>)}
    </group>)}
  </group>;
}