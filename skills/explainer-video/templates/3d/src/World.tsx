import { Billboard, Environment, Lightformer, QuadraticBezierLine, RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { lengthOf, startOf, type SceneId } from "./timeline";

export const C = {
  code: "#4c9dff",
  use: "#2fd39a",
  done: "#ff9a3c",
  bad: "#ff4d5e",
  floor: "#15181e",
  wall: "#1c2028",
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const bounce = (x: number) => {
  const t = clamp(x);
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t - 1.5 / d) ** 2 + 0.75;
  if (t < 2.5 / d) return n * (t - 2.25 / d) ** 2 + 0.9375;
  return n * (t - 2.625 / d) ** 2 + 0.984375;
};
// Progress through a slice of one scene: 0 before `from`, 1 after `to` (both 0..1 of the scene).
const useP = () => {
  const f = useCurrentFrame();
  return (id: SceneId, from = 0, to = 1) => clamp((f - startOf(id) - from * lengthOf(id)) / ((to - from) * lengthOf(id)));
};
const after = (f: number, id: SceneId) => f >= startOf(id);

// Labels are text drawn onto a canvas texture: synchronous, so a frame never renders before its text.
// Inter is loaded by Video before the 3D canvas mounts.
function Label({ children, fontSize = 0.3, color = "#ffffff", fillOpacity = 1, position, letterSpacing = 0 }: { children: string; fontSize?: number; color?: string; fillOpacity?: number; position?: THREE.Vector3 | [number, number, number]; letterSpacing?: number }) {
  const tex = useMemo(() => {
    const px = 128;
    const canvas = document.createElement("canvas");
    const measure = canvas.getContext("2d")!;
    measure.font = `800 ${px}px Inter`;
    (measure as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacing * px}px`;
    const w = Math.ceil(measure.measureText(children).width + px * 0.5);
    canvas.width = w;
    canvas.height = Math.ceil(px * 1.45);
    const g = canvas.getContext("2d")!;
    g.font = `800 ${px}px Inter`;
    (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacing * px}px`;
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(children, w / 2, canvas.height / 2);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { t, aspect: w / canvas.height };
  }, [children, color, letterSpacing]);
  const h = fontSize * 1.45;
  if (fillOpacity <= 0.01) return null;
  return (
    <mesh position={position}>
      <planeGeometry args={[h * tex.aspect, h]} />
      <meshBasicMaterial map={tex.t} transparent opacity={fillOpacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const CODE_OUT = new THREE.Vector3(-6.1, 1.25, 0.2);
const BASE = [
  { name: "user", pos: [-2.6, 0.5, -1.6], at: 0.12 },
  { name: "cart", pos: [-0.6, 0.5, -1.6], at: 0.28 },
  { name: "photo", pos: [1.4, 0.5, -1.6], at: 0.44 },
] as const;
const OLD_CART = new THREE.Vector3(2.6, 0.5, 1.8);
const CACHE = new THREE.Vector3(-2.6, 0.6, 2.2);
const PAGE_COLS = 8;
const PAGE_ROWS = 4;
const pagePos = (i: number) => {
  const layer = Math.floor(i / (PAGE_COLS * PAGE_ROWS));
  const k = i % (PAGE_COLS * PAGE_ROWS);
  return new THREE.Vector3(-0.6 + (k % PAGE_COLS) * 0.72, 0.26 + layer * 0.54, 1.1 + Math.floor(k / PAGE_COLS) * 0.72);
};
const MAX_PAGES = 96;

function Cable({ from, to, color, opacity = 1, width = 2.5, lift = 1.6 }: { from: THREE.Vector3; to: THREE.Vector3; color: string; opacity?: number; width?: number; lift?: number }) {
  if (opacity <= 0.01) return null;
  const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, lift, 0));
  return (
    <>
      <QuadraticBezierLine start={from} end={to} mid={mid} color={color} lineWidth={width * 4} transparent opacity={opacity * 0.18} toneMapped={false} depthWrite={false} />
      <QuadraticBezierLine start={from} end={to} mid={mid} color={color} lineWidth={width} transparent opacity={opacity} toneMapped={false} />
    </>
  );
}

function Crate({ pos, size = 1, color, label, opacity = 1, labelSize = 0.28 }: { pos: THREE.Vector3; size?: number; color: string; label?: string; opacity?: number; labelSize?: number }) {
  return (
    <group position={pos}>
      <RoundedBox args={[size, size, size]} radius={size * 0.08} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} roughness={0.35} metalness={0.05} clearcoat={0.6} clearcoatRoughness={0.3} emissive={color} emissiveIntensity={0.18} transparent={opacity < 1} opacity={opacity} />
      </RoundedBox>
      {label && (
        <Label position={[0, 0, size / 2 + 0.01]} fontSize={labelSize} color="#0d1015" fillOpacity={opacity}>
          {label}
        </Label>
      )}
    </group>
  );
}

function Robot({ pos, carrying }: { pos: THREE.Vector3; carrying: boolean }) {
  const f = useCurrentFrame();
  return (
    <group position={pos}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.42, 48]} />
        <meshPhysicalMaterial color="#d9dde4" roughness={0.25} metalness={0.4} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.56, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.55, 0.08, 48]} />
        <meshStandardMaterial color="#9aa3b0" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0.5, 0.36, 0.18]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={carrying ? C.use : "#7fe7ff"} toneMapped={false} />
      </mesh>
      <mesh position={[0.5, 0.36, -0.18]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={carrying ? C.use : "#7fe7ff"} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.7, 48]} />
        <meshBasicMaterial color="#7fe7ff" transparent opacity={0.25 + 0.15 * Math.sin(f / 4)} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const keys: { id: SceneId; pos: [number, number, number]; look: [number, number, number] }[] = [
    { id: "warehouse", pos: [8, 5.2, 12], look: [-0.5, 0.8, 0] },
    { id: "boxes", pos: [1.5, 3.6, 8.5], look: [-2, 0.6, -0.6] },
    { id: "cleaner", pos: [6.5, 5, 11], look: [1.5, 0.5, 0.8] },
    { id: "leak", pos: [4, 5.5, 10.5], look: [1, 0.6, 2] },
    { id: "full", pos: [11, 10, 15], look: [0.5, 1, 0.5] },
    { id: "snapshot", pos: [7, 7.5, 12.5], look: [-0.5, 0.8, 0.8] },
    { id: "compare", pos: [2.5, 5.5, 11.5], look: [-2.2, 0.8, 1.2] },
  ];
  const start = { pos: [15, 9, 19] as [number, number, number], look: [0, 0.5, 0] as [number, number, number] };
  let i = keys.length - 1;
  while (i > 0 && f < startOf(keys[i]!.id)) i--;
  const from = i === 0 ? start : keys[i - 1]!;
  const to = keys[i]!;
  const t = smooth((f - startOf(to.id)) / (lengthOf(to.id) * 0.85));
  const v = (a: [number, number, number], b: [number, number, number]) => new THREE.Vector3(...a).lerp(new THREE.Vector3(...b), t);
  useLayoutEffect(() => {
    camera.position.copy(v(from.pos, to.pos));
    camera.lookAt(v(from.look, to.look));
  });
  return null;
}

