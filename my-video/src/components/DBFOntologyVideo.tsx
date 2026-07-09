/**
 * DBF Ontology — Product Launch Video
 * 2 min · 1920×1080 · 30fps
 *
 * Timeline (frames @ 30 fps):
 *   0-270    Hero slide         — "DBF Ontology"
 *   270-510  Problem slide      — "Cities make billion-dollar decisions…"
 *   510-1020 Video A (ONT 0-17s)  — Opening + AI query
 *   1020-1230 Stat slide        — 43 % / 118 / 2.2 M
 *   1230-1680 Video B (ONT 17-32s) — Gap result + site screening
 *   1680-1860 Insight slide     — "Real building footprints…"
 *   1860-2580 Video C (ONT 45-69s) — Traffic context + catchment
 *   2580-2760 Insight slide     — "MCDA ranking…"
 *   2760-3360 Video D (ONT 96-116s) — Impact report
 *   3360-3600 Outro slide       — "Know where to build."
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

const ONT = staticFile("references/Sydney/Ontology.mp4");

const C = {
  bg:     "#06080F",
  black:  "#020408",
  white:  "#F8FAFF",
  cyan:   "#00D4FF",
  orange: "#F5A623",
  muted:  "#8899AA",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const fi    = (f: number, start: number, dur: number) => clamp((f - start) / dur, 0, 1);
const sl    = (f: number, start: number, dur: number, dist = 22) =>
  dist * (1 - clamp((f - start) / dur, 0, 1));

// ─── Shared primitives ────────────────────────────────────────────────────────
const Grid: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => (
  <AbsoluteFill style={{
    opacity,
    backgroundImage: [
      "linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px)",
      "linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)",
    ].join(","),
    backgroundSize: "80px 80px",
    pointerEvents: "none",
  }} />
);

const Glow: React.FC<{ color?: string }> = ({ color = C.orange }) => (
  <div style={{
    position: "absolute", top: "40%", left: "50%",
    transform: "translate(-50%,-50%)",
    width: 1000, height: 600, borderRadius: "50%",
    background: `radial-gradient(ellipse, ${color}15 0%, ${color}06 45%, transparent 75%)`,
    pointerEvents: "none",
  }} />
);

// Fades in at start, fades out at end of its Sequence automatically.
const SceneFade: React.FC<{ fadeInDur?: number; fadeOutDur?: number }> = ({
  fadeInDur = 18, fadeOutDur = 18,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  const op = Math.min(clamp(f / fadeInDur, 0, 1), clamp((dur - f) / fadeOutDur, 0, 1));
  return (
    <AbsoluteFill style={{ background: "#000", opacity: 1 - op, pointerEvents: "none" }} />
  );
};

// ─── SLIDE 1 — HERO ──────────────────────────────────────────────────────────
const HeroSlide: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid opacity={0.07} />
      <Glow />
      {/* Badge */}
      <div style={{
        position: "absolute", top: 80, left: "50%",
        transform: "translateX(-50%)",
        opacity: fi(f, 0, 22),
        fontFamily: mono, fontSize: 13, letterSpacing: "0.3em",
        color: C.orange, textTransform: "uppercase",
        borderBottom: `1px solid ${C.orange}50`, paddingBottom: 8,
        whiteSpace: "nowrap",
      }}>
        Digital Blue Foam — Product Launch
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${sl(f, 14, 32)}px))`,
        opacity: fi(f, 14, 32), textAlign: "center",
      }}>
        <div style={{
          fontFamily: inter, fontSize: 112, fontWeight: 900,
          color: C.white, letterSpacing: "-4px", lineHeight: 1, marginBottom: 28,
        }}>
          DBF <span style={{ color: C.orange }}>Ontology</span>
        </div>
        <div style={{
          fontFamily: inter, fontSize: 26, fontWeight: 300,
          color: C.muted, letterSpacing: "0.04em",
        }}>
          AI-native urban intelligence for planners and city officials
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{
        position: "absolute", bottom: 72, left: "50%",
        transform: "translateX(-50%)",
        opacity: fi(f, 42, 22),
        fontFamily: mono, fontSize: 12, color: C.muted,
        letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        Ask the city. Get answers.
      </div>

      <SceneFade fadeInDur={22} fadeOutDur={22} />
    </AbsoluteFill>
  );
};

// ─── SLIDE 2 — PROBLEM ───────────────────────────────────────────────────────
const ProblemSlide: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Grid opacity={0.05} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${sl(f, 10, 28)}px))`,
        opacity: fi(f, 10, 28), textAlign: "center", maxWidth: 1100,
      }}>
        <div style={{
          fontFamily: mono, fontSize: 12, letterSpacing: "0.28em",
          color: C.orange, textTransform: "uppercase", marginBottom: 28,
        }}>
          The Problem
        </div>
        <div style={{
          fontFamily: inter, fontSize: 60, fontWeight: 800,
          color: C.white, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 36,
        }}>
          Cities make billion-dollar decisions<br />
          without knowing where they're failing.
        </div>
        <div style={{
          fontFamily: inter, fontSize: 22, fontWeight: 300,
          color: C.muted, lineHeight: 1.65,
        }}>
          Healthcare gaps, poor site selection, and disconnected data<br />
          cost communities years of delays and billions in misallocated spending.
        </div>
      </div>
      <SceneFade fadeInDur={18} fadeOutDur={18} />
    </AbsoluteFill>
  );
};

