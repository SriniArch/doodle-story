import { createFileRoute } from "@tanstack/react-router";
import {
  BookHeart,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Dices,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { DoodleScene } from "@/components/DoodleScene";
import { Button } from "@/components/ui/button";
import { usePlaybackClock } from "@/engine/clock";
import { PHASE1_STORIES } from "@/engine/fixtures";
import {
  generateStoryboard,
  resolveSceneAnimation,
  type Mood,
  type Storyboard,
} from "@/lib/storyboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DoodleDiary — Turn Your Day Into a Story" },
      {
        name: "description",
        content:
          "Turn journal entries into playful animated stick-figure stories, right in your browser.",
      },
      { property: "og:title", content: "DoodleDiary — Animated Journal Stories" },
      {
        property: "og:description",
        content: "Write your day and watch it become a hand-drawn animated story.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const moods: Array<{ label: Mood; icon: string; note: string }> = [
  { label: "Funny", icon: "◡", note: "Make it playful" },
  { label: "Emotional", icon: "♡", note: "Tell it gently" },
  { label: "Motivational", icon: "↗", note: "Find the spark" },
  { label: "Calm", icon: "~", note: "Keep it peaceful" },
];

const defaultPrompt: string = PHASE1_STORIES[0];
const prompts: string[] = [...PHASE1_STORIES];

function Index() {
  const [entry, setEntry] = useState<string>(defaultPrompt);
  const [mood, setMood] = useState<Mood>("Funny");
  const [story, setStory] = useState<Storyboard | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const clock = usePlaybackClock({
    sceneCount: story?.scenes.length ?? 0,
    durations: story?.scenes.map((scene) => scene.durationMs) ?? [],
    resetKey: story?.createdAt ?? "idle",
  });

  const current = story?.scenes[clock.sceneIndex];
  const progress = story ? ((clock.sceneIndex + 1) / story.scenes.length) * 100 : 0;
  const wordCount = useMemo(() => (entry.trim() ? entry.trim().split(/\s+/).length : 0), [entry]);
  const transition = current ? resolveSceneAnimation(current).entrance : "fade-in";

  const createStory = () => {
    if (!entry.trim()) return;
    setStory(generateStoryboard(entry, mood));
    window.setTimeout(
      () => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  useEffect(() => {
    if (story) clock.replay();
    else clock.pause();
    // Replay when a new story is compiled; clock methods are stable enough for this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.createdAt]);

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="logo-mark">
            <BookHeart size={22} />
          </span>
          <span className="font-display text-2xl font-bold">DoodleDiary</span>
        </div>
        <p className="hidden rotate-1 font-hand text-lg text-muted-foreground sm:block">
          Your day, drawn out.
        </p>
      </header>

      {!story ? (
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 md:grid-cols-[0.72fr_1.28fr] md:items-center md:px-8 md:pt-16">
          <div className="animate-fade-in">
            <p className="mb-4 flex items-center gap-2 font-hand text-xl text-accent-foreground">
              <Sparkles size={18} /> Tiny moments make great stories
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.02] md:text-7xl">
              Turn your day into a <span className="doodle-underline">doodle story.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
              Write what happened. Pick a feeling. Watch your journal entry come alive—stick
              figures, wobbly lines and all.
            </p>
            <div className="mt-9 hidden items-end gap-2 md:flex" aria-hidden="true">
              <span className="mini-person">
                ◯<br />
                ╱│╲
                <br />╱ ╲
              </span>
              <span className="font-hand text-lg">No perfect days required!</span>
            </div>
          </div>

          <div className="paper-sheet animate-fade-in">
            <div className="paper-holes" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <label htmlFor="journal" className="font-display text-2xl font-bold">
              What happened today?
            </label>
            <textarea
              id="journal"
              value={entry}
              maxLength={900}
              onChange={(event) => setEntry(event.target.value)}
              placeholder="It all started when…"
              className="journal-input"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <button
                className="font-bold hover:text-foreground"
                onClick={() =>
                  setEntry(
                    prompts[(prompts.indexOf(entry) + 1 + prompts.length) % prompts.length] ??
                      defaultPrompt,
                  )
                }
                type="button"
              >
                <Dices className="mr-1 inline" size={14} />
                Try an example
              </button>
              <span>{wordCount} words</span>
            </div>
            <fieldset className="mt-7">
              <legend className="mb-3 font-display text-lg font-bold">Choose the mood</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {moods.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-pressed={mood === item.label}
                    onClick={() => setMood(item.label)}
                    className={`mood-button ${mood === item.label ? "is-selected" : ""}`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <Button className="mt-7 w-full" onClick={createStory} disabled={!entry.trim()}>
              <Sparkles size={18} />
              Doodle my story
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Made in your browser. Your words stay with you.
            </p>
          </div>
        </section>
      ) : current ? (
        <section ref={stageRef} className="mx-auto max-w-6xl px-5 pb-16 pt-3 md:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-hand text-lg text-accent-foreground">
                Your {story.mood.toLowerCase()} little story
              </p>
              <h1 className="max-w-2xl font-display text-3xl font-bold md:text-4xl">
                {story.title}
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStory(null);
                clock.pause();
              }}
            >
              <RotateCcw size={16} />
              Create another story
            </Button>
          </div>

          <div className="story-stage">
            <div className="stage-top">
              <span>
                SCENE {clock.sceneIndex + 1} / {story.scenes.length}
              </span>
              <span className="mood-stamp">{story.mood}</span>
            </div>
            <div
              className={`scene-frame scene-trans scene-trans-${transition} trans-${current.setting}`}
              key={`${current.id}-${clock.replayEpoch}`}
            >
              <DoodleScene scene={current} t={clock.t} playing={clock.playing} />
            </div>
            <div className="caption-wrap">
              <p className="font-hand text-2xl leading-relaxed md:text-3xl">“{current.caption}”</p>
            </div>
            <div
              className="progress-track"
              aria-label={`Scene ${clock.sceneIndex + 1} of ${story.scenes.length}`}
            >
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="playback-row">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous scene"
                  disabled={clock.sceneIndex === 0}
                  onClick={() => clock.goToScene(clock.sceneIndex - 1, false)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="icon"
                  aria-label={clock.playing ? "Pause story" : "Play story"}
                  onClick={() => clock.toggle()}
                >
                  {clock.playing ? <CirclePause /> : <CirclePlay />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next scene"
                  disabled={clock.sceneIndex === story.scenes.length - 1}
                  onClick={() => clock.goToScene(clock.sceneIndex + 1, false)}
                >
                  <ChevronRight />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={clock.replay}>
                <RotateCcw size={15} />
                Replay
              </Button>
            </div>
          </div>

          <div className="scene-strip">
            {story.scenes.map((scene, index) => (
              <button
                type="button"
                key={scene.id}
                onClick={() => {
                  clock.goToScene(index, false);
                }}
                className={index === clock.sceneIndex ? "active" : ""}
              >
                <span>{index + 1}</span>
                <small>{scene.action}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
