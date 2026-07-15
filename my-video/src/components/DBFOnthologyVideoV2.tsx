/**
 * DBF Onthology — Speed-Ramp Cut  (v6)
 * ~2:00 · 1920×1080 · 30fps · 3605 frames
 *
 * Structure:
 *   0   –  265   Intro clip     "Prompts to Urban analysis.mp4" at 3×
 *                               tagline at TOP: "Urban intelligence to cities…"
 *  265  –  385   Hook           "Where should we build a new hospital?"
 *                               single question, centered, plain fade
 *  385  – 3455   Demo           "Onthology demo.mp4" — 3 prompt-focus pairs
 * 3455  – 3605   Outro          "Where cities decide."
 *
 * Demo speed legend:
 *   Prompt focus (zoom) = 1×  + camera zooms to prompt bar (frozen while moving)
 *   Very slow           = 0.5× (result moment, ~1-3 s source)
 *   Fast                = 6×  (navigation / loading / skipped content)
 *
 * Three prompt+result pairs kept:
 *   Pair 1 — 0:00–0:18 (prompt)  + 0:31–0:32 (result, very slow)
 *   Pair 2 — 1:45–2:02 (prompt)  + 2:04–2:07 (result, very slow)
 *   Pair 3 — 3:30–3:45 (prompt)  + 3:50–4:05 (result, slow)
 *
 * Prompt-focus zoom:
 *   scale(2.4) translate(-30%, -42%)   — maps the bottom-right chat panel
 *   prompt bar to the centre of the comp. Camera moves on a FROZEN frame.
 */
import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono  } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: inter } = loadInter();
const { fontFamily: mono  } = loadMono();

// ─── Sources ──────────────────────────────────────────────────────────────────
const PROMPT_CLIP = staticFile("references/Sydney/Onthology series/Prompts to Urban analysis.mp4");
const DEMO        = staticFile("references/Sydney/Onthology series/Onthology demo.mp4");

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:     "#06080F",
  black:  "#020408",
  white:  "#F0F4FF",
  orange: "#F5A623",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const fi    = (f: number, s: number, d: number)   => clamp((f - s) / d, 0, 1);
const easeO = (t: number) => 1 - Math.pow(1 - t, 3);

// ─── SceneFade ────────────────────────────────────────────────────────────────
const SceneFade: React.FC<{ i?: number; o?: number }> = ({ i = 18, o = 18 }) => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  const op = Math.min(clamp(f / i, 0, 1), clamp((dur - f) / o, 0, 1));
  return <AbsoluteFill style={{ background: "#000", opacity: 1 - op, pointerEvents: "none" }} />;
};

// ─── INTRO: PROMPT HIGHLIGHT + TAGLINE ────────────────────────────────────────
// "Prompts to Urban analysis.mp4" at 3×. Tagline fades in at the TOP so it
// reads over the map without blocking the product UI at the bottom.
const PromptHighlightScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <OffthreadVideo
        src={PROMPT_CLIP}
        muted
        playbackRate={3}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Dark band at top so text reads cleanly */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(2,4,8,0.90) 0%, rgba(2,4,8,0.15) 38%, transparent 55%)",
          pointerEvents: "none",
        }}
      />
      {/* Brand label */}
      <div
        style={{
          position: "absolute", top: 52, width: "100%", textAlign: "center",
          fontFamily: mono, fontSize: 11, letterSpacing: "0.34em",
          textTransform: "uppercase", color: C.orange,
          opacity: fi(f, 10, 18),
        }}
      >
        Digital Blue Foam · Onthology
      </div>
      {/* Tagline — upper section, left-aligned under brand label */}
      <div
        style={{
          position: "absolute", top: 116, left: 80, right: 80,
          opacity: fi(f, 28, 26),
        }}
      >
        <div
          style={{
            fontFamily: inter, fontSize: 56, fontWeight: 900,
            color: C.white, letterSpacing: "-1.5px", lineHeight: 1.18,
          }}
        >
          Urban intelligence to cities
        </div>
        <div
          style={{
            fontFamily: inter, fontSize: 56, fontWeight: 900,
            color: C.orange, letterSpacing: "-1.5px", lineHeight: 1.18,
          }}
        >
          at a single prompt.
        </div>
      </div>
      <SceneFade i={20} o={20} />
    </AbsoluteFill>
  );
};

