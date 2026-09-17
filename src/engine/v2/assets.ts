import type { RuntimeActor, RuntimeObject } from "./runtime";

/**
 * Rendering contracts for the V2 engine.
 * Assets describe how an entity should be drawn; they do not own timeline state.
 */
export type ActorAssetContext = {
  actor: RuntimeActor;
  timeMs: number;
};

export type ObjectAssetContext = {
  object: RuntimeObject;
  timeMs: number;
};

export type AssetRegistry = {
  actors: Record<string, string>;
  objects: Record<string, string>;
};

export const DEFAULT_ASSET_REGISTRY: AssetRegistry = {
  actors: {
    person: "person",
    child: "person",
    adult: "person",
  },
  objects: {
    clock: "clock",
    bed: "bed",
    coffee: "coffee",
    laptop: "laptop",
    car: "car",
    sun: "sun",
    plant: "plant",
    star: "star",
  },
};

export const resolveActorAsset = (asset: string, registry = DEFAULT_ASSET_REGISTRY) =>
  registry.actors[asset] ?? asset;

export const resolveObjectAsset = (asset: string, registry = DEFAULT_ASSET_REGISTRY) =>
  registry.objects[asset] ?? asset;
