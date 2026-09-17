import type { CSSProperties } from "react";
import { sampleV2Frame, type RuntimeActor, type RuntimeObject, type RuntimeFrame } from "@/engine/v2/runtime";
import { resolveActorAsset, resolveObjectAsset, type AssetRegistry } from "@/engine/v2/assets";
import type { V2Scene } from "@/engine/v2/schema";

const stage = { width: 500, height: 300, groundY: 220 };

type Props = {
  scene: V2Scene;
  timeMs: number;
  registry?: AssetRegistry;
  className?: string;
};

function Actor({ actor }: { actor: RuntimeActor }) {
  const flip = actor.facing === "left" ? -1 : 1;
  const pose = actor.pose;
  const armY = pose === "celebrate" ? -28 : 8;
  const armX = pose === "reach" ? 30 : 24;
  const emotion = actor.emotion;

  return (
    <g transform={`translate(${actor.x} ${actor.y}) scale(${flip * actor.scale} ${actor.scale})`} opacity={actor.opacity}>
      <circle cx="0" cy="-42" r="22" fill="white" stroke="currentColor" strokeWidth="3" />
      <circle cx="-7" cy="-46" r="2" fill="currentColor" />
      <circle cx="7" cy="-46" r="2" fill="currentColor" />
      {emotion === "surprised" ? <circle cx="0" cy="-33" r="4" fill="none" stroke="currentColor" strokeWidth="2" /> : <path d="M-7-32 Q0-25 7-32" fill="none" stroke="currentColor" strokeWidth="2" />}
      <path d="M0-20V48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d={`M0 0 L${-armX} ${armY}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d={`M0 0 L${armX} ${armY}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d={pose === "walk" ? "M0 48L-30 88M0 48L18 82" : "M0 48L-24 88M0 48L24 88"} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {pose === "celebrate" ? <text x="30" y="-65" fontSize="24">✦</text> : null}
    </g>
  );
}

function ObjectShape({ object }: { object: RuntimeObject }) {
  const common = { fill: "white", stroke: "currentColor", strokeWidth: 3 };
  const x = object.x;
  const y = object.y;
  const transform = `translate(${x} ${y}) rotate(${object.rotation}) scale(${object.scale})`;

  if (object.asset === "clock") return <g transform={transform} opacity={object.opacity}><circle r="20" {...common} /><path d="M0-12V0L9 5" fill="none" stroke="currentColor" strokeWidth="3" /></g>;
  if (object.asset === "coffee") return <g transform={transform} opacity={object.opacity}><path d="M-14-14H14V14H-14Z" {...common} /><path d="M14-7H20a7 7 0 0 1 0 14H14" fill="none" stroke="currentColor" strokeWidth="3" /></g>;
  if (object.asset === "laptop") return <g transform={transform} opacity={object.opacity}><rect x="-30" y="-25" width="60" height="42" rx="3" {...common} /><path d="M-40 17H40L30 25H-30Z" {...common} /></g>;
  if (object.asset === "bed") return <g transform={transform} opacity={object.opacity}><rect x="-42" y="-8" width="84" height="25" rx="4" {...common} /><rect x="-42" y="-25" width="25" height="34" rx="4" {...common} /></g>;
  if (object.asset === "car") return <g transform={transform} opacity={object.opacity}><path d="M-42 0L-30-25H24L42 0V20H-42Z" {...common} /><circle cx="-25" cy="20" r="9" {...common} /><circle cx="25" cy="20" r="9" {...common} /></g>;
  if (object.asset === "sun") return <g transform={transform} opacity={object.opacity}><circle r="18" {...common} /><path d="M0-30V-38M0 30V38M-30 0H-38M30 0H38M-22-22L-28-28M22 22L28 28M22-22L28-28M-22 22L-28 28" stroke="currentColor" strokeWidth="3" /></g>;
  if (object.asset === "plant") return <g transform={transform} opacity={object.opacity}><path d="M-16 5H16L11 30H-11Z" {...common} /><path d="M0 5V-25M0-10C-24-8-22-28-22-28 0-30 4-15 0-10M0-2C24-2 24-22 24-22 4-25-3-12 0-2" fill="none" stroke="currentColor" strokeWidth="3" /></g>;
  return <g transform={transform} opacity={object.opacity}><path d="M0-24L7-7L25-5L11 7L15 25L0 15L-15 25L-11 7L-25-5L-7-7Z" {...common} /></g>;
}

function Effects({ frame }: { frame: RuntimeFrame }) {
  return <g>{frame.effects.map((effect) => {
    const actor = effect.actor ? frame.actors.find((item) => item.id === effect.actor) : undefined;
    const x = actor?.x ?? 250;
    const y = (actor?.y ?? 150) - 65;
    if (effect.kind === "spark" || effect.kind === "celebrate") return <text key={effect.id} x={x + 28} y={y} fontSize="28">✦</text>;
    if (effect.kind === "smoke") return <text key={effect.id} x={x + 25} y={y} fontSize="25">☁</text>;
    if (effect.kind === "sweat") return <text key={effect.id} x={x + 25} y={y} fontSize="22">💧</text>;
    if (effect.kind === "question") return <text key={effect.id} x={x + 25} y={y} fontSize="28">?</text>;
    return <text key={effect.id} x={x + 25} y={y} fontSize="28">!</text>;
  })}</g>;
}

export function V2SceneRenderer({ scene, timeMs, registry, className }: Props) {
  const frame = sampleV2Frame(scene, timeMs);
  const style = { "--scene-duration": `${scene.durationMs}ms` } as CSSProperties;

  return (
    <svg className={className} viewBox={`0 0 ${stage.width} ${stage.height}`} role="img" aria-label={scene.caption || scene.id} style={style}>
      <rect width={stage.width} height={stage.height} fill="white" />
      <path d={`M25 ${stage.groundY}H475`} stroke="currentColor" strokeWidth="2" fill="none" />
      <text x="24" y="28" fontSize="12" fill="currentColor" opacity="0.55">{scene.environment.kind}</text>
      {frame.objects.map((object) => <g key={object.id} data-asset={resolveObjectAsset(object.asset, registry)}><ObjectShape object={object} /></g>)}
      <Effects frame={frame} />
      {frame.actors.map((actor) => <g key={actor.id} data-asset={resolveActorAsset(actor.asset, registry)}><Actor actor={actor} /></g>)}
    </svg>
  );
}