// ─── VIDEO CLIP CONTAINER ─────────────────────────────────────────────────────
const OntologyClip: React.FC<{ startFrom: number; step: string; title: string }> = ({
  startFrom, step, title,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Sequence from={-startFrom}>
        <OffthreadVideo
          src={ONT}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Sequence>

      {/* Step caption */}
      <div style={{
        position: "absolute", top: 44, left: 64,
        opacity: fi(f, 10, 22),
        transform: `translateY(${sl(f, 10, 22)}px)`,
      }}>
        <div style={{
          fontFamily: mono, fontSize: 11, letterSpacing: "0.28em",
          color: C.orange, textTransform: "uppercase", marginBottom: 6,
        }}>
          {step}
        </div>
        <div style={{
          fontFamily: inter, fontSize: 24, fontWeight: 700, color: C.white,
          textShadow: "0 2px 20px rgba(0,0,0,0.85)",
        }}>
          {title}
        </div>
      </div>

      {/* Top and bottom blends */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 140,
        background: `linear-gradient(to bottom, ${C.black}CC, transparent)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
        background: `linear-gradient(to top, ${C.black}CC, transparent)`,
        pointerEvents: "none",
      }} />

      <SceneFade fadeInDur={15} fadeOutDur={15} />
    </AbsoluteFill>
  );
};

// ─── STAT SLIDE ───────────────────────────────────────────────────────────────
type Stat = { value: string; label: string; color?: string };
const StatSlide: React.FC<{
  tag: string; headline: string;
  stats: Stat[]; body: string;
}> = ({ tag, headline, stats, body }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid />
      <Glow color={C.cyan} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${sl(f, 10, 28)}px))`,
        opacity: fi(f, 10, 28), textAlign: "center", width: 1400,
      }}>
        <div style={{
          fontFamily: mono, fontSize: 12, letterSpacing: "0.28em",
          color: C.orange, textTransform: "uppercase", marginBottom: 22,
        }}>
          {tag}
        </div>
        <div style={{
          fontFamily: inter, fontSize: 48, fontWeight: 800,
          color: C.white, letterSpacing: "-1px", lineHeight: 1.1,
          marginBottom: 52, whiteSpace: "pre-line",
        }}>
          {headline}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 80, marginBottom: 44 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              opacity: fi(f, 24 + i * 10, 20),
              transform: `translateY(${sl(f, 24 + i * 10, 20)}px)`,
            }}>
              <div style={{
                fontFamily: inter, fontSize: 76, fontWeight: 900,
                color: s.color ?? C.cyan, letterSpacing: "-2px", lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: mono, fontSize: 11, color: C.muted,
                letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 10,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: inter, fontSize: 20, fontWeight: 300,
          color: C.muted, lineHeight: 1.65,
          maxWidth: 860, margin: "0 auto",
          opacity: fi(f, 46, 18),
        }}>
          {body}
        </div>
      </div>
      <SceneFade fadeInDur={18} fadeOutDur={18} />
    </AbsoluteFill>
  );
};

