/**
 * DBF Onthology — Product Demo Video v7
 * Trailer (2×, 25 s clip = 375 f) + 7 × [big-question → clip (1×) → number-morph] + outro
 * ~3:36 · 1920×1080 · 30fps
 *
 * Total = 6477 frames (OUTRO_START 6327 + OUTRO_DUR 150)
 */
import React from "react";
import {
  AbsoluteFill,
  Freeze,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: inter } = loadInter();
const { fontFamily: mono } = loadMono();

// ─── Sources ──────────────────────────────────────────────────────────────────
const TRAILER = staticFile("references/Sydney/Onthology series/Trailer.mp4");
const CLIP1   = staticFile("references/Sydney/Onthology series/Clip 1.mp4");
const CLIP2   = staticFile("references/Sydney/Onthology series/Clip 2.mp4");
const CLIP3   = staticFile("references/Sydney/Onthology series/Clip 3.mp4");
const CLIP4   = staticFile("references/Sydney/Onthology series/Clip 4.mp4");
const CLIP5   = staticFile("references/Sydney/Onthology series/Clip 5.mp4");
const CLIP6   = staticFile("references/Sydney/Onthology series/Clip 6.mp4");
const CLIP7   = staticFile("references/Sydney/Onthology series/Clip 7.mp4");

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:     "#06080F",
  black:  "#020408",
  white:  "#F0F4FF",
  orange: "#F5A623",   // brand accent — step labels, cursor, lines, glows
  gold:   "#FFD166",   // warm highlight — primary stat numbers
  muted:  "#8B909E",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp  = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const fi     = (f: number, s: number, d: number) => clamp((f - s) / d, 0, 1);
const easeO  = (t: number) => 1 - Math.pow(1 - t, 3);
const sl     = (f: number, s: number, d: number, dist = 18) =>
  dist * (1 - clamp((f - s) / d, 0, 1));

// ─── SceneFade ────────────────────────────────────────────────────────────────
const SceneFade: React.FC<{ i?: number; o?: number }> = ({ i = 18, o = 18 }) => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  const op = Math.min(clamp(f / i, 0, 1), clamp((dur - f) / o, 0, 1));
  return <AbsoluteFill style={{ background: "#000", opacity: 1 - op, pointerEvents: "none" }} />;
};

// ─── Blurred frozen video backdrop ───────────────────────────────────────────
const BlurBg: React.FC<{ src: string; dark?: number }> = ({ src, dark = 0.80 }) => (
  <>
    <AbsoluteFill style={{ opacity: 0.50, filter: "blur(36px)", transform: "scale(1.10)" }}>
      <Freeze frame={0}>
        <OffthreadVideo
          src={src}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Freeze>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: `rgba(6,8,15,${dark})` }} />
  </>
);

// ─── CLIP SCENE — video at real (1×) speed ───────────────────────────────────
const ClipScene: React.FC<{ src: string; step: string }> = ({ src, step }) => {
  const f = useCurrentFrame();
  const lo = fi(f, 6, 16);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <OffthreadVideo
        src={src}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.50) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: 48, left: 60, opacity: lo,
          fontFamily: mono, fontSize: 10, letterSpacing: "0.28em",
          textTransform: "uppercase", color: C.orange,
        }}
      >
        {step}
      </div>
      <SceneFade i={14} o={14} />
    </AbsoluteFill>
  );
};

// ─── Blinking cursor ─────────────────────────────────────────────────────────
const Cursor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <span style={{ opacity: Math.round(f / 6) % 2 === 0 ? 1 : 0, color: C.orange }}>
      _
    </span>
  );
};

