import { useEffect, useState, type CSSProperties } from "react";

import type { PropName, StoryScene } from "@/lib/storyboard";

function DoodleProp({ name, x, y, gag }: { name: PropName; x: number; y: number; gag: boolean }) {
  if (name === "clock") {
    return (
      <g className="prop prop-clock" transform={`translate(${x} ${y})`}>
        <g className="clock-body">
          <circle r="19" />
          <path className="clock-hands" d="M0-12V0l9 5" />
          <path className="clock-bells" d="M-14-15l-7-7m35 7 7-7" />
        </g>
        {gag ? <path className="clock-rings" d="M26-4c8 6 8 16 0 22M32-8c12 8 12 24 0 32" /> : null}
      </g>
    );
  }
  if (name === "bed") {
    return (
      <g className="prop prop-bed" transform={`translate(${x} ${y})`}>
        <path d="M-34 10V-14h55a12 12 0 0 1 12 12v12M-34 0h67" />
        <path className="bed-pillow" d="M-28-9h19" />
        <path d="M-35 10v11m68-11v11" />
      </g>
    );
  }
  if (name === "coffee") {
    return (
      <g className="prop prop-coffee" transform={`translate(${x} ${y})`}>
        <g className="coffee-cup">
          <path d="M-14-12h27v27h-27zM13-6h7a8 8 0 0 1 0 16h-7" />
        </g>
        <path className="coffee-steam steam-a" d="M-7-19c-5-7 5-8 0-15" />
        <path className="coffee-steam steam-b" d="M5-19c-5-7 5-8 0-15" />
        <g className="coffee-drops">
          <path d="M8 18c2 8 1 16-3 22" />
          <path d="M16 16c3 9 4 16 1 24" />
          <path d="M22 12c4 7 6 14 4 20" />
        </g>
      </g>
    );
  }
  if (name === "laptop") {
    return (
      <g className="prop prop-laptop" transform={`translate(${x} ${y})`}>
        <g className="laptop-lid">
          <path d="M-30-23h60v40h-60z" />
          <circle className="doodle-fill laptop-dot" cx="0" cy="-3" r="3" />
        </g>
        <path className="laptop-base" d="M-40 17h80l-8 8h-64z" />
      </g>
    );
  }
  if (name === "car") {
    return (
      <g className="prop prop-car" transform={`translate(${x} ${y})`}>
        <path d="M-38 4l7-22h46l18 22v18h-71zM-25-18l10-13h23l12 13M-22 4h15m20 0h15" />
        <g className="car-wheel" transform="translate(-22 22)">
          <circle r="8" />
          <path d="M0-6V6M-6 0h12" />
        </g>
        <g className="car-wheel" transform="translate(22 22)">
          <circle r="8" />
          <path d="M0-6V6M-6 0h12" />
        </g>
      </g>
    );
  }
  if (name === "sun") {
    return (
      <g className="prop prop-sun" transform={`translate(${x} ${y})`}>
        <g className="sun-spin">
          <circle r="15" />
          <path d="M0-29v-9M0 29v9M-29 0h-9M29 0h9M-21-21l-7-7M21 21l7 7M21-21l7-7M-21 21l-7 7" />
        </g>
      </g>
    );
  }
  if (name === "plant") {
    return (
      <g className="prop prop-plant" transform={`translate(${x} ${y})`}>
        <path d="M-17 6h34l-5 29h-24z" />
        <path d="M0 6v-28" />
        <path className="plant-leaf leaf-a" d="M0-12c-19 1-18-17-18-17 15-2 19 9 18 17Z" />
        <path className="plant-leaf leaf-b" d="M0-5c20 0 20-18 20-18-16-2-21 9-20 18Z" />
      </g>
    );
  }
  return (
    <g className="prop prop-star doodle-star" transform={`translate(${x} ${y})`}>
      <path d="M0-24 7-7l18 2-14 12 4 18L0 15l-15 10 4-18-14-12 18-2Z" />
    </g>
  );
}

function sceneGags(scene: StoryScene) {
  const odd = scene.id % 2 === 1;
  return {
    bang: scene.expression === "surprised",
    zzz: scene.expression === "sleepy" || scene.action === "wake",
    sweat: scene.expression === "worried",
    papers: scene.setting === "desk" && odd,
    phone: scene.action === "work" && !odd,
    hearts: scene.action === "celebrate",
    spark: scene.action === "celebrate",
  };
}

