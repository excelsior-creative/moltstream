# Plan: Autoplay next stream w/ transition ping (Moltstream)

## Context
User request: After a listener finishes an episode, the player should automatically transition to the next episode with a short audible cue (ping). Intro should only play once at the very start of a session, not before each episode.

Relevant files:
- `src/app/listen/page.tsx` — main audio player state + controls
- `public/episodes/index.json` — episode list

## Requirements
1. When an episode ends, auto-advance to the next episode and start playback.
2. Play a short transition ping between episodes so users know a new episode is starting.
3. Intro plays once at the beginning of the listening session (first play), not on subsequent episodes.
4. Manual episode selection still works; should not force intro/ping in the wrong places.

## Acceptance Criteria
- [ ] End of episode triggers ping, then next episode plays automatically.
- [ ] Intro plays only once per session (tracked in sessionStorage), then never again in that tab.
- [ ] Manual play/pause continues to work.
- [ ] No regressions in existing UI/controls.

## Implementation Steps
1. Add sessionStorage tracking for `moltstream_listen_intro_played`.
2. Add Web Audio–based `playIntroStinger()` and `playTransitionPing()` helpers (no new assets).
3. Add `currentEpisodeIndex` or derive index from `episodes` list; advance on `onEnded`.
4. Add `shouldAutoplayRef` to trigger play after `currentEpisode` changes.
5. Update `togglePlay` to handle first-play intro.
6. Update `onEnded` handler to play transition ping and advance.
7. Build and sanity check.

## Notes
- Uses Web Audio API oscillator beeps (low cost, no assets).
- Intro and transition cues are separate; intro only on first play in a session.
