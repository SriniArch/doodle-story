# DoodleDiary implementation plan

## Experience
- Replace the blank home screen with a polished journal workspace using a paper-and-ink doodle aesthetic.
- Add a roomy journal entry area, four mood choices, sample prompts, and a clear story-generation action.
- Show a generated 4–6 scene animated story with captions, scene progress, and Play, Pause, Replay, and Create Another Story controls.
- Make the full flow responsive and accessible across phone and desktop layouts.

## Story generator
- Build a deterministic browser-only generator that extracts useful cues from the journal text and maps them to 4–6 scenes.
- Return a modular JSON storyboard containing scene setting, characters, action, props, caption, duration, and mood.
- Include recognizable props such as clocks, beds, coffee, laptops, and cars, selected from journal keywords and narrative beats.

## Animation and illustration
- Render each scene as original inline SVG with hand-drawn lines, animated stick figures, facial expressions, props, and environmental details.
- Use mood-aware color accents and restrained CSS motion, with reduced-motion support.
- Animate scene transitions and maintain stable framing so playback never shifts the page layout.

## Technical details
- Keep all generation and playback local in React with no API, login, or database.
- Split generator, storyboard types/data, and scene rendering into focused modules.
- Add route-specific page metadata and verify the finished experience in the live preview on desktop and mobile.
