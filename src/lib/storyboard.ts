export type Mood = "Funny" | "Emotional" | "Motivational" | "Calm";
export type PropName = "clock" | "bed" | "coffee" | "laptop" | "car" | "sun" | "plant" | "star";

export type StoryScene = {
  id: number;
  setting: "bedroom" | "desk" | "street" | "cafe" | "open";
  action: "wake" | "work" | "walk" | "sip" | "celebrate" | "reflect";
  expression: "smile" | "sleepy" | "surprised" | "focused" | "soft";
  props: PropName[];
  caption: string;
  duration: number;
};

export type Storyboard = {
  title: string;
  mood: Mood;
  createdAt: string;
  scenes: StoryScene[];
};

const moodEndings: Record<Mood, string> = {
  Funny: "Somehow, the chaos made a pretty good story.",
  Emotional: "And in that quiet moment, everything felt a little lighter.",
  Motivational: "One small step became proof that I could keep going.",
  Calm: "The day softened, and I let myself breathe.",
};

const detectProps = (text: string): PropName[] => {
  const source = text.toLowerCase();
  const matches: Array<[RegExp, PropName]> = [
    [/morning|late|time|alarm/, "clock"], [/sleep|bed|woke|tired/, "bed"],
    [/coffee|tea|cafe/, "coffee"], [/work|email|code|meeting|laptop/, "laptop"],
    [/drive|car|traffic|road/, "car"], [/sun|outside|bright/, "sun"],
  ];
  const found = matches.filter(([pattern]) => pattern.test(source)).map(([, prop]) => prop);
  return found.length ? found : ["coffee", "sun"];
};

const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

export function generateStoryboard(entry: string, mood: Mood): Storyboard {
  const clean = tidy(entry);
  const sentences = clean.split(/[.!?]+/).map(tidy).filter(Boolean);
  const props = detectProps(clean);
  const count = Math.min(6, Math.max(4, sentences.length + 2));
  const fragments = sentences.length ? sentences : ["Today had a story hiding in it"];
  const settings = ["bedroom", "desk", "street", "cafe", "open", "open"] as const;
  const actions = ["wake", "work", "walk", "sip", "reflect", "celebrate"] as const;
  const expressions = ["sleepy", "focused", "surprised", "soft", "smile", "smile"] as const;

  const scenes: StoryScene[] = Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1;
    const fragment = fragments[Math.min(index, fragments.length - 1)] ?? "Today had a story hiding in it";
    const caption = isLast
      ? moodEndings[mood]
      : index === 0
        ? `It started like this: ${fragment}.`
        : `${fragment}${/[.!?]$/.test(fragment) ? "" : "."}`;
    const firstProp = props[index % props.length] ?? "sun";
    const secondProp = index === 2 ? "plant" : (props[(index + 1) % props.length] ?? "coffee");
    const sceneProps: PropName[] = isLast ? ["star"] : [firstProp, secondProp];
    return {
      id: index + 1,
      setting: settings[index] ?? "open",
      action: isLast ? (mood === "Motivational" || mood === "Funny" ? "celebrate" : "reflect") : (actions[index] ?? "reflect"),
      expression: isLast ? "smile" : (expressions[index] ?? "soft"),
      props: [...new Set(sceneProps)],
      caption,
      duration: 3800,
    };
  });

  const firstWords = clean.split(" ").slice(0, 5).join(" ");
  return {
    title: firstWords ? `${firstWords}${clean.split(" ").length > 5 ? "…" : ""}` : "A little day worth remembering",
    mood,
    createdAt: new Date().toISOString(),
    scenes,
  };
}