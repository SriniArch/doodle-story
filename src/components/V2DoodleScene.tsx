import { useMemo } from "react";

import type { EngineScene } from "@/engine/schema";
import { sampleV2Frame } from "@/engine/v2/runtime";
import { toV2Scene } from "@/engine/v2/adapter";
import { V2SvgScene } from "@/engine/v2/svg";

export function V2DoodleScene({ scene, t }: { scene: EngineScene; t: number }) {
  const v2Scene = useMemo(() => toV2Scene(scene), [scene]);
  const frame = useMemo(() => sampleV2Frame(v2Scene, t), [v2Scene, t]);
  return <V2SvgScene frame={frame} />;
}
