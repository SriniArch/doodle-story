import type { CSSProperties } from "react";

import { sampleFrame, type ActorFrame, type EffectFrame, type FrameState, type ObjectFrame } from "@/engine/sampler";
import type { EntityKind } from "@/engine/schema";
import type { StoryScene } from "@/lib/storyboard";

let lastSceneLogAt = 0;

function DoodleProp({ object }: { object: ObjectFrame }) {
  const name = object.kind as EntityKind;
  const { x, y, fx } = object;
  if (name === "clock") return <g className="prop prop-clock" data-fx={fx ?? "none"} opacity={object.opacity} transform={`translate(${x} ${y})`}><g className="clock-body"><circle r="19" /><path className="clock-hands" d="M0-12V0l9 5" /><path className="clock-bells" d="M-14-15l-7-7m35 7 7-7" /></g>{fx === "shake" ? <path className="clock-rings" d="M26-4c8 6 8 16 0 22M32-8c12 8 12 24 0 32" /> : null}</g>;
  if (name === "bed") return <g className="prop prop-bed" opacity={object.opacity} transform={`translate(${x} ${y})`}><path d="M-34 10V-14h55a12 12 0 0 1 12 12v12M-34 0h67" /><path className="bed-pillow" d="M-28-9h19" /><path d="M-35 10v11m68-11v11" /></g>;
  if (name === "coffee") return <g className="prop prop-coffee" data-fx={fx === "spill" ? "spill" : "none"} opacity={object.opacity} transform={`translate(${x} ${y})`}><g className="coffee-cup"><path d="M-14-12h27v27h-27zM13-6h7a8 8 0 0 1 0 16h-7" /></g><path className="coffee-steam steam-a" d="M-7-19c-5-7 5-8 0-15" /><path className="coffee-steam steam-b" d="M5-19c-5-7 5-8 0-15" />{fx === "spill" ? <g className="coffee-miss"><path d="M-10 20c-2 7-1 14 2 18" /><path d="M-18 14c-3 8-2 14 1 20" /></g> : null}</g>;
  if (name === "laptop") return <g className="prop prop-laptop" data-fx={fx ?? "idle"} opacity={object.opacity} transform={`translate(${x} ${y})`}><g className="laptop-lid"><path d="M-30-23h60v40h-60z" /><circle className="doodle-fill laptop-dot" cx="0" cy="-3" r="3" /></g><path className="laptop-base" d="M-40 17h80l-8 8h-64z" /></g>;
  if (name === "car") return <g className="prop prop-car" opacity={object.opacity} transform={`translate(${x} ${y})`}><path d="M-38 4l7-22h46l18 22v18h-71zM-25-18l10-13h23l12 13M-22 4h15m20 0h15" /><g className="car-wheel" transform="translate(-22 22)"><circle r="8" /></g><g className="car-wheel" transform="translate(22 22)"><circle r="8" /></g></g>;
  if (name === "sun") return <g className="prop prop-sun" opacity={object.opacity} transform={`translate(${x} ${y})`}><g className="sun-spin"><circle r="15" /><path d="M0-29v-9M0 29v9M-29 0h-9M29 0h9M-21-21l-7-7M21 21l7 7M21-21l7-7M-21 21l-7 7" /></g></g>;
  if (name === "plant") return <g className="prop prop-plant" opacity={object.opacity} transform={`translate(${x} ${y})`}><path d="M-17 6h34l-5 29h-24z" /><path d="M0 6v-28" /><path className="plant-leaf leaf-a" d="M0-12c-19 1-18-17-18-17 15-2 19 9 18 17Z" /><path className="plant-leaf leaf-b" d="M0-5c20 0 20-18 20-18-16-2-21 9-20 18Z" /></g>;
  return <g className="prop prop-star doodle-star" opacity={object.opacity} transform={`translate(${x} ${y})`}><path d="M0-24 7-7l18 2-14 12 4 18L0 15l-15 10 4-18-14-12 18-2Z" /></g>;
}

function StickFigure({ actor }: { actor: ActorFrame }) {
  const isWalking = actor.pose === "walk" || actor.pose === "run";
  return <g className="actor" data-pose={isWalking ? "walk-engine" : actor.pose} data-feeling={actor.feeling ?? "none"} data-face={actor.feeling === "surprise" ? "surprised" : actor.expression} style={{ opacity: actor.opacity }}>
    <g className="actor-movement" transform={`translate(${actor.x} ${actor.y}) scale(${actor.facing * actor.scale} ${actor.scale})`}>
      <g className="actor-body-motion"><g className="actor-react">
        <g className="stick-head"><circle cy="-37" r="25" /><g className="stick-eyes"><circle className="doodle-fill eye" cx="-9" cy="-41" r="2.5" /><circle className="doodle-fill eye" cx="9" cy="-41" r="2.5" /></g><g className="stick-mouths"><circle className="mouth mouth-surprised" cy="-25" r="4" /><path className="mouth mouth-smile" d="M-7-28q7 8 14 0" /><path className="mouth mouth-sleepy" d="M-6-26h12" /><path className="mouth mouth-focused" d="M-5-26h10" /><path className="mouth mouth-worried" d="M-8-24q4-6 8 0t8 0" /></g>
          {actor.feeling === "sleepy" || actor.pose === "wake" || actor.fx.includes("zzz") ? <g className="gag gag-zzz"><text className="gag-text" x="28" y="-58">z</text><text className="gag-text" x="40" y="-72">z</text><text className="gag-text" x="54" y="-86">Z</text></g> : null}
          {actor.feeling === "worried" || actor.fx.includes("sweat") ? <g className="gag gag-sweat"><path d="M22-48c0 8-6 10-6 14 3 1 8-4 8-10 0-4-2-6-2-4Z" /></g> : null}
          {actor.feeling === "surprise" || actor.fx.includes("exclamation") ? <g className="gag gag-bang"><path d="M28-78v22" /><circle className="doodle-fill" cx="28" cy="-50" r="2.2" /><path d="M42-70v14" /><circle className="doodle-fill" cx="42" cy="-50" r="1.8" /></g> : null}
          {actor.feeling === "happy" && actor.pose === "celebrate" ? <g className="gag gag-hearts"><path d="M-36-70c-4-8 8-10 10-2 2-8 14-6 10 2-3 7-10 12-10 12s-7-5-10-12Z" /></g> : null}
        </g>
        <path className="stick-torso" d="M0-12V58" />
        <g className="stick-arm arm-left"><path d="M0 5-24 19" /></g><g className="stick-arm arm-right"><path d="M0 5l24 19" /></g>
        <g className="stick-arm arm-celebrate-l"><path d="M0 4-26-18" /></g><g className="stick-arm arm-celebrate-r"><path d="M0 4l26-18" /></g><g className="stick-arm arm-sip"><path d="M0 5l17-22" /></g><g className="stick-arm arm-reach"><path d="M0 5l28 4" /></g>
        <g className="stick-leg leg-left"><path d="M0 58-25 95" /></g><g className="stick-leg leg-right"><path d="M0 58 25 95" /></g>
      </g></g>
    </g>
  </g>;
}