// ─── HOOK: SINGLE QUESTION ────────────────────────────────────────────────────
// Big centered question representing the user's prompt to Onthology.
// Plain fade — no typing animation (per design direction).
const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const op = fi(f, 0, 26);
  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Warm glow so the dark bg isn't flat */}
      <div
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 1100, height: 500, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.orange}0D 0%, transparent 68%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ opacity: op, textAlign: "center", padding: "0 160px" }}>
        <div
          style={{
            fontFamily: mono, fontSize: 11, letterSpacing: "0.32em",
            textTransform: "uppercase", color: C.orange, marginBottom: 28,
          }}
        >
          User query
        </div>
        <div
          style={{
            fontFamily: inter, fontSize: 88, fontWeight: 900,
            color: C.white, letterSpacing: "-2.5px", lineHeight: 1.10,
          }}
        >
          Where should we build
          <br />
          a new hospital?
        </div>
        {/* Orange accent line that grows in */}
        <div
          style={{
            width: `${fi(f, 30, 26) * 320}px`, height: 2,
            margin: "32px auto 0",
            background: `linear-gradient(to right, transparent, ${C.orange}, transparent)`,
            opacity: fi(f, 30, 26),
          }}
        />
      </div>
      <SceneFade i={20} o={20} />
    </AbsoluteFill>
  );
};

// ─── DEMO SEGMENTS ────────────────────────────────────────────────────────────
// Three prompt+result pairs, everything else at 6× fast.
//
// "Prompt focus" zoom:
//   scale(s) translate(-30%, -42%) — centred on the chat panel prompt input
//   (approx. source position 80% x, 93% y → mapped to screen centre).
//   Camera movement happens while video is FROZEN so the push-in feels
//   like a deliberate camera move, not video content blurring by.
interface Seg {
  srcStart: number;  // seconds into "Onthology demo.mp4"
  srcEnd:   number;
  speed:    number;  // playback rate
  zoom?:    number;  // CSS scale  (> 1 = zoom to prompt bar)
}

const SEGMENTS: Seg[] = [
  // ── Pair 1: 0:00–0:32 ────────────────────────────────────────────────────
  { srcStart:  0, srcEnd:  18, speed: 1,   zoom: 2.4 }, // 0:00–0:18  prompt focus
  { srcStart: 18, srcEnd:  31, speed: 6             }, // 0:18–0:31  fast
  { srcStart: 31, srcEnd:  32, speed: 0.5           }, // 0:31–0:32  result  (very slow)
  // ── Bridge: fast to Pair 2 ───────────────────────────────────────────────
  { srcStart:  32, srcEnd: 105, speed: 6            }, // 0:32–1:45  fast
  // ── Pair 2: 1:45–2:07 ────────────────────────────────────────────────────
  { srcStart: 105, srcEnd: 122, speed: 1, zoom: 2.4 }, // 1:45–2:02  prompt focus
  { srcStart: 122, srcEnd: 124, speed: 6            }, // 2:02–2:04  fast
  { srcStart: 124, srcEnd: 127, speed: 0.5          }, // 2:04–2:07  result  (very slow)
  // ── Bridge: fast to Pair 3 ───────────────────────────────────────────────
  { srcStart: 127, srcEnd: 210, speed: 6            }, // 2:07–3:30  fast
  // ── Pair 3: 3:30–4:05 ────────────────────────────────────────────────────
  { srcStart: 210, srcEnd: 225, speed: 1, zoom: 2.4 }, // 3:30–3:45  prompt focus
  { srcStart: 225, srcEnd: 230, speed: 6            }, // 3:45–3:50  fast
  { srcStart: 230, srcEnd: 245, speed: 1            }, // 3:50–4:05  result  (slow)
];
//
// Comp durations (Math.round((srcEnd - srcStart) * 30 / speed)):
//   540 + 65 + 60 + 365 + 510 + 10 + 180 + 415 + 450 + 25 + 450  = 3070 f  (102.3 s)

const SEG_COMP_DURS: number[] = SEGMENTS.map(
  (s) => Math.round((s.srcEnd - s.srcStart) * 30 / s.speed)
);
const SEG_COMP_OFFSETS: number[] = SEG_COMP_DURS.reduce<number[]>((acc, d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SEG_COMP_DURS[i - 1]);
  return acc;
}, []);
const DEMO_COMP_TOTAL = SEG_COMP_DURS.reduce((a, b) => a + b, 0);

// ─── DEMO SEGMENT ─────────────────────────────────────────────────────────────
// Plays one source slice at `speed`. If zoom > 1, the camera pushes in toward
// the Onthology prompt bar (left side of screen, ~middle height).
//
// Zoom geometry (prompt bar at source ≈ 20% x, 57% y):
//   At full zoom (scale 2.5), the div is 250%×250% of the comp, left=0%.
//   This maps source (20%, 57%) exactly to screen center (50%, 50%).
//   top slides from 0% → -92.5%  (= 50% - 57% × 2.5)
//   Visible source area: x 0–40%, y 37–77% — the full prompt bar rectangle.
//
// The zoom animates while the video plays (no Freeze) — the 15-frame
// push-in is too fast to notice the video progressing underneath.
const TRANS    = 18;   // frames for zoom ease-in / ease-out
const ZOOM_MAX = 2.5;
const TOP_FULL = -92.5; // % — top offset at full zoom (= 50 - 57×2.5)

