import { EFFECT_ACTIONS, OBJECT_ACTIONS, type Beat, type EngineScene, type Entity } from "./schema";
import { STAGE, approachPoint } from "./layout";

export type ActorPose =
  | "idle"
  | "walk"
  | "run"
  | "sit"
  | "stand"
  | "look"
  | "point"
  | "wave"
  | "talk"
  | "pickUp"
  | "putDown"
  | "react"
  | "celebrate"
  | "sip"
  | "reach"
  | "work"
  | "wake";

export type ActorFrame = {
  id: string;
  kind: string;
  x: number;
  y: number;
  pose: ActorPose;
  facing: 1 | -1;
  opacity: number;
  scale: number;
  held: string | null;
  feeling: string | null;
  fx: string[];
  expression: EngineScene["expression"];
};

export type ObjectFrame = {
  id: string;
  kind: Entity["kind"];
  x: number;
  y: number;
  opacity: number;
  rotation: number;
  scale: number;
  fx: string | null;
  heldBy: string | null;
};

export type EffectFrame = {
  id: string;
  kind: string;
  x: number;
  y: number;
  parent?: string;
  text?: string;
};

export type FrameState = {
  actors: ActorFrame[];
  objects: ObjectFrame[];
  effects: EffectFrame[];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

const isPoint = (target: Beat["target"]): target is { x: number; y: number } =>
  typeof target === "object" && target !== null && "x" in target;

const defaultDuration = (action: string) => {
  if (action === "moveTo" || action === "walk" || action === "run" || action === "exit" || action === "enter") {
    return 700;
  }
  if (action === "react" || action === "celebrate") return 900;
  if (EFFECT_ACTIONS.has(action)) return 800;
  return 600;
};

const paramString = (params: Beat["params"], key: string) => {
  const value = params?.[key];
  return typeof value === "string" ? value : "";
};

const isMoveAction = (action: string, beat: Beat) =>
  action === "moveTo" ||
  action === "move" ||
  ((action === "walk" || action === "run" || action === "enter" || action === "exit") && beat.target !== undefined);

type PathSeg = {
  start: number;
  end: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  pose: ActorPose;
};

const resolveDest = (
  beat: Beat,
  lookup: Map<string, Entity>,
  current: { x: number; y: number },
): { x: number; y: number } => {
  if (!beat.target) {
    if (beat.action === "exit") return { x: STAGE.exitX, y: STAGE.groundY };
    if (beat.action === "enter") return { x: STAGE.centerX, y: STAGE.groundY };
    return current;
  }
  if (isPoint(beat.target)) return beat.target;
  const entity = lookup.get(beat.target);
  if (!entity) return current;
  if (entity.kind === "person") return { x: entity.x, y: entity.y };
  return approachPoint(entity);
};

const poseFromBeat = (beat: Beat, moving: boolean): ActorPose => {
  const style = paramString(beat.params, "style");
  if (beat.action === "moveTo" || beat.action === "walk" || beat.action === "enter" || beat.action === "exit") {
    return moving ? (style === "run" ? "run" : "walk") : "idle";
  }
  if (beat.action === "run") return "run";
  if (beat.action === "interact") {
    if (style === "sip") return "sip";
    if (style === "spill" || style === "reach") return "reach";
    if (style === "work") return "work";
    if (style === "wake") return "wake";
    return "look";
  }
  if (beat.action === "pickUp") return "pickUp";
  if (beat.action === "putDown") return "putDown";
  if (
    beat.action === "idle" ||
    beat.action === "sit" ||
    beat.action === "stand" ||
    beat.action === "look" ||
    beat.action === "point" ||
    beat.action === "wave" ||
    beat.action === "talk" ||
    beat.action === "react" ||
    beat.action === "celebrate"
  ) {
    return beat.action;
  }
  return moving ? "walk" : "idle";
};

const buildPath = (initial: Entity, beats: Beat[], lookup: Map<string, Entity>): PathSeg[] => {
  let x = initial.x;
  let y = initial.y;
  const segs: PathSeg[] = [];
  for (const beat of beats) {
    if (!isMoveAction(beat.action, beat) && beat.action !== "exit") continue;
    const dest = resolveDest(beat, lookup, { x, y });
    const duration = beat.duration ?? defaultDuration(beat.action);
    segs.push({
      start: beat.at,
      end: beat.at + duration,
      from: { x, y },
      to: dest,
      pose: beat.action === "run" ? "run" : "walk",
    });
    x = dest.x;
    y = dest.y;
  }
  return segs;
};

const samplePath = (segs: PathSeg[], initial: Entity, t: number) => {
  let x = initial.x;
  let y = initial.y;
  let moving = false;
  let movePose: ActorPose = "walk";
  let facing: 1 | -1 = 1;
  for (const seg of segs) {
    if (t < seg.start) break;
    const span = Math.max(16, seg.end - seg.start);
    if (t >= seg.end) {
      x = seg.to.x;
      y = seg.to.y;
      facing = seg.to.x >= seg.from.x ? 1 : -1;
      moving = false;
      continue;
    }
    const u = easeInOut(clamp((t - seg.start) / span, 0, 1));
    x = lerp(seg.from.x, seg.to.x, u);
    y = lerp(seg.from.y, seg.to.y, u);
    moving = true;
    movePose = seg.pose;
    facing = seg.to.x >= seg.from.x ? 1 : -1;
    break;
  }
  return { x, y, moving, movePose, facing };
};

const enterStyle = (beats: Beat[]) => {
  const enter = beats.find((beat) => beat.action === "enter");
  return paramString(enter?.params, "style");
};

export const sampleFrame = (scene: EngineScene, t: number): FrameState => {
  const lookup = new Map<string, Entity>();
  for (const entity of [...scene.characters, ...scene.objects]) lookup.set(entity.id, entity);

  const sorted = [...scene.beats].sort((a, b) => a.at - b.at || a.actor.localeCompare(b.actor));
  const objects: ObjectFrame[] = scene.objects.map((object) => ({
    id: object.id,
    kind: object.kind,
    x: object.x,
    y: object.y,
    opacity: 1,
    rotation: 0,
    scale: 1,
    fx: null,
    heldBy: object.heldBy ?? null,
  }));
  const objectMap = new Map(objects.map((object) => [object.id, object]));

  for (const beat of sorted) {
    const object = objectMap.get(beat.actor);
    if (!object) continue;
    const duration = beat.duration ?? defaultDuration(beat.action);
    if (t < beat.at) continue;
    const active = t < beat.at + duration || OBJECT_ACTIONS.has(beat.action);

    if (beat.action === "disappear" && t >= beat.at) object.opacity = t >= beat.at + duration ? 0 : 1 - (t - beat.at) / duration;
    if (beat.action === "appear") object.opacity = clamp((t - beat.at) / duration, 0, 1);
    if (beat.action === "shake" && active) object.fx = "shake";
    if (beat.action === "open" && t >= beat.at) object.fx = "open";
    if (beat.action === "close" && t >= beat.at) object.fx = "close";
    if (beat.action === "interact" && t >= beat.at)
      object.fx = paramString(beat.params, "fx") || "interact";
    if (beat.action === "spill" && t >= beat.at && t < beat.at + duration + 400) object.fx = "spill";
    if (beat.action === "bounce" && active) object.fx = "bounce";
    if (beat.action === "fall" && active) object.fx = "fall";
    if (isMoveAction(beat.action, beat) && beat.target) {
      const dest = resolveDest(beat, lookup, object);
      const u = clamp((t - beat.at) / duration, 0, 1);
      if (t >= beat.at) {
        const eased = easeInOut(Math.min(1, u));
        object.x = lerp(lookup.get(object.id)?.x ?? object.x, dest.x, t >= beat.at + duration ? 1 : eased);
        object.y = lerp(lookup.get(object.id)?.y ?? object.y, dest.y, t >= beat.at + duration ? 1 : eased);
      }
    }
  }

  const effects: EffectFrame[] = [];
  for (const beat of sorted) {
    if (!EFFECT_ACTIONS.has(beat.action) && beat.action !== "speech") continue;
    const duration = beat.duration ?? defaultDuration(beat.action);
    if (t < beat.at || t > beat.at + duration + 200) continue;
    const parent = lookup.get(beat.actor) ?? scene.characters[0];
    const host = objectMap.get(beat.actor);
    const x = host?.x ?? parent?.x ?? STAGE.centerX;
    const y = host?.y ?? parent?.y ?? STAGE.groundY;
    effects.push({
      id: `${beat.action}-${beat.at}`,
      kind: paramString(beat.params, "variant") || beat.action,
      x,
      y,
      parent: beat.actor,
      ...(paramString(beat.params, "text") ? { text: paramString(beat.params, "text") } : {}),
    });
  }

  const actors: ActorFrame[] = scene.characters.map((character) => {
    const mine = sorted.filter((beat) => beat.actor === character.id);
    const path = buildPath(character, mine, lookup);
    const pos = samplePath(path, character, t);
    let pose: ActorPose = pos.moving ? pos.movePose : "idle";
    let feeling: string | null = null;
    let opacity = 1;
    let scale = 1;
    let held: string | null = null;
    const fx: string[] = [];

    const style = enterStyle(mine);
    const enterBeat = mine.find((beat) => beat.action === "enter");
    if (enterBeat) {
      const duration = enterBeat.duration ?? 700;
      if (style === "fade-in" || style === "pop-in") {
        opacity = clamp(t / duration, 0, 1);
      }
      if (style === "pop-in") {
        scale = lerp(0.72, 1, easeInOut(clamp(t / duration, 0, 1)));
      }
    }
    const exitBeat = mine.find((beat) => beat.action === "exit");
    if (exitBeat) {
      const fade = paramString(exitBeat.params, "style") === "fade-out";
      const duration = exitBeat.duration ?? 700;
      if (fade && t >= exitBeat.at) {
        opacity = 1 - clamp((t - exitBeat.at) / duration, 0, 1);
      }
    }

    for (const beat of mine) {
      if (t < beat.at) continue;
      if (EFFECT_ACTIONS.has(beat.action) && beat.action !== "spill") continue;
      const duration = beat.duration ?? defaultDuration(beat.action);
      if (isMoveAction(beat.action, beat) && t >= beat.at && t < beat.at + duration) {
        pose = poseFromBeat(beat, true);
        continue;
      }
      if (beat.action === "pickUp" && t >= beat.at) {
        held = typeof beat.target === "string" ? beat.target : null;
        const obj = held ? objectMap.get(held) : undefined;
        if (obj) {
          obj.heldBy = character.id;
          obj.x = pos.x + 22;
          obj.y = pos.y + 8;
        }
      }
      if (beat.action === "putDown" && t >= beat.at) {
        held = null;
      }
      if (t >= beat.at && (t <= beat.at + duration || ["idle", "sit", "stand", "look", "work"].includes(poseFromBeat(beat, false)))) {
        if (!OBJECT_ACTIONS.has(beat.action) || beat.action === "interact") {
          if (!EFFECT_ACTIONS.has(beat.action) || beat.action === "spill") {
            const nextPose = poseFromBeat(beat, pos.moving && isMoveAction(beat.action, beat));
            if (!(pos.moving && (nextPose === "idle" || nextPose === "stand"))) pose = nextPose;
          }
        }
      }
      if (beat.action === "react" && t >= beat.at) {
        feeling = paramString(beat.params, "feeling") || "surprise";
      }
    }

    if (pos.moving && (pose === "idle" || pose === "stand")) pose = pos.movePose;
    for (const effect of effects) {
      if (effect.parent === character.id) fx.push(effect.kind);
    }

    return {
      id: character.id,
      kind: character.kind,
      x: pos.x,
      y: pos.y,
      pose,
      facing: pos.facing,
      opacity,
      scale,
      held,
      feeling,
      fx,
      expression: scene.expression,
    };
  });

  for (const actor of actors) {
    if (!actor.held) continue;
    const obj = objectMap.get(actor.held);
    if (obj) {
      obj.x = actor.x + 22;
      obj.y = actor.y + 8;
      obj.heldBy = actor.id;
    }
  }

  return { actors, objects: [...objectMap.values()], effects };
};
