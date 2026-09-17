import { z } from "zod";

export const moodSchema = z.enum(["Funny", "Emotional", "Motivational", "Calm"]);
export const environmentSchema = z.object({
  kind: z.string().min(1),
  variant: z.string().optional(),
});

export const actorSchema = z.object({
  id: z.string().min(1),
  asset: z.string().min(1),
  x: z.number(),
  y: z.number(),
  facing: z.enum(["left", "right"]).default("right"),
});

export const objectSchema = z.object({
  id: z.string().min(1),
  asset: z.string().min(1),
  x: z.number(),
  y: z.number(),
});

export const eventSchema = z.object({
  id: z.string().min(1),
  actor: z.string().min(1),
  type: z.enum([
    "enter",
    "move",
    "stop",
    "pose",
    "interact",
    "react",
    "settle",
    "exit",
    "effect",
  ]),
  at: z.number().nonnegative(),
  duration: z.number().nonnegative().default(0),
  target: z.union([z.string(), z.object({ x: z.number(), y: z.number() })]).optional(),
  action: z.string().optional(),
  emotion: z.string().optional(),
  effect: z.string().optional(),
  params: z.record(z.unknown()).optional(),
});

export const sceneSchema = z.object({
  id: z.string().min(1),
  caption: z.string().default(""),
  durationMs: z.number().positive(),
  environment: environmentSchema,
  actors: z.array(actorSchema).min(1),
  objects: z.array(objectSchema).default([]),
  events: z.array(eventSchema),
});

export const storySchema = z.object({
  version: z.literal(2),
  title: z.string().min(1),
  mood: moodSchema,
  scenes: z.array(sceneSchema).min(1),
});

export type V2Story = z.infer<typeof storySchema>;
export type V2Scene = z.infer<typeof sceneSchema>;
export type V2Actor = z.infer<typeof actorSchema>;
export type V2Object = z.infer<typeof objectSchema>;
export type V2Event = z.infer<typeof eventSchema>;

export const SUPPORTED_EVENT_TYPES = new Set(eventSchema.shape.type.options);
