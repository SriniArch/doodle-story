import { compileScene } from "@/engine/compile";
import { DEFAULT_SCENE_MS as ENGINE_SCENE_MS, type EngineScene, type Story } from "@/engine/schema";
import { validateStory } from "@/engine/validate";

export type Mood = "Funny" | "Emotional" | "Motivational" | "Calm";
export type PropName = "clock" | "bed" | "coffee" | "laptop" | "car" | "sun" | "plant" | "star";
export type SceneAction = "wake" | "work" | "walk" | "sip" | "celebrate" | "reflect";
export type SceneExpression =
  "smile" | "sleepy" | "surprised" | "focused" | "soft" | "happy" | "worried";

export type SceneEntrance = "walk-in" | "fade-in" | "pop-in" | "none";
export type SceneAnimAction =
  "wake" | "walk" | "sip" | "spill" | "work" | "react" | "celebrate" | "reflect";
export type SceneReaction = "surprise" | "happy" | "worried" | "sleepy" | "none";
export type SceneExit = "walk-out" | "fade-out" | "none";
export type SceneGag =
  "coffee-spill" | "alarm-ring" | "phone-buzz" | "papers-fly" | "sleepy-zzz" | "spark" | "none";

/** Optional per-scene choreography. Existing scenes without this still work. */
export type SceneAnimation = {
  entrance?: SceneEntrance;
  action?: SceneAnimAction;
  reaction?: SceneReaction;
  exit?: SceneExit;
  gag?: SceneGag;
};

export type ResolvedSceneAnimation = {
  entrance: SceneEntrance;
  action: SceneAnimAction;
  reaction: SceneReaction;
  exit: SceneExit;
  gag: SceneGag;
};

export type StoryScene = EngineScene & {
  duration: number;
  animation?: SceneAnimation | undefined;
};

export type Storyboard = Story & {
  scenes: StoryScene[];
};

/** Shared scene length — React playback and the engine clock both use this. */
export const DEFAULT_SCENE_MS = ENGINE_SCENE_MS;

const moodEndings: Record<Mood, string> = {
  Funny: "Somehow, the chaos made a pretty good story.",
  Emotional: "And in that quiet moment, everything felt a little lighter.",
  Motivational: "One small step became proof that I could keep going.",
  Calm: "The day softened, and I let myself breathe.",
};

const detectProps = (text: string): PropName[] => {
  const source = text.toLowerCase();
  const matches: Array<[RegExp, PropName]> = [
    [/morning|late|time|alarm/, "clock"],
    [/sleep|bed|woke|tired/, "bed"],
    [/coffee|tea|cafe|spill/, "coffee"],
    [/work|email|code|meeting|laptop/, "laptop"],
    [/drive|car|traffic|road/, "car"],
    [/sun|outside|bright/, "sun"],
  ];
  const found = matches.filter(([pattern]) => pattern.test(source)).map(([, prop]) => prop);
  return found.length ? found : ["coffee", "sun"];
};

const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

type Beat = {
  setting: StoryScene["setting"];
  action: SceneAction;
  expression: SceneExpression;
  props: PropName[];
  animation: SceneAnimation;
};