// ─── QUESTION SLIDE ───────────────────────────────────────────────────────────
const QuestionSlide: React.FC<{
  bgSrc: string;
  step: string;
  question: string;
}> = ({ bgSrc, step, question }) => {
  const f = useCurrentFrame();

  const typeStart = 18;
  const typeDur   = 72;
  const progress  = clamp((f - typeStart) / typeDur, 0, 1);
  const chars     = Math.round(progress * question.length);
  const typing    = f >= typeStart && progress < 1;

  const stepOp  = fi(f, 10, 16);
  const textOp  = fi(f, typeStart - 4, 12);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <BlurBg src={bgSrc} dark={0.78} />

      <div
        style={{
          position: "absolute", top: 72, width: "100%",
          textAlign: "center",
          fontFamily: mono, fontSize: 11, letterSpacing: "0.32em",
          textTransform: "uppercase", color: C.orange,
          opacity: stepOp,
        }}
      >
        {step}
      </div>

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
        }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 96,
            fontWeight: 900,
            color: C.white,
            letterSpacing: "-2px",
            lineHeight: 1.12,
            textAlign: "center",
            maxWidth: 1680,
            whiteSpace: "pre-wrap",
            opacity: textOp,
          }}
        >
          {question.slice(0, chars)}
          {typing && <Cursor />}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${progress * 320}px`,
          height: 2,
          background: `linear-gradient(to right, transparent, ${C.orange}, transparent)`,
          opacity: progress > 0.1 ? 0.8 : 0,
        }}
      />

      <SceneFade i={14} o={14} />
    </AbsoluteFill>
  );
};

// ─── ANSWER MORPH SLIDE ───────────────────────────────────────────────────────
interface Stat { value: string; label: string }

const AnswerMorphSlide: React.FC<{
  bgSrc: string;
  stepComplete: string;
  chatSnippet: string;
  stats: Stat[];
}> = ({ bgSrc, stepComplete, chatSnippet, stats }) => {
  const f = useCurrentFrame();

  const cardOp = Math.max(0,
    Math.min(fi(f, 4, 16), 1 - fi(f, 20, 18))
  );
  const glowOp = fi(f, 18, 22);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <BlurBg src={bgSrc} dark={0.75} />

      <AbsoluteFill style={{ pointerEvents: "none", opacity: glowOp }}>
        <div
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 900, height: 450,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${C.orange}1A 0%, transparent 68%)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: cardOp,
        }}
      >
        <div
          style={{
            width: 780,
            background: "rgba(10,14,26,0.96)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderLeft: `3px solid ${C.orange}`,
            borderRadius: "4px 12px 12px 4px",
            padding: "18px 24px",
          }}
        >
          <div
            style={{
              fontFamily: mono, fontSize: 10,
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: C.orange, marginBottom: 10,
            }}
          >
            {stepComplete}
          </div>
          <div
            style={{
              fontFamily: inter, fontSize: 15,
              color: "rgba(240,244,255,0.82)", lineHeight: 1.65,
            }}
          >
            {chatSnippet}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: mono, fontSize: 11,
            letterSpacing: "0.30em", textTransform: "uppercase",
            color: C.orange, marginBottom: 48,
            opacity: fi(f, 16, 18),
            transform: `translateY(${sl(f, 16, 18)}px)`,
          }}
        >
          {stepComplete}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 80,
          }}
        >
          {stats.map((stat, i) => {
            const morphStart = 18 + i * 16;
            const morphP     = easeO(clamp((f - morphStart) / 40, 0, 1));
            const scale      = 0.08 + morphP * 0.92;
            const statOp     = clamp((f - morphStart) / 18, 0, 1);
            const labelOp    = fi(f, morphStart + 32, 16);
            const fontSize   = i === 0 ? 164 : 108;

            return (
              <div key={i} style={{ textAlign: "center", opacity: statOp }}>
                <div
                  style={{
                    fontFamily: inter,
                    fontSize,
                    fontWeight: 900,
                    color: i === 0 ? C.gold : C.white,
                    letterSpacing: i === 0 ? "-4px" : "-2px",
                    lineHeight: 1,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    display: "block",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginTop: 16,
                    opacity: labelOp,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <SceneFade i={14} o={14} />
    </AbsoluteFill>
  );
};

// ─── TRAILER ──────────────────────────────────────────────────────────────────
const TrailerScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <OffthreadVideo
        src={TRAILER}
        muted
        playbackRate={2}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(2,4,8,0.92) 0%, rgba(2,4,8,0.30) 45%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end",
          paddingBottom: 96,
        }}
      >
        <div
          style={{
            fontFamily: mono, fontSize: 12, letterSpacing: "0.34em",
            textTransform: "uppercase", color: C.orange,
            marginBottom: 18,
            opacity: fi(f, 12, 20),
            transform: `translateY(${sl(f, 12, 20)}px)`,
          }}
        >
          Digital Blue Foam
        </div>

        <div
          style={{
            fontFamily: inter, fontSize: 100, fontWeight: 900,
            color: C.white, letterSpacing: "-3px", lineHeight: 1,
            opacity: fi(f, 22, 24),
            transform: `translateY(${sl(f, 22, 24, 22)}px)`,
          }}
        >
          Onthology
        </div>

        <div
          style={{
            fontFamily: inter, fontSize: 28, fontWeight: 600,
            color: "rgba(240,244,255,0.82)", letterSpacing: "-0.3px",
            marginTop: 22,
            opacity: fi(f, 48, 22),
            transform: `translateY(${sl(f, 48, 22)}px)`,
          }}
        >
          Where cities decide
        </div>

        <div
          style={{
            fontFamily: inter, fontSize: 18, fontWeight: 300,
            color: "rgba(240,244,255,0.52)", letterSpacing: "0.02em",
            marginTop: 10, textAlign: "center", maxWidth: 900,
            opacity: fi(f, 68, 22),
            transform: `translateY(${sl(f, 68, 22)}px)`,
          }}
        >
          Every urban decision will run through a reasoning system. We're building it.
        </div>
      </AbsoluteFill>

      <SceneFade i={20} o={20} />
    </AbsoluteFill>
  );
};

// ─── OUTRO ────────────────────────────────────────────────────────────────────
const OutroScene: React.FC = () => {
  const f = useCurrentFrame();
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
          textTransform: "uppercase", color: C.orange,
          marginBottom: 22,
          opacity: fi(f, 16, 20),
          transform: `translateY(${sl(f, 16, 20)}px)`,
        }}
      >
        Digital Blue Foam
      </div>
      <div
        style={{
          fontFamily: inter, fontSize: 108, fontWeight: 900,
          color: C.white, letterSpacing: "-4px", lineHeight: 1,
          opacity: fi(f, 26, 24),
          transform: `translateY(${sl(f, 26, 24, 20)}px)`,
        }}
      >
        Onthology
      </div>
      <div
        style={{
          width: fi(f, 52, 22) * 340,
          height: 1,
          background: `linear-gradient(to right, transparent, ${C.orange}, transparent)`,
          margin: "28px 0",
          opacity: fi(f, 52, 22),
        }}
      />
      <div
        style={{
          fontFamily: inter, fontSize: 22, fontWeight: 300,
          color: "rgba(240,244,255,0.48)", letterSpacing: "0.06em",
          opacity: fi(f, 62, 22),
          transform: `translateY(${sl(f, 62, 22)}px)`,
        }}
      >
        Where cities decide.
      </div>
      <SceneFade i={22} o={28} />
    </AbsoluteFill>
  );
};

// ─── CONTENT DATA ─────────────────────────────────────────────────────────────
// clipDur = source_seconds × 30 (1× playback = real time)
// e.g. Clip 1 is ~20 s source → 600 frames. Previously these were ÷3 for 3× speed.
interface ClipEntry {
  src: string;
  clipDur: number;
  step: string;
  question: string;
  stepComplete: string;
  chatSnippet: string;
  stats: Stat[];
}

const ENTRIES: ClipEntry[] = [
  {
    src: CLIP1, clipDur: 600,   // 20 s source
    step: "01 / GAP ANALYSIS",
    question: "Which suburbs lack\nhealthcare access?",
    stepComplete: "GAP ANALYSIS · STEP COMPLETE",
    chatSnippet: "118 of 373 districts flagged deficient for Healthcare (score < 0.6). 2,249,367 people — 43% of city population 5,231,104 — live in deficient zones.",
    stats: [
      { value: "43%",   label: "of city population in deficient zones" },
      { value: "2.2M",  label: "people affected" },
      { value: "118",   label: "districts flagged" },
    ],
  },
  {
    src: CLIP2, clipDur: 600,   // 20 s source
    step: "02 / ISOCHRONE COVERAGE",
    question: "Map 15-min walking\naccess to every parcel",
    stepComplete: "ISOCHRONE COVERAGE · STEP COMPLETE",
    chatSnippet: "Checked 55,727 real land parcels against 12 illustrative hospital locations using a 15-minute walking isochrone. 36,663 parcels covered; 19,064 parcels fall outside any facility.",
    stats: [
      { value: "55,727", label: "land parcels checked" },
      { value: "19,064", label: "parcels outside 15-min walk" },
    ],
  },
  {
    src: CLIP3, clipDur: 600,   // 20 s source
    step: "03 / SITE SCREENING",
    question: "Screen candidate\nsites",
    stepComplete: "SITE SCREENING · STEP COMPLETE",
    chatSnippet: "Screened 5 candidate sites for hospital siting in camperdown_darlington using real cadastral land parcels. 2 eligible, 3 disqualified: Site B, C, E (zoning).",
    stats: [
      { value: "2",   label: "eligible sites" },
      { value: "3",   label: "disqualified (zoning)" },
    ],
  },
  {
    src: CLIP4, clipDur: 600,   // 20 s source
    step: "04 / TRAFFIC CONTEXT",
    question: "Show traffic context",
    stepComplete: "TRAFFIC CONTEXT · STEP COMPLETE",
    chatSnippet: "15,793 road segments around candidate sites (from 31,405 district-wide). 2,037 of them within 400m of a candidate site, weighted by road class.",
    stats: [
      { value: "15,793", label: "road segments loaded" },
      { value: "2,037",  label: "within 400m of candidate sites" },
    ],
  },
  {
    src: CLIP5, clipDur: 579,   // 19.3 s source
    step: "05 / TERRAIN & HEAT",
    question: "Run terrain &\nheat analysis",
    stepComplete: "RASTER CONTEXT · STEP COMPLETE",
    chatSnippet: "Built one continuous 48×48 terrain mesh within 535m of each site centroid. Real topography drives the surface; heat-island raster drives the drape color. ~30m raster pixels bilinearly interpolated.",
    stats: [
      { value: "+4.2m",  label: "above flood contour line" },
      { value: "< 30°C", label: "mean urban heat island" },
    ],
  },
  {
    src: CLIP6, clipDur: 810,   // 27 s source
    step: "06 / CATCHMENT & RANKING",
    question: "Run catchment\n& ranking",
    stepComplete: "CATCHMENT & RANKING · STEP COMPLETE",
    chatSnippet: "MCDA ranking of 2 eligible sites. Weights: population 40%, road/transit 25%, land suitability 20%, acquisition ease 15%. Recommended site: Site D (composite score 60.0/100).",
    stats: [
      { value: "Site D", label: "recommended site" },
      { value: "60.0",   label: "composite score / 100" },
    ],
  },
  {
    src: CLIP7, clipDur: 483,   // 16.1 s source
    step: "07 / IMPACT REPORT",
    question: "Generate\nimpact report",
    stepComplete: "RECOMMENDED SITE & IMPACT — CAMPERDOWN / DARLINGTON",
    chatSnippet: "Site D recommended (60.0/100, 1.4 ha demarcated). Estimated 812 people gain access. Illustrative capacity: 35 beds/units. 325 real building footprints in catchment.",
    stats: [
      { value: "812",    label: "people gain access" },
      { value: "35",     label: "capacity units" },
      { value: "1.4 ha", label: "demarcated site" },
    ],
  },
];

// ─── COMPUTE SEQUENCE OFFSETS ─────────────────────────────────────────────────
const TRAILER_DUR = 375; // 25 s of source at 2× = 375 comp frames
const Q_DUR       = 120;
const A_DUR       = 120;
const OUTRO_DUR   = 150;

interface SeqOffsets { q: number; c: number; a: number; clipDur: number }
let _off = TRAILER_DUR;
const SEQ: SeqOffsets[] = ENTRIES.map(({ clipDur }) => {
  const q = _off;
  const c = _off + Q_DUR;
  const a = _off + Q_DUR + clipDur;
  _off = a + A_DUR;
  return { q, c, a, clipDur };
});
const OUTRO_START = _off; // = 6203
// TOTAL = OUTRO_START + OUTRO_DUR = 6353

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export const DBFOnthologyVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>

    <Sequence durationInFrames={TRAILER_DUR}>
      <TrailerScene />
    </Sequence>

    {ENTRIES.map((entry, i) => {
      const { q, c, a, clipDur } = SEQ[i];
      return (
        <React.Fragment key={i}>
          <Sequence from={q} durationInFrames={Q_DUR}>
            <QuestionSlide
              bgSrc={entry.src}
              step={entry.step}
              question={entry.question}
            />
          </Sequence>

          <Sequence from={c} durationInFrames={clipDur}>
            <ClipScene src={entry.src} step={entry.step} />
          </Sequence>

          <Sequence from={a} durationInFrames={A_DUR}>
            <AnswerMorphSlide
              bgSrc={entry.src}
              stepComplete={entry.stepComplete}
              chatSnippet={entry.chatSnippet}
              stats={entry.stats}
            />
          </Sequence>
        </React.Fragment>
      );
    })}

    <Sequence from={OUTRO_START} durationInFrames={OUTRO_DUR}>
      <OutroScene />
    </Sequence>

  </AbsoluteFill>
);
