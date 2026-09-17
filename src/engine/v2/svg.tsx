import type { RuntimeActor, RuntimeFrame, RuntimeObject } from "./runtime";
import { resolveActorAsset, resolveObjectAsset, type AssetRegistry } from "./assets";

type Props = { frame: RuntimeFrame; registry?: AssetRegistry };

const Actor = ({ actor }: { actor: RuntimeActor }) => {
  const flip = actor.facing === "left" ? -1 : 1;
  const walk = actor.pose === "walk" || actor.pose === "run";
  return (
    <g opacity={actor.opacity} transform={`translate(${actor.x} ${actor.y}) scale(${flip * actor.scale} ${actor.scale})`}>
      <circle cy={-37} r={25} />
      <circle className="doodle-fill" cx={-9} cy={-41} r={2.5} />
      <circle className="doodle-fill" cx={9} cy={-41} r={2.5} />
      {actor.emotion === "surprised" ? <circle cy={-25} r={4} /> : <path d="M-7-28q7 8 14 0" />}
      <path d="M0-12V58" />
      <path d={walk ? "M0 5-28 12" : "M0 5-24 19"} />
      <path d={walk ? "M0 5 28 19" : "M0 5 24 19"} />
      <path d="M0 58-25 95" />
      <path d="M0 58 25 95" />
      {actor.pose === "celebrate" ? <g><path d="M0 4-26-18" /><path d="M0 4 26-18" /></g> : null}
    </g>
  );
};

const ObjectShape = ({ object }: { object: RuntimeObject }) => {
  switch (object.asset) {
    case "clock": return <g><circle r="19" /><path d="M0-12V0l9 5" /></g>;
    case "bed": return <g><path d="M-34 10V-14h55a12 12 0 0 1 12 12v12M-34 0h67" /><path d="M-34 10v11m68-11v11" /></g>;
    case "coffee": return <g><path d="M-14-12h27v27h-27zM13-6h7a8 8 0 0 1 0 16h-7" />{object.state === "spill" ? <path d="M-10 20c-2 7-1 14 2 18M-18 14c-3 8-2 14 1 20" /> : null}</g>;
    case "laptop": return <g><path d="M-30-23h60v40h-60zM-40 17h80l-8 8h-64z" /></g>;
    case "car": return <g><path d="M-38 4l7-22h46l18 22v18h-71zM-25-18l10-13h23l12 13" /><circle cx="-22" cy="22" r="8" /><circle cx="22" cy="22" r="8" /></g>;
    case "sun": return <g><circle r="15" /><path d="M0-29v-9M0 29v9M-29 0h-9M29 0h9" /></g>;
    case "plant": return <g><path d="M-17 6h34l-5 29h-24zM0 6v-28M0-12c-19 1-18-17-18-17 15-2 19 9 18 17ZM0-5c20 0 20-18 20-18-16-2-21 9-20 18Z" /></g>;
    default: return <path d="M0-24 7-7l18 2-14 12 4 18L0 15l-15 10 4-18-14-12 18-2Z" />;
  }
};

const ObjectNode = ({ object }: { object: RuntimeObject }) => (
  <g opacity={object.opacity} transform={`translate(${object.x} ${object.y}) rotate(${object.rotation}) scale(${object.scale})`}>
    <ObjectShape object={object} />
  </g>
);

const Effects = ({ frame }: { frame: RuntimeFrame }) => (
  <g>{frame.effects.map(effect => {
    const actor = effect.actor ? frame.actors.find(a => a.id === effect.actor) : undefined;
    const x = actor?.x ?? 250;
    const y = (actor?.y ?? 165) - 70;
    if (effect.kind === "exclamation") return <text key={effect.id} x={x + 25} y={y} className="gag-text">!</text>;
    if (effect.kind === "question") return <text key={effect.id} x={x + 25} y={y} className="gag-text">?</text>;
    if (effect.kind === "spark") return <path key={effect.id} d={`M${x+25} ${y}l4 10 10 3-8 7 2 11-8-6-8 6 2-11-8-7 10-3Z`} />;
    return null;
  })}</g>
);

export function V2SvgScene({ frame, registry }: Props) {
  return <svg className="doodle-canvas doodle-v2" viewBox="0 0 500 300" role="img" aria-label="Animated doodle scene">
    <g className="doodle-lines">
      <path className="ground-line set-piece" d="M28 261q91-5 184 0t260-1" />
      {frame.objects.map(object => <g key={object.id} data-asset={resolveObjectAsset(object.asset, registry)}><ObjectNode object={object} /></g>)}
      {frame.actors.map(actor => <g key={actor.id} data-asset={resolveActorAsset(actor.asset, registry)}><Actor actor={actor} /></g>)}
      <Effects frame={frame} />
    </g>
  </svg>;
}