function SceneEffects({ effects, frame }: { effects: EffectFrame[]; frame: FrameState }) {
  return <g className="scene-gags">{effects.map((effect) => { const parent = frame.actors.find((actor) => actor.id === effect.parent) ?? frame.objects.find((object) => object.id === effect.parent); const x = parent?.x ?? effect.x; const y = parent?.y ?? effect.y;
    if (effect.kind === "papers") return <g key={effect.id} className="gag gag-papers is-on" transform={`translate(${x} ${y - 40})`}><path d="M-18-8h22l-3 18h-22z" /><path d="M8-2h20l4 16h-22z" /></g>;
    if (effect.kind === "spark") return <g key={effect.id} className="gag gag-spark is-on" transform={`translate(${x - 250} ${y - 165})`}><path d="M250 42l4 10 10 3-8 7 2 11-8-6-8 6 2-11-8-7 10-3z" /></g>;
    if (effect.kind === "speech") return <g key={effect.id} className="gag gag-speech is-on" transform={`translate(${x + 36} ${y - 70})`}><path d="M0 0h84v36H18L8 48z" /><text className="gag-text" x="12" y="24">{effect.text ?? "!"}</text></g>;
    if (effect.kind === "question") return <text key={effect.id} className="gag-text gag-mark is-on" x={x + 28} y={y - 70}>?</text>;
    if (effect.kind === "smoke") return <g key={effect.id} className="gag gag-smoke is-on" transform={`translate(${x} ${y - 30})`}><path d="M0 0c-8-12 8-14 0-24M10 4c-6-10 8-12 2-20" /></g>;
    return null;
  })}</g>;
}

export function DoodleScene({ scene, t, playing }: { scene: StoryScene; t: number; playing: boolean }) {
  const frame = sampleFrame(scene, t); const primary = frame.actors[0];
  // #region agent log
  if (Date.now() - lastSceneLogAt > 400) {
    lastSceneLogAt = Date.now();
    fetch('http://127.0.0.1:7450/ingest/0a73e971-f1fb-419a-b960-f3568ea72850',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c2e5f8'},body:JSON.stringify({sessionId:'c2e5f8',runId:'post-fix',hypothesisId:'A',location:'DoodleScene.tsx:DoodleScene',message:'scene sampled after SceneEffects parse fix',data:{sceneId:scene.id,t,playing,effectCount:frame.effects.length,effectKinds:frame.effects.map((effect)=>effect.kind),actorCount:frame.actors.length},timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion
  const classes = ["doodle-canvas", `action-${scene.action}`, `face-${scene.expression}`, `set-${scene.setting}`, "is-animating", playing ? "is-playing" : "is-paused"].join(" ");
  return <svg className={classes} viewBox="0 0 500 300" role="img" aria-label={`Animated scene: ${scene.caption}`} data-pose={primary?.pose ?? "idle"} data-feeling={primary?.feeling ?? "none"} style={{ "--scene-ms": `${scene.durationMs}ms` } as CSSProperties}><g className="doodle-lines">
    <path className="ground-line set-piece" d="M28 261q91-5 184 0t260-1" />
    {scene.environment.kind === "bedroom" && <path className="set-piece" d="M35 42v218M35 54h84v62H35M48 68h58M48 83h38" />}
    {scene.environment.kind === "desk" && <path className="set-piece" d="M54 205h132M72 205v56m96-56v56M365 47v81m-36-40h72" />}
    {scene.environment.kind === "street" && <><path className="set-piece" d="M34 260V106l55-37 58 37v154M45 124h34v36H45M101 124h34v36h-34" /><path className="motion-line" d="M322 104h86m-67 18h86" /></>}
    {scene.environment.kind === "cafe" && <path className="set-piece" d="M36 260V87h118v173M36 104h118M58 132h75M376 260V85h70v175M390 108h43" />}
    {scene.environment.kind === "open" && <path className="set-piece" d="M65 259q11-52 28 0m-15-17 15-9m-11-8-10-8M408 259q13-68 31 0m-17-25 18-11" />}
    <SceneEffects effects={frame.effects} frame={frame} />{frame.objects.map((object) => <DoodleProp key={object.id} object={object} />)}{frame.actors.map((actor) => <StickFigure key={actor.id} actor={actor} />)}
  </g></svg>;
}
