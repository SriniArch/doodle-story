import type { Beat, EngineScene, Entity, SceneAction, SceneExpression, Setting } from "./schema";
import { DEFAULT_SCENE_MS } from "./schema";
import { STAGE, approachPoint, placeObjects } from "./layout";

export type LegacyAnimation = {
  entrance: "walk-in" | "fade-in" | "pop-in" | "none";
  action: "wake" | "walk" | "sip" | "spill" | "work" | "react" | "celebrate" | "reflect";
  reaction: "surprise" | "happy" | "worried" | "sleepy" | "none";
  exit: "walk-out" | "fade-out" | "none";
  gag: "coffee-spill" | "alarm-ring" | "phone-buzz" | "papers-fly" | "sleepy-zzz" | "spark" | "none";
};

export type CompileInput = {
  id: number;
  setting: Setting;
  action: SceneAction;
  expression: SceneExpression;
  props: EngineScene["props"];
  caption: string;
  duration?: number;
  animation: LegacyAnimation;
};

const AT = { enter: 0, move: 700, interact: 1400, react: 2100, gag: 3000, exit: 3100 } as const;

const primaryTarget = (objects: Entity[], animation: LegacyAnimation, action: SceneAction) => {
  if (action === "walk") return undefined;
  if (animation.action === "spill" || animation.action === "sip" || action === "sip") return objects.find((item) => item.kind === "coffee") ?? objects[0];
  if (action === "work" || animation.action === "work") return objects.find((item) => item.kind === "laptop") ?? objects[0];
  if (action === "wake" || animation.action === "wake") return objects.find((item) => item.kind === "bed") ?? objects.find((item) => item.kind === "clock") ?? objects[0];
  return objects[0];
};

export const compileScene = (input: CompileInput): EngineScene => {
  const durationMs = input.duration ?? DEFAULT_SCENE_MS;
  const objects = placeObjects(input.setting, input.props, input.action);
  const target = primaryTarget(objects, input.animation, input.action);
  const dest = target ? approachPoint(target) : { x: STAGE.centerX, y: STAGE.groundY };
  const walkIn = input.animation.entrance === "walk-in";
  const fadeIn = input.animation.entrance === "fade-in" || input.animation.entrance === "pop-in";
  const person: Entity = { id: "person", kind: "person", x: walkIn ? STAGE.enterX : dest.x, y: STAGE.groundY };

  const beats: Beat[] = [{ at: AT.enter, actor: "person", action: "enter", duration: 700, params: { style: input.animation.entrance === "none" ? "fade-in" : input.animation.entrance } }];

  if (walkIn) beats.push({ at: AT.move, actor: "person", action: "moveTo", target: dest, duration: 700 });

  if (input.action === "walk") {
    beats.push({ at: AT.move, actor: "person", action: "walk", duration: 1700, target: { x: 390, y: STAGE.groundY } });
  }

  const interactStyle = input.animation.action === "spill" ? "spill" : input.animation.action === "sip" ? "sip" : input.animation.action === "work" ? "work" : input.animation.action === "wake" ? "wake" : input.animation.action === "celebrate" ? "celebrate" : "look";

  if (interactStyle === "celebrate") beats.push({ at: AT.interact, actor: "person", action: "celebrate", duration: 900 });
  else if (input.action === "reflect") beats.push({ at: AT.interact, actor: "person", action: "idle", duration: 900 });
  else if (input.action !== "walk") beats.push({ at: AT.interact, actor: "person", action: "interact", target: target?.id, duration: 700, params: { style: interactStyle } });

  if (input.animation.action === "work" && target?.kind === "laptop") beats.push({ at: AT.interact, actor: target.id, action: "open", duration: 800 });
  if (input.animation.action === "spill" && target?.kind === "coffee") {
    beats.push({ at: AT.interact, actor: target.id, action: "spill", duration: 900 });
    beats.push({ at: AT.interact + 200, actor: "person", action: "spill", duration: 700 });
  }
  if (input.animation.action === "wake") {
    const clock = objects.find((item) => item.kind === "clock");
    if (clock) beats.push({ at: 400, actor: clock.id, action: "shake", duration: 900 });
  }

  if (input.animation.reaction !== "none") beats.push({ at: AT.react, actor: "person", action: "react", duration: 900, params: { feeling: input.animation.reaction } });

  if (input.animation.gag === "coffee-spill" && target?.kind === "coffee") beats.push({ at: AT.gag, actor: target.id, action: "spill", duration: 800 });
  else if (input.animation.gag === "alarm-ring") {
    const clock = objects.find((item) => item.kind === "clock");
    if (clock) beats.push({ at: AT.gag, actor: clock.id, action: "shake", duration: 800 });
  } else if (input.animation.gag === "phone-buzz") beats.push({ at: AT.gag, actor: "person", action: "sweat", duration: 800 });
  else if (input.animation.gag === "papers-fly") beats.push({ at: AT.gag, actor: target?.id ?? "person", action: "spark", duration: 800, params: { variant: "papers" } });
  else if (input.animation.gag === "sleepy-zzz") beats.push({ at: 200, actor: "person", action: "zzz", duration: 1600 });
  else if (input.animation.gag === "spark") beats.push({ at: AT.gag, actor: "person", action: "spark", duration: 800 });

  if (input.animation.reaction === "worried") beats.push({ at: AT.react, actor: "person", action: "sweat", duration: 800 });
  if (input.animation.reaction === "surprise") beats.push({ at: AT.react, actor: "person", action: "exclamation", duration: 800 });
  if (input.animation.reaction === "sleepy" && input.animation.gag !== "sleepy-zzz") beats.push({ at: AT.react, actor: "person", action: "zzz", duration: 900 });

  if (input.animation.exit === "walk-out") beats.push({ at: AT.exit, actor: "person", action: "exit", target: { x: STAGE.exitX, y: STAGE.groundY }, duration: 700, params: { style: "walk-out" } });
  else if (input.animation.exit === "fade-out") beats.push({ at: AT.exit, actor: "person", action: "exit", duration: 700, params: { style: "fade-out" } });

  if (fadeIn && !walkIn && person.x === STAGE.enterX) person.x = dest.x;

  return { id: input.id, caption: input.caption, durationMs, setting: input.setting, action: input.action, expression: input.expression, props: input.props, characters: [person], objects, environment: { kind: input.setting }, beats };
};
