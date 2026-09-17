import type { V2Scene } from "./schema";
import { compileChoreography, type ScheduledTrack } from "./choreography";

export type RuntimeActor = {
  id: string;
  asset: string;
  x: number;
  y: number;
  facing: "left" | "right";
  pose: string;
  emotion: string;
  opacity: number;
  scale: number;
};

export type RuntimeObject = {
  id: string;
  asset: string;
  x: number;
  y: number;
  opacity: number;
  rotation: number;
  scale: number;
  state: string;
};

export type RuntimeFrame = {
  timeMs: number;
  actors: RuntimeActor[];
  objects: RuntimeObject[];
  effects: Array<{ id: string; kind: string; actor?: string; progress: number }>;
};

type Point = { x: number; y: number };
type Motion = { track: ScheduledTrack; from: Point; to: Point };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

const pointForTarget = (
  target: ScheduledTrack["target"],
  objects: RuntimeObject[],
  fallback: Point,
): Point => {
  if (!target) return fallback;
  if (typeof target === "string") {
    const object = objects.find((item) => item.id === target);
    return object ? { x: object.x - 35, y: object.y } : fallback;
  }
  return target;
};

/** Build movement paths once from the actor's initial position, without mutating runtime state. */
const buildMotions = (scene: V2Scene, tracks: ScheduledTrack[], objects: RuntimeObject[]) => {
  const motions = new Map<string, Motion[]>();

  for (const actor of scene.actors) {
    let cursor: Point = { x: actor.x, y: actor.y };
    const actorMotions: Motion[] = [];

    for (const track of tracks.filter((item) => item.actor === actor.id)) {
      if (track.type !== "enter" && track.type !== "move" && track.type !== "exit") continue;

      const from = { ...cursor };
      const to = track.type === "exit"
        ? { x: 460, y: cursor.y }
        : pointForTarget(track.target, objects, cursor);

      actorMotions.push({ track, from, to });
      cursor = to;
    }

    motions.set(actor.id, actorMotions);
  }

  return motions;
};

const sampleMotion = (motion: Motion, time: number): { point: Point; progress: number } => {
  const { track, from, to } = motion;
  const progress = track.end > track.start
    ? clamp((time - track.start) / (track.end - track.start), 0, 1)
    : time >= track.start ? 1 : 0;
  const eased = smoothstep(progress);
  return {
    point: {
      x: from.x + (to.x - from.x) * eased,
      y: from.y + (to.y - from.y) * eased,
    },
    progress,
  };
};

/** Samples a V2 scene from one deterministic clock value. No CSS timeline is involved. */
export const sampleV2Frame = (scene: V2Scene, timeMs: number): RuntimeFrame => {
  const time = clamp(timeMs, 0, scene.durationMs);
  const tracks = compileChoreography(scene);
  const objects: RuntimeObject[] = scene.objects.map((object) => ({
    ...object,
    opacity: 1,
    rotation: 0,
    scale: 1,
    state: "idle",
  }));
  const motions = buildMotions(scene, tracks, objects);

  const actors: RuntimeActor[] = scene.actors.map((actor) => ({
    ...actor,
    pose: "idle",
    emotion: "neutral",
    opacity: 1,
    scale: 1,
  }));
  const effects: RuntimeFrame["effects"] = [];

  for (const actor of actors) {
    const actorTracks = tracks.filter((track) => track.actor === actor.id);
    const actorMotions = motions.get(actor.id) ?? [];
    const activeMotion = [...actorMotions].reverse().find((motion) => time >= motion.track.start);

    if (activeMotion) {
      const sampled = sampleMotion(activeMotion, time);
      actor.x = sampled.point.x;
      actor.y = sampled.point.y;
      actor.facing = activeMotion.to.x >= activeMotion.from.x ? "right" : "left";
      if (time <= activeMotion.track.end) actor.pose = "walk";
      if (activeMotion.track.type === "exit") actor.opacity = 1 - sampled.progress;
    }

    for (const track of actorTracks) {
      if (time < track.start) continue;
      const progress = track.end > track.start
        ? clamp((time - track.start) / (track.end - track.start), 0, 1)
        : 1;

      if (track.type === "stop" || track.type === "settle") {
        actor.pose = "idle";
      } else if (track.type === "pose") {
        actor.pose = track.action ?? "idle";
      } else if (track.type === "interact") {
        actor.pose = track.action ?? "interact";
        if (typeof track.target === "string") {
          const object = objects.find((item) => item.id === track.target);
          if (object) object.state = track.action ?? "interact";
        }
      } else if (track.type === "react") {
        actor.pose = "react";
        actor.emotion = track.emotion ?? "surprised";
      }

      if (track.type === "effect" && track.effect && time <= track.end) {
        effects.push({ id: track.id, kind: track.effect, actor: track.actor, progress });
      }
    }
  }

  return { timeMs: time, actors, objects, effects };
};
