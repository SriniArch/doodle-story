import type { PropName, StoryScene } from "@/lib/storyboard";

function DoodleProp({ name, x, y }: { name: PropName; x: number; y: number }) {
  if (name === "clock") return <g transform={`translate(${x} ${y})`}><circle r="19"/><path d="M0-12V0l9 5"/><path d="M-14-15l-7-7m35 7 7-7"/></g>;
  if (name === "bed") return <g transform={`translate(${x} ${y})`}><path d="M-34 10V-14h55a12 12 0 0 1 12 12v12M-34 0h67M-28-9h19"/><path d="M-35 10v11m68-11v11"/></g>;
  if (name === "coffee") return <g transform={`translate(${x} ${y})`}><path d="M-14-12h27v27h-27zM13-6h7a8 8 0 0 1 0 16h-7M-7-19c-5-7 5-8 0-15M5-19c-5-7 5-8 0-15"/></g>;
  if (name === "laptop") return <g transform={`translate(${x} ${y})`}><path d="M-30-23h60v40h-60zM-40 17h80l-8 8h-64z"/><circle cx="0" cy="-3" r="3"/></g>;
  if (name === "car") return <g transform={`translate(${x} ${y})`}><path d="M-38 4l7-22h46l18 22v18h-71zM-25-18l10-13h23l12 13M-22 4h15m20 0h15"/><circle cx="-22" cy="22" r="8"/><circle cx="22" cy="22" r="8"/></g>;
  if (name === "sun") return <g transform={`translate(${x} ${y})`}><circle r="15"/><path d="M0-29v-9M0 29v9M-29 0h-9M29 0h9M-21-21l-7-7M21 21l7 7M21-21l7-7M-21 21l-7 7"/></g>;
  if (name === "plant") return <g transform={`translate(${x} ${y})`}><path d="M-17 6h34l-5 29h-24zM0 6v-28M0-12c-19 1-18-17-18-17 15-2 19 9 18 17ZM0-5c20 0 20-18 20-18-16-2-21 9-20 18Z"/></g>;
  return <g className="doodle-star" transform={`translate(${x} ${y})`}><path d="M0-24 7-7l18 2-14 12 4 18L0 15l-15 10 4-18-14-12 18-2Z"/></g>;
}

function StickFigure({ scene }: { scene: StoryScene }) {
  const armPath = scene.action === "celebrate" ? "M0 4-26-18M0 4l26-18" : scene.action === "sip" ? "M0 5-19 17M0 5l17 9" : "M0 5-24 19M0 5l24 19";
  const mouth = scene.expression === "surprised" ? <circle cy="-25" r="4"/> : scene.expression === "smile" || scene.expression === "soft" ? <path d="M-7-28q7 8 14 0"/> : <path d="M-6-26h12"/>;
  return (
    <g className={`stick-person action-${scene.action}`} transform="translate(250 165)">
      <circle cy="-37" r="25" />
      <circle className="doodle-fill" cx="-9" cy="-41" r="2.5"/><circle className="doodle-fill" cx="9" cy="-41" r="2.5"/>{mouth}
      <path d="M0-12V58"/><path d={armPath}/><path d="M0 58-24 95M0 58l25 95"/>
    </g>
  );
}

export function DoodleScene({ scene, active }: { scene: StoryScene; active: boolean }) {
  return (
    <svg className={active ? "doodle-canvas is-playing" : "doodle-canvas"} viewBox="0 0 500 300" role="img" aria-label={`Animated scene: ${scene.caption}`}>
      <g className="doodle-lines">
        <path className="ground-line" d="M28 261q91-5 184 0t260-1"/>
        {scene.setting === "bedroom" && <path d="M35 42v218M35 54h84v62H35M48 68h58M48 83h38"/>}
        {scene.setting === "desk" && <path d="M54 205h132M72 205v56m96-56v56M365 47v81m-36-40h72"/>}
        {scene.setting === "street" && <><path d="M34 260V106l55-37 58 37v154M45 124h34v36H45M101 124h34v36h-34"/><path className="motion-line" d="M322 104h86m-67 18h86"/></>}
        {scene.setting === "cafe" && <path d="M36 260V87h118v173M36 104h118M58 132h75M376 260V85h70v175M390 108h43"/>}
        {scene.setting === "open" && <path d="M65 259q11-52 28 0m-15-17 15-9m-11-8-10-8M408 259q13-68 31 0m-17-25 18-11"/>}
        <StickFigure scene={scene}/>
        {scene.props.slice(0, 2).map((prop, index) => <DoodleProp key={`${prop}-${index}`} name={prop} x={index === 0 ? 105 : 400} y={index === 0 ? 192 : 177}/>) }
      </g>
    </svg>
  );
}