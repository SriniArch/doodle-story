import type { V2Story } from "./schema";

const baseScene = (
  id: string,
  caption: string,
  environment: string,
  events: V2Story["scenes"][number]["events"],
): V2Story["scenes"][number] => ({
  id,
  caption,
  durationMs: 5000,
  environment: { kind: environment },
  actors: [{ id: "person", asset: "person", x: 250, y: 165, facing: "right" }],
  objects: [],
  events,
});

export const V2_ACCEPTANCE_FIXTURES: V2Story[] = [
  {
    version: 2,
    title: "Chaotic morning",
    mood: "Funny",
    scenes: [baseScene("morning", "Everything happened at once.", "bedroom", [
      { id: "enter", actor: "person", type: "enter", at: 0, duration: 900, target: { x: 150, y: 165 } },
      { id: "move", actor: "person", type: "move", at: 900, duration: 1100, target: { x: 300, y: 165 } },
      { id: "react", actor: "person", type: "react", at: 2300, duration: 700, emotion: "surprised" },
      { id: "exit", actor: "person", type: "exit", at: 3600, duration: 1000 },
    ])],
  },
  {
    version: 2,
    title: "Nature walk",
    mood: "Calm",
    scenes: [baseScene("nature", "A small detail changed the day.", "park", [
      { id: "move", actor: "person", type: "move", at: 0, duration: 1800, target: { x: 330, y: 165 } },
      { id: "stop", actor: "person", type: "stop", at: 1800, duration: 400 },
      { id: "look", actor: "person", type: "pose", at: 2200, duration: 900, action: "look" },
      { id: "settle", actor: "person", type: "settle", at: 3300, duration: 900 },
    ])],
  },
  {
    version: 2,
    title: "Finished project",
    mood: "Motivational",
    scenes: [baseScene("project", "Done is better than perfect.", "office", [
      { id: "work", actor: "person", type: "pose", at: 0, duration: 1800, action: "work" },
      { id: "celebrate", actor: "person", type: "react", at: 2200, duration: 900, emotion: "happy" },
      { id: "effect", actor: "person", type: "effect", at: 2600, duration: 500, effect: "spark" },
    ])],
  },
  {
    version: 2,
    title: "Traffic jam",
    mood: "Funny",
    scenes: [baseScene("traffic", "The road barely moved.", "road", [
      { id: "wait", actor: "person", type: "pose", at: 0, duration: 2200, action: "sit" },
      { id: "react", actor: "person", type: "react", at: 2500, duration: 900, emotion: "worried" },
      { id: "settle", actor: "person", type: "settle", at: 3900, duration: 700 },
    ])],
  },
  {
    version: 2,
    title: "Peaceful evening",
    mood: "Calm",
    scenes: [baseScene("evening", "Nothing much happened, and that was enough.", "home", [
      { id: "settle", actor: "person", type: "settle", at: 0, duration: 2200 },
      { id: "reflect", actor: "person", type: "pose", at: 2400, duration: 1200, action: "reflect" },
    ])],
  },
];
