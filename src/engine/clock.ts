import { useCallback, useEffect, useRef, useState } from "react";

type ClockOptions = {
  sceneCount: number;
  durations: number[];
  resetKey?: string | number;
};

export const usePlaybackClock = ({ sceneCount, durations, resetKey }: ClockOptions) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [replayEpoch, setReplayEpoch] = useState(0);
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const sceneIndexRef = useRef(0);
  const sceneCountRef = useRef(sceneCount);
  const durationsRef = useRef(durations);

  sceneIndexRef.current = sceneIndex;
  sceneCountRef.current = sceneCount;
  durationsRef.current = durations;

  useEffect(() => {
    tRef.current = 0;
    setT(0);
    setSceneIndex(0);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const index = sceneIndexRef.current;
      const duration = Math.max(16, durationsRef.current[index] ?? 3800);
      const nextT = tRef.current + dt;
      if (nextT >= duration) {
        if (index < sceneCountRef.current - 1) {
          tRef.current = 0;
          setT(0);
          setSceneIndex(index + 1);
        } else {
          tRef.current = duration;
          setT(duration);
          setPlaying(false);
          return;
        }
      } else {
        tRef.current = nextT;
        setT(nextT);
      }
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, replayEpoch]);

  const goToScene = useCallback((index: number, nextPlaying?: boolean) => {
    const next = Math.max(0, Math.min(sceneCountRef.current - 1, index));
    tRef.current = 0;
    setT(0);
    setSceneIndex(next);
    if (nextPlaying !== undefined) setPlaying(nextPlaying);
  }, []);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((value) => !value), []);

  const replay = useCallback(() => {
    tRef.current = 0;
    setT(0);
    setSceneIndex(0);
    setReplayEpoch((value) => value + 1);
    setPlaying(true);
  }, []);

  return {
    sceneIndex,
    t,
    playing,
    replayEpoch,
    setPlaying,
    play,
    pause,
    toggle,
    replay,
    goToScene,
  };
};
