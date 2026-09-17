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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

const pointForTarget = (
  target: ScheduledTrack["target"],
  objects: RuntimeObject[],
  fallback: { x: number; y: number },
) => {
  if (!target) return fallback;
  if (typeof target === "string") {
    const object = objects.find((item) => item.id === target);
    return object ? { x: object.x - 35, y: object.y } : fallback;
  }
  return target;
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

  const actors: RuntimeActor[] = scene.actors.map((actor) => ({
    ...actor,
    pose: "idle",
    emotion: "neutral",
    opacity: 1,
    scale: 1,
  }));
  const effects: RuntimeFrame["effects"] = [];

  for (const track of tracks) {
    const actor = actors.find((item) => item.id === track.actor);
    if (!actor) continue;
    const progress = track.end > track.start
      ? clamp((time - track.start) / (track.end - track.start), 0, 1)
      : time >= track.start ? 1 : 0;

    if (track.type === "enter" || track.type === "move") {
      const destination = pointForTarget(track.target, objects, { x: actor.x, y: actor.y });
      const startX = track.type === "enter" ? 40 : actor.x;
      const startY = actor.y;
      const eased = smoothstep(progress);
      actor.x = startX + (destination.x - startX) * eased;
      actor.y = startY + (destination.y - startY) * eased;
      actor.pose = "walk";
      actor.facing = destination.x >= startX ? "right" : "left";
    } else if (track.type === "stop" || track.type === "settle") {
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
    } else if (track.type === "exit") {
      actor.pose = "walk";
      actor.x = actor.x + (460 - actor.x) * smoothstep(progress);
      actor.facing = "right";
      actor.opacity = 1 - progress;
    } else if (track.type === "effect" && track.effect) {
      effects.push({ id: track.id, kind: track.effect, actor: track.actor, progress });
    }
  }

  return { timeMs: time, actors, objects, effects };
};