const DemoSegment: React.FC<{
  srcStart: number;
  speed:    number;
  zoom:     number;
}> = ({ srcStart, speed, zoom }) => {
  const f   = useCurrentFrame();
  const dur = useVideoConfig().durationInFrames;
  const hasZoom = zoom > 1;

  // Smooth 0→1 ease-in, hold 1, then 1→0 ease-out
  const zoomP = hasZoom ? easeO(Math.min(f / TRANS, (dur - f) / TRANS, 1)) : 0;

  // Scale the container div; left stays at 0% so the left-side prompt is
  // always in frame. Only `top` and size change.
  const s      = 1 + (ZOOM_MAX - 1) * zoomP;   // 1 → 2.5
  const topPct = TOP_FULL * zoomP;              // 0% → -92.5%

  // startFrom = srcStart × fps ÷ playbackRate
  // → at local frame 0, OffthreadVideo shows source frame srcStart × fps
  const startFrom = Math.round(srcStart * 30 / speed);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width:  `${100 * s}%`,
          height: `${100 * s}%`,
          left:   "0%",
          top:    `${topPct}%`,
        }}
      >
        <OffthreadVideo
          src={DEMO}
          muted
          startFrom={startFrom}
          playbackRate={speed}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── OUTRO ────────────────────────────────────────────────────────────────────
const OutroScene: React.FC = () => {
  const f  = useCurrentFrame();
  const sl = (start: number, d: number, dist = 18) =>
    dist * (1 - clamp((f - start) / d, 0, 1));

  return (
    <AbsoluteFill
      style={{
        background: C.black,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 1000, height: 500, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.orange}12 0%, transparent 68%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontFamily: mono, fontSize: 12, letterSpacing: "0.34em",
          textTransform: "uppercase", color: C.orange, marginBottom: 22,
          opacity: fi(f, 16, 20), transform: `translateY(${sl(16, 20)}px)`,
        }}
      >
        Digital Blue Foam
      </div>
      <div
        style={{
          fontFamily: inter, fontSize: 108, fontWeight: 900,
          color: C.white, letterSpacing: "-4px", lineHeight: 1,
          opacity: fi(f, 26, 24), transform: `translateY(${sl(26, 24, 20)}px)`,
        }}
      >
        Onthology
      </div>
      <div
        style={{
          width: `${fi(f, 52, 22) * 340}px`, height: 1,
          background: `linear-gradient(to right, transparent, ${C.orange}, transparent)`,
          margin: "28px 0", opacity: fi(f, 52, 22),
        }}
      />
      <div
        style={{
          fontFamily: inter, fontSize: 22, fontWeight: 300,
          color: "rgba(240,244,255,0.48)", letterSpacing: "0.06em",
          opacity: fi(f, 62, 22), transform: `translateY(${sl(62, 22)}px)`,
        }}
      >
        Where cities decide.
      </div>
      <SceneFade i={22} o={28} />
    </AbsoluteFill>
  );
};

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
// PROMPT_CLIP is 26.499966 s; at 3× that's 264.99 source frames.
// Using 258 comp frames leaves a 7-frame buffer before source end (avoids replay).
const PROMPT_DUR  = 258;                           //  8.6 s
const HOOK_DUR    = 120;                           //  4.0 s
const DEMO_START  = PROMPT_DUR + HOOK_DUR;         // 385
const OUTRO_START = DEMO_START + DEMO_COMP_TOTAL;  // 385 + 3070 = 3455
const OUTRO_DUR   = 150;                           //  5.0 s
// TOTAL = 3455 + 150 = 3605 frames = 120.2 s ≈ 2:00

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export const DBFOnthologyVideoV2: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>

    {/* ── Intro: fast teaser + tagline (top) ── */}
    <Sequence durationInFrames={PROMPT_DUR}>
      <PromptHighlightScene />
    </Sequence>

    {/* ── Hook: the question ── */}
    <Sequence from={PROMPT_DUR} durationInFrames={HOOK_DUR}>
      <HookScene />
    </Sequence>

    {/* ── Demo: 3 prompt-focus pairs, fast otherwise ── */}
    <Sequence from={DEMO_START} durationInFrames={DEMO_COMP_TOTAL}>
      <AbsoluteFill>
        {SEGMENTS.map((seg, i) => (
          <Sequence
            key={i}
            from={SEG_COMP_OFFSETS[i]}
            durationInFrames={SEG_COMP_DURS[i]}
          >
            <DemoSegment
              srcStart={seg.srcStart}
              speed={seg.speed}
              zoom={seg.zoom ?? 1}
            />
          </Sequence>
        ))}
        <SceneFade i={12} o={12} />
      </AbsoluteFill>
    </Sequence>

    {/* ── Outro ── */}
    <Sequence from={OUTRO_START} durationInFrames={OUTRO_DUR}>
      <OutroScene />
    </Sequence>

  </AbsoluteFill>
);
