import {
  CHARACTER_ACTIONS,
  DEFAULT_SCENE_MS,
  EFFECT_ACTIONS,
  KNOWN_ACTIONS,
  OBJECT_ACTIONS,
  beatSchema,
  sceneSchema,
  storySchema,
  type Beat,
  type EngineScene,
  type Story,
} from "./schema";

const fallbackAction = (action: string): Beat["action"] => {
  if (CHARACTER_ACTIONS.has(action) || OBJECT_ACTIONS.has(action) || EFFECT_ACTIONS.has(action)) {
    return action;
  }
  if (/react|surprise|shock|wow/i.test(action)) return "react";
  if (/move|go|walk|run/i.test(action)) return "moveTo";
  return "idle";
};

export const sanitizeBeat = (raw: unknown): Beat | null => {
  const parsed = beatSchema.safeParse(raw);
  if (!parsed.success) return null;
  const beat = parsed.data;
  if (!KNOWN_ACTIONS.has(beat.action)) {
    return { ...beat, action: fallbackAction(beat.action) };
  }
  return beat;
};

export const sanitizeScene = (raw: unknown, index: number): EngineScene | null => {
  const parsed = sceneSchema.safeParse(raw);
  if (parsed.success) {
    return {
      ...parsed.data,
      beats: parsed.data.beats
        .map((beat) => sanitizeBeat(beat))
        .filter((beat): beat is Beat => beat !== null),
    };
  }

  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const beats = Array.isArray(value["beats"])
    ? value["beats"].map(sanitizeBeat).filter((beat): beat is Beat => beat !== null)
    : [];

  const recovered = {
    id: typeof value["id"] === "number" ? value["id"] : index + 1,
    caption: typeof value["caption"] === "string" ? value["caption"] : "A small moment.",
    durationMs: typeof value["durationMs"] === "number" ? value["durationMs"] : DEFAULT_SCENE_MS,
    setting: value["setting"] ?? "open",
    action: value["action"] ?? "reflect",
    expression: value["expression"] ?? "soft",
    props: Array.isArray(value["props"]) ? value["props"] : [],
    characters: Array.isArray(value["characters"]) ? value["characters"] : [],
    objects: Array.isArray(value["objects"]) ? value["objects"] : [],
    environment: value["environment"] ?? { kind: value["setting"] ?? "open" },
    beats,
  };

  const retry = sceneSchema.safeParse(recovered);
  return retry.success ? { ...retry.data, beats } : null;
};

/** Validate story JSON. Unknown actions fall back instead of breaking playback. */
export const validateStory = (input: unknown): Story => {
  const parsed = storySchema.safeParse(input);
  if (parsed.success) {
    return {
      ...parsed.data,
      scenes: parsed.data.scenes.map((scene, index) => sanitizeScene(scene, index) ?? scene),
    };
  }

  if (!input || typeof input !== "object") {
    return {
      title: "A little day worth remembering",
      mood: "Calm",
      createdAt: new Date().toISOString(),
      scenes: [
        {
          id: 1,
          caption: "The day softened, and I let myself breathe.",
          durationMs: DEFAULT_SCENE_MS,
          setting: "open",
          action: "reflect",
          expression: "soft",
          props: ["star"],
          characters: [{ id: "person", kind: "person", x: 250, y: 165 }],
          objects: [{ id: "star", kind: "star", x: 400, y: 80 }],
          environment: { kind: "open" },
          beats: [
            { at: 0, actor: "person", action: "enter", duration: 700, params: { style: "fade-in" } },
            { at: 2100, actor: "person", action: "react", duration: 900, params: { feeling: "happy" } },
          ],
        },
      ],
    };
  }

  const value = input as Record<string, unknown>;
  const scenes = Array.isArray(value["scenes"])
    ? value["scenes"]
        .map((scene, index) => sanitizeScene(scene, index))
        .filter((scene): scene is EngineScene => scene !== null)
    : [];

  const recovered = {
    title: typeof value["title"] === "string" ? value["title"] : "A little day worth remembering",
    mood: value["mood"] ?? "Calm",
    createdAt: typeof value["createdAt"] === "string" ? value["createdAt"] : new Date().toISOString(),
    scenes:
      scenes.length > 0
        ? scenes
        : [
            {
              id: 1,
              caption: "A small moment found its way onto the page.",
              durationMs: DEFAULT_SCENE_MS,
              setting: "open",
              action: "reflect",
              expression: "soft",
              props: ["star"],
              characters: [{ id: "person", kind: "person", x: 250, y: 165 }],
              objects: [{ id: "star", kind: "star", x: 400, y: 80 }],
              environment: { kind: "open" },
              beats: [{ at: 0, actor: "person", action: "enter", duration: 700 }],
            },
          ],
  };

  const retry = storySchema.safeParse(recovered);
  if (retry.success) return retry.data;
  return validateStory(null);
};