function StickFigure({ scene }: { scene: StoryScene }) {
  const gags = sceneGags(scene);
  const happy = scene.expression === "smile" || scene.expression === "happy" || scene.expression === "soft";

  return (
    <g className="actor">
      <g className="actor-bob">
        <g className="actor-react">
          <g className="stick-head">
            <circle cy="-37" r="25" />
            <g className="stick-eyes">
              <circle className="doodle-fill eye" cx="-9" cy="-41" r="2.5" />
              <circle className="doodle-fill eye" cx="9" cy="-41" r="2.5" />
            </g>
            <g className="stick-mouths">
              <circle className="mouth mouth-surprised" cy="-25" r="4" />
              <path className="mouth mouth-smile" d="M-7-28q7 8 14 0" />
              <path className="mouth mouth-sleepy" d="M-6-26h12" />
              <path className="mouth mouth-focused" d="M-5-26h10" />
              <path className="mouth mouth-worried" d="M-8-24q4-6 8 0t8 0" />
            </g>
            {gags.zzz ? (
              <g className="gag gag-zzz">
                <text className="gag-text" x="28" y="-58">z</text>
                <text className="gag-text" x="40" y="-72">z</text>
                <text className="gag-text" x="54" y="-86">Z</text>
              </g>
            ) : null}
            {gags.sweat ? (
              <g className="gag gag-sweat">
                <path d="M22-48c0 8-6 10-6 14 3 1 8-4 8-10 0-4-2-6-2-4Z" />
                <path d="M30-40c0 6-4 8-4 11" />
              </g>
            ) : null}
            {gags.bang ? (
              <g className="gag gag-bang">
                <path d="M28-78v22" />
                <circle className="doodle-fill" cx="28" cy="-50" r="2.2" />
                <path d="M42-70v14" />
                <circle className="doodle-fill" cx="42" cy="-50" r="1.8" />
              </g>
            ) : null}
            {gags.hearts ? (
              <g className="gag gag-hearts">
                <path d="M-36-70c-4-8 8-10 10-2 2-8 14-6 10 2-3 7-10 12-10 12s-7-5-10-12Z" />
              </g>
            ) : null}
          </g>
          <path className="stick-torso" d="M0-12V58" />
          <g className="stick-arm arm-left"><path d="M0 5-24 19" /></g>
          <g className="stick-arm arm-right"><path d="M0 5l24 19" /></g>
          <g className="stick-arm arm-celebrate-l"><path d="M0 4-26-18" /></g>
          <g className="stick-arm arm-celebrate-r"><path d="M0 4l26-18" /></g>
          <g className="stick-arm arm-sip"><path d="M0 5l17-22" /></g>
          <g className="stick-leg leg-left"><path d="M0 58-24 95" /></g>
          <g className="stick-leg leg-right"><path d="M0 58l25 95" /></g>
          {happy ? <path className="gag gag-wiggle" d="M18 42c8 4 6 12-2 10" /> : null}
        </g>
      </g>
    </g>
  );
}

function SceneGags({ scene }: { scene: StoryScene }) {
  const gags = sceneGags(scene);
  return (
    <g className="scene-gags">
      {gags.papers ? (
        <g className="gag gag-papers" transform="translate(150 210)">
          <path d="M-18-8h22l-3 18h-22z" />
          <path d="M8-2h20l4 16h-22z" />
          <path d="M-6 12h18l-6 14h-16z" />
        </g>
      ) : null}
      {gags.phone ? (
        <g className="gag gag-phone" transform="translate(348 214)">
          <path d="M-8-16h16v30h-16zM-4-12h8" />
        </g>
      ) : null}
      {gags.spark ? (
        <g className="gag gag-spark">
          <path d="M250 42l4 10 10 3-8 7 2 11-8-6-8 6 2-11-8-7 10-3z" />
          <path d="M318 58l3 8 8 2-6 6 1 8-6-4-6 4 1-8-6-6 8-2z" />
        </g>
      ) : null}
    </g>
  );
}

export function DoodleScene({ scene, active }: { scene: StoryScene; active: boolean }) {
  const [animating, setAnimating] = useState(active);

  useEffect(() => {
    if (active) setAnimating(true);
  }, [active]);

  const classes = [
    "doodle-canvas",
    `action-${scene.action}`,
    `face-${scene.expression}`,
    `set-${scene.setting}`,
    animating ? "is-animating" : "",
    active ? "is-playing" : "",
    animating && !active ? "is-paused" : "",
  ].filter(Boolean).join(" ");

  return (
    <svg
      className={classes}
      viewBox="0 0 500 300"
      role="img"
      aria-label={`Animated scene: ${scene.caption}`}
      style={{ "--scene-ms": `${scene.duration}ms` } as CSSProperties}
    >
      <g className="doodle-lines">
        <path className="ground-line set-piece" d="M28 261q91-5 184 0t260-1" />
        {scene.setting === "bedroom" && <path className="set-piece" d="M35 42v218M35 54h84v62H35M48 68h58M48 83h38" />}
        {scene.setting === "desk" && <path className="set-piece" d="M54 205h132M72 205v56m96-56v56M365 47v81m-36-40h72" />}
        {scene.setting === "street" && (
          <>
            <path className="set-piece" d="M34 260V106l55-37 58 37v154M45 124h34v36H45M101 124h34v36h-34" />
            <path className="motion-line" d="M322 104h86m-67 18h86" />
          </>
        )}
        {scene.setting === "cafe" && <path className="set-piece" d="M36 260V87h118v173M36 104h118M58 132h75M376 260V85h70v175M390 108h43" />}
        {scene.setting === "open" && <path className="set-piece" d="M65 259q11-52 28 0m-15-17 15-9m-11-8-10-8M408 259q13-68 31 0m-17-25 18-11" />}
        <SceneGags scene={scene} />
        <StickFigure scene={scene} />
        {scene.props.slice(0, 2).map((prop, index) => (
          <DoodleProp
            key={`${prop}-${index}`}
            name={prop}
            x={index === 0 ? 105 : 400}
            y={index === 0 ? 192 : 177}
            gag={scene.id % 2 === index}
          />
        ))}
      </g>
    </svg>
  );
}