function inferBeat(
  fragment: string,
  index: number,
  isLast: boolean,
  mood: Mood,
  fallbackProps: PropName[],
): Beat {
  const t = fragment.toLowerCase();

  if (isLast) {
    const celebrate =
      mood === "Motivational" || mood === "Funny" || /great|finish|proud|celebrat|relief/.test(t);
    return {
      setting: "open",
      action: celebrate ? "celebrate" : "reflect",
      expression: mood === "Emotional" ? "soft" : "happy",
      props: ["star"],
      animation: {
        entrance: "fade-in",
        action: celebrate ? "celebrate" : "reflect",
        reaction: celebrate ? "happy" : "none",
        exit: "none",
        gag: celebrate ? "spark" : "none",
      },
    };
  }

  if (/woke|wake|late|alarm|sleep|tired|bed/.test(t)) {
    return {
      setting: "bedroom",
      action: "wake",
      expression: "sleepy",
      props: ["clock", "bed"],
      animation: {
        entrance: "fade-in",
        action: "wake",
        reaction: "surprise",
        exit: "none",
        gag: "alarm-ring",
      },
    };
  }

  if (/spill|spilled/.test(t) || (/coffee|tea/.test(t) && /before|mess|oops|knock/.test(t))) {
    return {
      setting: "cafe",
      action: "sip",
      expression: "surprised",
      props: ["coffee", "plant"],
      animation: {
        entrance: "walk-in",
        action: "spill",
        reaction: "surprise",
        exit: "none",
        gag: "coffee-spill",
      },
    };
  }

  if (/coffee|tea|sip|cafe/.test(t)) {
    return {
      setting: "cafe",
      action: "sip",
      expression: "soft",
      props: ["coffee", "plant"],
      animation: {
        entrance: "walk-in",
        action: "sip",
        reaction: "happy",
        exit: "walk-out",
        gag: "none",
      },
    };
  }

  if (/meeting|terrible|awful|worst|deadline|stress/.test(t)) {
    return {
      setting: "desk",
      action: "work",
      expression: "worried",
      props: ["laptop", "plant"],
      animation: {
        entrance: "walk-in",
        action: "work",
        reaction: "worried",
        exit: "none",
        gag: "phone-buzz",
      },
    };
  }

  if (/laptop|work|working|email|code|desk|project/.test(t)) {
    return {
      setting: "desk",
      action: "work",
      expression: "focused",
      props: ["laptop", "plant"],
      animation: {
        entrance: "walk-in",
        action: "work",
        reaction: "none",
        exit: "none",
        gag: "none",
      },
    };
  }

  if (/walk|outside|street|commute|drive|traffic/.test(t)) {
    return {
      setting: "street",
      action: "walk",
      expression: "smile",
      props: ["car", "sun"],
      animation: {
        entrance: "walk-in",
        action: "walk",
        reaction: "happy",
        exit: "walk-out",
        gag: "none",
      },
    };
  }

  if (/finish|finished|great|proud|celebrat|relief|made it/.test(t)) {
    return {
      setting: "open",
      action: "celebrate",
      expression: "happy",
      props: ["star", "sun"],
      animation: {
        entrance: "pop-in",
        action: "celebrate",
        reaction: "happy",
        exit: "none",
        gag: "spark",
      },
    };
  }

  const settings = ["bedroom", "desk", "street", "cafe", "open"] as const;
  const actions: SceneAction[] = ["wake", "work", "walk", "sip", "reflect", "celebrate"];
  const expressions: SceneExpression[] = ["sleepy", "focused", "smile", "worried", "happy", "soft"];
  const action = actions[index % actions.length] ?? "reflect";
  const expression = expressions[index % expressions.length] ?? "soft";
  const first = fallbackProps[index % fallbackProps.length] ?? "sun";
  const second = fallbackProps[(index + 1) % fallbackProps.length] ?? "coffee";

  return {
    setting: settings[index % settings.length] ?? "open",
    action,
    expression,
    props: [...new Set([first, second])],
    animation: {
      entrance:
        action === "wake" || action === "reflect"
          ? "fade-in"
          : action === "celebrate"
            ? "pop-in"
            : "walk-in",
      action,
      reaction: "none",
      exit: action === "walk" ? "walk-out" : "none",
      gag:
        action === "wake" && first === "clock"
          ? "alarm-ring"
          : action === "celebrate"
            ? "spark"
            : "none",
    },
  };
}

/**
 * Resolve optional animation instructions into a full choreography plan.
 * Existing scenes without `animation` get sensible defaults from action/expression/props.
 */
