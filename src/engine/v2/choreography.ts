import type { V2Event, V2Scene } from "./schema";

export type ScheduledTrack = {
  id: string;
  actor: string;
  type: V2Event["type"];
  start: number;
  end: number;
  target?: V2Event["target"];
  action?: string;
  emotion?: string;
  effect?: string;
  params?: Record<string, unknown>;
};

const priority: Record<V2Event["type"], number> = {
  enter: 10,
  move: 20,
  stop: 30,
  pose: 40,
  interact: 50,
  react: 60,
  settle: 70,
  effect: 80,
  exit: 90,
};

/** Converts semantic scene events into deterministic, sorted runtime tracks. */
export const compileChoreography = (scene: V2Scene): ScheduledTrack[] =>
  [...scene.events]
    .map((event) => ({
      id: event.id,
      actor: event.actor,
      type: event.type,
      start: event.at,
      end: Math.min(scene.durationMs, event.at + event.duration),
      ...(event.target === undefined ? {} : { target: event.target }),
      ...(event.action === undefined ? {} : { action: event.action }),
      ...(event.emotion === undefined ? {} : { emotion: event.emotion }),
      ...(event.effect === undefined ? {} : { effect: event.effect }),
      ...(event.params === undefined ? {} : { params: event.params }),
    }))
    .sort((a, b) => a.start - b.start || priority[a.type] - priority[b.type] || a.id.localeCompare(b.id));

export const activeTracksAt = (tracks: ScheduledTrack[], timeMs: number) =>
  tracks.filter((track) => timeMs >= track.start && timeMs <= track.end);
