import type { EngineScene } from "@/engine/schema";
import type { V2Scene, V2Event } from "./schema";

const reactionFor = (expression: EngineScene["expression"]): string => {
  if (expression === "surprised") return "surprised";
  if (expression === "worried") return "worried";
  if (expression === "happy" || expression === "smile") return "happy";
  return "neutral";
};

/** Converts the legacy storyboard scene into the V2 semantic scene contract. */
export const toV2Scene = (scene: EngineScene): V2Scene => {
  const events: V2Event[] = [];
  const actorId = "person";

  for (const beat of scene.beats) {
    const action = beat.action;
    if (action === "enter") {
      events.push({ id: `enter-${beat.at}`, actor: actorId, type: "enter", at: beat.at, duration: beat.duration ?? 700, target: beat.target });
    } else if (action === "moveTo" || action === "walk" || action === "move") {
      events.push({ id: `move-${beat.at}`, actor: actorId, type: "move", at: beat.at, duration: beat.duration ?? 900, target: beat.target });
    } else if (action === "exit") {
      events.push({ id: `exit-${beat.at}`, actor: actorId, type: "exit", at: beat.at, duration: beat.duration ?? 800 });
    } else if (["idle", "sit", "stand", "look", "work", "reflect", "celebrate"].includes(action)) {
      events.push({ id: `pose-${beat.at}`, actor: actorId, type: "pose", at: beat.at, duration: beat.duration ?? 500, action });
    } else if (action === "react") {
      events.push({ id: `react-${beat.at}`, actor: actorId, type: "react", at: beat.at, duration: beat.duration ?? 600, emotion: reactionFor(scene.expression) });
    } else if (["spill", "spark", "smoke", "sweat", "zzz", "exclamation", "question"].includes(action)) {
      events.push({ id: `effect-${beat.at}`, actor: actorId, type: "effect", at: beat.at, duration: beat.duration ?? 500, effect: action });
    } else if (beat.target) {
      events.push({ id: `interact-${beat.at}`, actor: actorId, type: "interact", at: beat.at, duration: beat.duration ?? 500, target: beat.target, action });
    }
  }

  return {
    id: String(scene.id),
    caption: scene.caption,
    durationMs: scene.durationMs,
    environment: { kind: scene.setting },
    actors: [{ id: actorId, asset: "person", x: 250, y: 165, facing: "right" }],
    objects: scene.objects.map((object) => ({ id: object.id, asset: object.kind, x: object.x, y: object.y })),
    events,
  };
};
