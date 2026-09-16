import { z } from "zod";

export const moodSchema = z.enum(["Funny", "Emotional", "Motivational", "Calm"]);
export const settingSchema = z.enum(["bedroom", "desk", "street", "cafe", "open"]);

export const characterActionSchema = z.enum([
  "idle",
  "walk",
  "run",
  "sit",
  "stand",
  "look",
  "point",
  "wave",
  "talk",
  "pickUp",
  "putDown",
  "react",
  "celebrate",
  "enter",
  "exit",
  "moveTo",
]);

export const objectActionSchema = z.enum([
  "appear",
  "disappear",
  "move",
  "moveTo",
  "rotate",
  "scale",
  "shake",
  "open",
  "close",
  "fall",
  "bounce",
  "interact",
]);

export const effectActionSchema = z.enum([
  "spill",
  "smoke",
  "sweat",
  "zzz",
  "spark",
  "exclamation",
  "question",
  "speech",
]);

export const BEAT_ACTIONS = [
  "idle",
  "walk",
  "run",
  "sit",
  "stand",
  "look",
  "point",
  "wave",
  "talk",
  "pickUp",
  "putDown",
  "react",
  "celebrate",
  "enter",
  "exit",
  "moveTo",
  "appear",
  "disappear",
  "move",
  "rotate",
  "scale",
  "shake",
  "open",
  "close",
  "fall",
  "bounce",
  "interact",
  "spill",
  "smoke",
  "sweat",
  "zzz",
  "spark",
  "exclamation",
  "question",
  "speech",
] as const;

export const beatActionSchema = z.enum(BEAT_ACTIONS);

export const entityKindSchema = z.enum([
  "person",
  "clock",
  "bed",
  "coffee",
  "laptop",
  "car",
  "sun",
  "plant",
  "star",
  "generic",
]);

export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const entitySchema = z.object({
  id: z.string().min(1),
  kind: entityKindSchema,
  x: z.number(),
  y: z.number(),
  facing: z.enum(["left", "right"]).optional(),
  heldBy: z.string().optional(),
});

export const beatSchema = z.object({
  at: z.number().nonnegative(),
  actor: z.string().min(1),
  action: z.string().min(1),
  target: z.union([z.string(), pointSchema]).optional(),
  duration: z.number().positive().optional(),
  params: z.record(z.unknown()).optional(),
});

export const environmentSchema = z.object({
  kind: settingSchema,
  extras: z.record(z.unknown()).optional(),
});

export const sceneActionSchema = z.enum([
  "wake",
  "work",
  "walk",
  "sip",
  "celebrate",
  "reflect",
]);

export const sceneExpressionSchema = z.enum([
  "smile",
  "sleepy",
  "surprised",
  "focused",
  "soft",
  "happy",
  "worried",
]);

export const sceneSchema = z.object({
  id: z.number(),
  caption: z.string(),
  durationMs: z.number().positive(),
  setting: settingSchema,
  action: sceneActionSchema,
  expression: sceneExpressionSchema,
  props: z.array(z.enum(["clock", "bed", "coffee", "laptop", "car", "sun", "plant", "star"])),
  characters: z.array(entitySchema),
  objects: z.array(entitySchema),
  environment: environmentSchema,
  beats: z.array(beatSchema),
});

export const storySchema = z.object({
  title: z.string(),
  mood: moodSchema,
  createdAt: z.string(),
  durationMs: z.number().positive().optional(),
  scenes: z.array(sceneSchema).min(1),
});

export type Mood = z.infer<typeof moodSchema>;
export type Setting = z.infer<typeof settingSchema>;
export type CharacterAction = z.infer<typeof characterActionSchema>;
export type ObjectAction = z.infer<typeof objectActionSchema>;
export type EffectAction = z.infer<typeof effectActionSchema>;
export type BeatAction = z.infer<typeof beatActionSchema>;
export type EntityKind = z.infer<typeof entityKindSchema>;
export type Point = z.infer<typeof pointSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type Beat = z.infer<typeof beatSchema>;
export type Environment = z.infer<typeof environmentSchema>;
export type SceneAction = z.infer<typeof sceneActionSchema>;
export type SceneExpression = z.infer<typeof sceneExpressionSchema>;
export type EngineScene = z.infer<typeof sceneSchema>;
export type Story = z.infer<typeof storySchema>;

export const KNOWN_ACTIONS = new Set<string>(beatActionSchema.options);

export const CHARACTER_ACTIONS = new Set<string>(characterActionSchema.options);
export const OBJECT_ACTIONS = new Set<string>(objectActionSchema.options);
export const EFFECT_ACTIONS = new Set<string>(effectActionSchema.options);

export const DEFAULT_SCENE_MS = 3800;