export function World() {
  const f = useCurrentFrame();
  const p = useP();

  const lights = smooth(p("warehouse", 0.15, 0.5));
  const drop = (id: SceneId, at: number, target: THREE.Vector3) => {
    const t = p(id, at, at + 0.14);
    return target.clone().setY(target.y + (1 - bounce(t)) * 7);
  };

  // Old cart: dropped at the start of "cleaner", its cable fades, the robot hauls it off.
  const cartIn = after(f, "cleaner");
  const cut = p("cleaner", 0.18, 0.3);
  const approach = smooth(p("cleaner", 0.3, 0.55));
  const haul = smooth(p("cleaner", 0.62, 0.95));
  const robotHome = new THREE.Vector3(9, 0, 6);
  const robotAtCart = OLD_CART.clone().setY(0).add(new THREE.Vector3(1.1, 0, 0.4));
  const robotGone = new THREE.Vector3(11, 0, 4);
  let robot = robotHome.clone().lerp(robotAtCart, approach).lerp(robotGone, haul);
  const carrying = haul > 0 && !after(f, "leak");
  const cartPos = carrying ? robot.clone().add(new THREE.Vector3(0, 1.1, 0)) : drop("cleaner", 0, OLD_CART);
  const cartVisible = cartIn && !after(f, "leak");

  // Leak: the robot comes for the old pages and is refused.
  const robotBlockedAt = new THREE.Vector3(5.8, 0, 2.0);
  if (after(f, "leak")) robot = new THREE.Vector3(11, 0, 4).lerp(robotBlockedAt, smooth(p("leak", 0.55, 0.78)));
  const refused = p("leak", 0.78, 0.86);
  const robotVisible = after(f, "cleaner") && !after(f, "full");

  const pages = Math.round(after(f, "full") ? 12 + (MAX_PAGES - 12) * smooth(p("full", 0.05, 0.75)) : 12 * p("leak", 0.15, 0.5));
  const alarm = after(f, "full") && !after(f, "snapshot") ? p("full", 0.6, 0.75) * (0.55 + 0.45 * Math.sin(f / 3)) : 0;
  const trace = after(f, "compare") ? smooth(p("compare", 0.45, 0.7)) : 0;
  const pulse = 0.5 + 0.5 * Math.sin(f / 4);

  return (
    <>
      <CameraRig />
      <color attach="background" args={["#0a0c10"]} />
      <fog attach="fog" args={["#0a0c10", 18, 40]} />
      <ambientLight intensity={0.08 + 0.25 * lights} />
      <directionalLight position={[6, 12, 8]} intensity={2.2 * lights} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      <spotLight position={[-6, 9, 4]} angle={0.6} penumbra={0.8} intensity={60 * lights} color="#bcd4ff" castShadow />
      <pointLight position={[3, 4, 3]} intensity={alarm * 40} color={C.bad} distance={18} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={1.2 * lights + 0.1} position={[0, 6, -8]} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={0.8 * lights} position={[-10, 4, 4]} rotation={[0, Math.PI / 2, 0]} scale={[10, 2, 1]} />
      </Environment>

      {/* the warehouse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={C.floor} roughness={0.55} metalness={0.25} />
      </mesh>
      <gridHelper args={[24, 24, "#2a313d", "#1d222b"]} position={[0, 0.002, 0]} />
      <mesh position={[0, 4, -6.5]} receiveShadow>
        <boxGeometry args={[30, 8, 0.4]} />
        <meshStandardMaterial color={C.wall} roughness={0.9} />
      </mesh>
      <Label position={[0, 2.8, -6.25]} fontSize={1.1} color="#2b3240" fillOpacity={0.4 + 0.6 * lights} letterSpacing={0.08}>
        THE HEAP
      </Label>

      {/* your code */}
      <group position={[-7, 0, 0]}>
        <RoundedBox args={[1.6, 1.6, 1.4]} radius={0.08} position={[0, 0.8, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#20262f" roughness={0.3} metalness={0.5} clearcoat={0.5} />
        </RoundedBox>
        <mesh position={[0.81, 1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshBasicMaterial color={alarm > 0 ? C.bad : C.code} toneMapped={false} transparent opacity={0.35 + 0.65 * lights} />
        </mesh>
        <Billboard position={[0, 2.25, 0]}>
          <Label fontSize={0.36} color={alarm > 0 ? C.bad : C.code} fillOpacity={lights}>
            {alarm > 0 ? (p("full", 0.85) > 0 ? "crash" : "slow…") : "your code"}
          </Label>
        </Billboard>
      </group>

      {/* boxes your code holds */}
      {BASE.map((b) => {
        const t = p("boxes", b.at, b.at + 0.14);
        if (t <= 0) return null;
        const pos = drop("boxes", b.at, new THREE.Vector3(...b.pos));
        return (
          <group key={b.name}>
            <Crate pos={pos} color={C.use} label={b.name} />
            <Cable from={CODE_OUT} to={pos.clone().add(new THREE.Vector3(0, 0.5, 0))} color={C.code} opacity={p("boxes", b.at + 0.12, b.at + 0.2)} />
          </group>
        );
      })}

      {/* the old cart the robot removes */}
      {cartVisible && (
        <>
          <Crate pos={cartPos} color={cut > 0.5 ? C.done : C.use} label="old cart" labelSize={0.22} />
          <Cable from={CODE_OUT} to={cartPos.clone().add(new THREE.Vector3(0, 0.5, 0))} color={C.code} opacity={(1 - cut) * p("cleaner", 0.06, 0.12)} />
        </>
      )}

      {/* the cache and the old pages it never lets go of */}
      {after(f, "leak") && (
        <>
          <Crate pos={drop("leak", 0, CACHE)} size={1.2} color={C.use} label="cache" labelSize={0.3} />
          <Cable from={CODE_OUT} to={CACHE.clone().add(new THREE.Vector3(0, 0.6, 0))} color={C.code} opacity={Math.max(p("leak", 0.1, 0.16), trace * pulse)} width={2.5 + 4 * trace * pulse} lift={1} />
          {Array.from({ length: pages }, (_, i) => {
            const pos = pagePos(i);
            return (
              <group key={i}>
                <Crate pos={pos} size={0.5} color={C.done} />
                <Cable from={CACHE.clone().add(new THREE.Vector3(0.6, 0.6, 0))} to={pos.clone().add(new THREE.Vector3(0, 0.25, 0))} color={C.done} width={i < 24 ? 1.6 + 3 * trace * pulse : 1} opacity={i < 24 ? 0.85 : 0.35} lift={0.8} />
              </group>
            );
          })}
        </>
      )}

      {robotVisible && <Robot pos={robot} carrying={carrying} />}
      {refused > 0 && !after(f, "full") && (
        <group position={robotBlockedAt.clone().add(new THREE.Vector3(0, 0.05, 0))}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.95 * refused, 1.1 * refused, 48]} />
            <meshBasicMaterial color={C.bad} toneMapped={false} transparent opacity={0.9} />
          </mesh>
          <Billboard position={[0, 1.4, 0]}>
            <Label fontSize={0.26} color={C.bad} fillOpacity={refused}>still attached</Label>
          </Billboard>
        </group>
      )}

    </>
  );
}
