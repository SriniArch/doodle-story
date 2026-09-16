import type { Entity, EntityKind, SceneAction, Setting } from "./schema";

export const STAGE = {
  width: 500,
  height: 300,
  groundY: 165,
  propY: 192,
  centerX: 250,
  enterX: 40,
  exitX: 460,
} as const;

const KIND_DEFAULTS: Record<Exclude<EntityKind, "person" | "generic">, { x: number; y: number }> = {
  clock: { x: 105, y: 192 },
  bed: { x: 400, y: 192 },
  coffee: { x: 168, y: 192 },
  laptop: { x: 400, y: 188 },
  car: { x: 400, y: 200 },
  sun: { x: 400, y: 72 },
  plant: { x: 400, y: 177 },
  star: { x: 400, y: 80 },
};

export const approachPoint = (object: Entity): { x: number; y: number } => {
  const inset = object.kind === "laptop" ? 90 : object.kind === "bed" ? 70 : 42;
  return { x: object.x - inset, y: STAGE.groundY };
};

export const placeObjects = (
  setting: Setting,
  props: EntityKind[],
  action: SceneAction,
): Entity[] => {
  const used = new Set<string>();
  return props
    .filter((kind): kind is Exclude<EntityKind, "person" | "generic"> => kind !== "person" && kind !== "generic")
    .slice(0, 4)
    .map((kind, index) => {
      let id: string = kind;
      if (used.has(id)) id = `${kind}-${index + 1}`;
      used.add(id);
      const base = { ...KIND_DEFAULTS[kind] };

      if (kind === "coffee") {
        base.x = action === "sip" ? 168 : index === 0 ? 105 : 400;
      } else if (kind === "sun" && setting === "street") {
        base.x = 105;
      } else if (kind === "plant" && index === 0) {
        base.x = 105;
      } else if (index === 0 && kind !== "laptop" && kind !== "car") {
        base.x = Math.min(base.x, 120);
      }

      return { id, kind, x: base.x, y: base.y };
    });
};