// ─── INSIGHT SLIDE ────────────────────────────────────────────────────────────
const InsightSlide: React.FC<{
  step: string; title: string; body: string; accent?: string;
}> = ({ step, title, body, accent = C.cyan }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid />
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: 4, height: "100%",
        background: `linear-gradient(to bottom, transparent, ${accent} 25%, ${accent} 75%, transparent)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: 160, right: 160,
        transform: `translateY(calc(-50% + ${sl(f, 10, 26)}px))`,
        opacity: fi(f, 10, 26),
      }}>
        <div style={{
          fontFamily: mono, fontSize: 12, letterSpacing: "0.28em",
          color: accent, textTransform: "uppercase", marginBottom: 22,
        }}>
          {step}
        </div>
        <div style={{
          fontFamily: inter, fontSize: 56, fontWeight: 800,
          color: C.white, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 32,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: inter, fontSize: 22, fontWeight: 300,
          color: C.muted, lineHeight: 1.65, maxWidth: 880,
        }}>
          {body}
        </div>
      </div>
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </AbsoluteFill>
  );
};

// ─── OUTRO ────────────────────────────────────────────────────────────────────
const OutroSlide: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Grid opacity={0.07} />
      <Glow color={C.orange} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${sl(f, 14, 32)}px))`,
        opacity: fi(f, 14, 32), textAlign: "center",
      }}>
        <div style={{
          fontFamily: inter, fontSize: 82, fontWeight: 900,
          color: C.white, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 28,
        }}>
          Know where to build.<br />
          <span style={{ color: C.orange }}>Know why it matters.</span>
        </div>
        <div style={{
          fontFamily: inter, fontSize: 22, fontWeight: 300,
          color: C.muted, marginBottom: 52,
        }}>
          DBF Ontology — Digital Blue Foam
        </div>
        <div style={{
          fontFamily: mono, fontSize: 13, letterSpacing: "0.22em",
          color: C.cyan, textTransform: "uppercase",
          opacity: fi(f, 44, 22), whiteSpace: "nowrap",
        }}>
          Building the reasoning layer for urban decisions
        </div>
      </div>
      <SceneFade fadeInDur={22} fadeOutDur={22} />
    </AbsoluteFill>
  );
};

// ─── COMPOSITION ROOT ─────────────────────────────────────────────────────────
export const DBFOntologyVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>

    {/* 1. Hero — 0-270 (9 s) */}
    <Sequence durationInFrames={270}>
      <HeroSlide />
    </Sequence>

    {/* 2. Problem — 270-510 (8 s) */}
    <Sequence from={270} durationInFrames={240}>
      <ProblemSlide />
    </Sequence>

    {/* 3. Video A — 510-1020 (17 s) · ONT t=0-17 s */}
    <Sequence from={510} durationInFrames={510}>
      <OntologyClip
        startFrom={0}
        step="01 / Gap Analysis"
        title="Identifying healthcare access failures across Sydney"
      />
    </Sequence>

    {/* 4. Stat slide — 1020-1230 (7 s) */}
    <Sequence from={1020} durationInFrames={210}>
      <StatSlide
        tag="Gap Analysis — Results"
        headline={"43% of Sydney lives in\nhealthcare-deficient zones."}
        stats={[
          { value: "43%",  label: "Population affected",   color: C.orange },
          { value: "118",  label: "Districts flagged",      color: C.cyan   },
          { value: "2.2M", label: "People underserved",    color: C.muted  },
        ]}
        body="118 of 373 Sydney districts score below the healthcare access benchmark. Worst-scoring: Chullora, Leumeah, Carlingford."
      />
    </Sequence>

    {/* 5. Video B — 1230-1680 (15 s) · ONT t=17-32 s */}
    <Sequence from={1230} durationInFrames={450}>
      <OntologyClip
        startFrom={510}
        step="02 / Site Screening"
        title="Screening candidate hospital sites in Richmond-Clarendon"
      />
    </Sequence>

    {/* 6. Insight — 1680-1860 (6 s) */}
    <Sequence from={1680} durationInFrames={180}>
      <InsightSlide
        step="02 / Site Screening"
        title="Real building footprints. Real constraints."
        body="6 candidate sites screened using Overture Maps building footprints. Zoning, flood risk, and minimum area rules applied automatically. 3 eligible, 3 disqualified."
        accent={C.cyan}
      />
    </Sequence>

    {/* 7. Video C — 1860-2580 (24 s) · ONT t=45-69 s */}
    <Sequence from={1860} durationInFrames={720}>
      <OntologyClip
        startFrom={1350}
        step="03 / Catchment & Ranking"
        title="Traffic context loaded. Multi-criteria scoring begins."
      />
    </Sequence>

    {/* 8. Insight — 2580-2760 (6 s) */}
    <Sequence from={2580} durationInFrames={180}>
      <InsightSlide
        step="03 / Catchment & Ranking"
        title="MCDA ranking. Best site, instantly."
        body="4,775 road segments. 1200m catchment estimated. Sites ranked by population reach, land suitability, transit access, and acquisition ease. Top score: 67.5 / 100."
        accent={C.orange}
      />
    </Sequence>

    {/* 9. Video D — 2760-3360 (20 s) · ONT t=96-116 s */}
    <Sequence from={2760} durationInFrames={600}>
      <OntologyClip
        startFrom={2880}
        step="04 / Impact Report"
        title="Recommended site: Richmond-Clarendon. 929 people gain access."
      />
    </Sequence>

    {/* 10. Outro — 3360-3600 (8 s) */}
    <Sequence from={3360} durationInFrames={240}>
      <OutroSlide />
    </Sequence>

  </AbsoluteFill>
);