export function resolveSceneAnimation(
  scene: Pick<StoryScene, "action" | "expression" | "props" | "setting" | "id"> & {
    animation?: SceneAnimation | undefined;
  },
): ResolvedSceneAnimation {
  const partial = scene.animation ?? {};
  const hasCoffee = scene.props.includes("coffee");
  const hasClock = scene.props.includes("clock");
  const hasLaptop = scene.props.includes("laptop");

  const entrance: SceneEntrance =
    partial.entrance ??
    (scene.action === "wake" || scene.action === "reflect" || scene.action === "celebrate"
      ? scene.action === "celebrate"
        ? "pop-in"
        : "fade-in"
      : "walk-in");

  let action: SceneAnimAction = partial.action ?? scene.action;
  if (!partial.action && hasCoffee && scene.expression === "surprised" && scene.action === "sip") {
    action = "spill";
  }

  let reaction: SceneReaction =
    partial.reaction ??
    (scene.expression === "surprised"
      ? "surprise"
      : scene.expression === "happy" || scene.expression === "smile"
        ? "happy"
        : scene.expression === "worried"
          ? "worried"
          : scene.expression === "sleepy"
            ? "sleepy"
            : "none");

  // Spill / wake beats need a clear reaction even if expression was set earlier as sleepy.
  if (!partial.reaction && action === "spill") reaction = "surprise";
  if (!partial.reaction && action === "wake") reaction = "surprise";
  if (!partial.reaction && action === "celebrate") reaction = "happy";

  let exit: SceneExit =
    partial.exit ??
    (scene.action === "walk" || scene.setting === "street"
      ? "walk-out"
      : scene.action === "sip" && action !== "spill"
        ? "walk-out"
        : "none");

  let gag: SceneGag = partial.gag ?? "none";
  if (partial.gag === undefined) {
    if (action === "spill" && hasCoffee) gag = "coffee-spill";
    else if (action === "wake" && hasClock) gag = "alarm-ring";
    else if (action === "wake") gag = "sleepy-zzz";
    else if (reaction === "sleepy") gag = "sleepy-zzz";
    else if (action === "work" && scene.expression === "worried") gag = "phone-buzz";
    else if (action === "work" && hasLaptop && scene.id % 2 === 1) gag = "papers-fly";
    else if (action === "celebrate") gag = "spark";
    else if (entrance === "none") gag = "none";
  }

  // Entrance/exit coherence: don't walk out if we never walked in.
  if (entrance === "none" || entrance === "fade-in" || entrance === "pop-in") {
    if (exit === "walk-out" && partial.exit === undefined) exit = "none";
  }

  return { entrance, action, reaction, exit, gag };
}

export function generateStoryboard(entry: string, mood: Mood): Storyboard {
  const clean = tidy(entry);
  const sentences = clean
    .split(/[.!?]+/)
    .map(tidy)
    .filter(Boolean);
  const props = detectProps(clean);
  const count = Math.min(6, Math.max(4, sentences.length + 2));
  const fragments = sentences.length ? sentences : ["Today had a story hiding in it"];

  const scenes: StoryScene[] = Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1;
    const fragment =
      fragments[Math.min(index, fragments.length - 1)] ?? "Today had a story hiding in it";
    const caption = isLast
      ? moodEndings[mood]
      : index === 0
        ? `It started like this: ${fragment}.`
        : `${fragment}${/[.!?]$/.test(fragment) ? "" : "."}`;

    // Map real sentence fragments to beats; filler scenes get varied defaults.
    const hasOwnFragment = index < fragments.length;
    const beat =
      hasOwnFragment || isLast
        ? inferBeat(fragment, index, isLast, mood, props)
        : inferBeat("", index, false, mood, props);
    const resolved = resolveSceneAnimation({
      id: index + 1,
      setting: beat.setting,
      action: beat.action,
      expression: beat.expression,
      props: beat.props,
      animation: beat.animation,
    });

    const compiled = compileScene({
      id: index + 1,
      setting: beat.setting,
      action: beat.action,
      expression: beat.expression,
      props: beat.props,
      caption,
      duration: DEFAULT_SCENE_MS,
      animation: resolved,
    });

    return {
      ...compiled,
      duration: compiled.durationMs,
      animation: resolved,
    };
  });

  const firstWords = clean.split(" ").slice(0, 5).join(" ");
  const story = validateStory({
    title: firstWords
      ? `${firstWords}${clean.split(" ").length > 5 ? "…" : ""}`
      : "A little day worth remembering",
    mood,
    createdAt: new Date().toISOString(),
    scenes,
  });

  return {
    ...story,
    scenes: story.scenes.map((scene, index) => ({
      ...scene,
      duration: scene.durationMs,
      animation: scenes[index]?.animation,
    })),
  };
}
