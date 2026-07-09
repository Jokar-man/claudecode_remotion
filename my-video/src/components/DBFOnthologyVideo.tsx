/**
 * DBF Onthology — Product Demo Video
 * ~1:52 · 1920×1080 · 30fps
 *
 * Timeline (frames @ 30 fps):
 *   0   – 270   Trailer       — 3D visualization + "Onthology" title overlay (1×)
 *   270 – 920   Clip 1 (3×)  — Gap analysis: finds underserved land parcels
 *   920 – 1100  Text slide 1  — Gap analysis summary (Clip 1 blurred bg)
 *   1100– 1663  Clip 2 (3×)  — Site screening + traffic context
 *   1663– 1843  Text slide 2  — Site screening summary (Clip 2 blurred bg)
 *   1843– 2414  Clip 3 (3×)  — Terrain & UHI raster analysis
 *   2414– 2594  Text slide 3  — Terrain/UHI summary (Clip 3 blurred bg)
 *   2594– 3161  Clip 4 (3×)  — Catchment compilation + final report
 *   3161– 3361  Outro         — "Site intelligence. Instantly reasoned."
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
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: inter } = loadInter();
const { fontFamily: mono } = loadMono();

// ─── Sources ──────────────────────────────────────────────────────────────────
const TRAILER = staticFile("references/Sydney/Onthology series/Trailer.mp4");
const CLIP1 = staticFile("references/Sydney/Onthology series/Clip 1.mp4");
const CLIP2 = staticFile("references/Sydney/Onthology series/Clip 2.mp4");
const CLIP3 = staticFile("references/Sydney/Onthology series/Clip 3.mp4");
const CLIP4 = staticFile("references/Sydney/Onthology series/Clip 4.mp4");

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#06080F",
  black: "#020408",
  white: "#F0F4FF",
  cyan: "#00D4FF",
  orange: "#F5A623",
  muted: "#7A8FAA",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const fi = (f: number, start: number, dur: number) => clamp((f - start) / dur, 0, 1);
const sl = (f: number, start: number, dur: number, dist = 18) =>
  dist * (1 - clamp((f - start) / dur, 0, 1));

// ─── SceneFade ────────────────────────────────────────────────────────────────
// useVideoConfig().durationInFrames returns the enclosing Sequence's duration,
// so this automatically fades in/out within each Sequence.
const SceneFade: React.FC<{ fadeInDur?: number; fadeOutDur?: number }> = ({
  fadeInDur = 18,
  fadeOutDur = 18,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  const op = Math.min(clamp(f / fadeInDur, 0, 1), clamp((dur - f) / fadeOutDur, 0, 1));
  return (
    <AbsoluteFill style={{ background: "#000", opacity: 1 - op, pointerEvents: "none" }} />
  );
};

// ─── Grid overlay ─────────────────────────────────────────────────────────────
const Grid: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: [
        "linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)",
      ].join(","),
      backgroundSize: "80px 80px",
      pointerEvents: "none",
    }}
  />
);

// ─── SCENE 0 — TRAILER ───────────────────────────────────────────────────────
const TrailerScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.black }}>
      {/* Trailer video — 8 s source, plays at 1× */}
      <OffthreadVideo
        src={TRAILER}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Bottom gradient so text reads over the 3D vis */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(2,4,8,0.92) 0%, rgba(2,4,8,0.40) 38%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      {/* Centered title — appears over the 3D visualization */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 12,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: C.cyan,
            marginBottom: 16,
            opacity: fi(f, 12, 20),
            transform: `translateY(${sl(f, 12, 20)}px)`,
          }}
        >
          Digital Blue Foam
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 100,
            fontWeight: 900,
            color: C.white,
            letterSpacing: "-3px",
            lineHeight: 1,
            opacity: fi(f, 22, 28),
            transform: `translateY(${sl(f, 22, 28, 20)}px)`,
          }}
        >
          Onthology
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 20,
            fontWeight: 300,
            color: "rgba(240,244,255,0.60)",
            letterSpacing: "0.06em",
            marginTop: 18,
            opacity: fi(f, 46, 22),
            transform: `translateY(${sl(f, 46, 22)}px)`,
          }}
        >
          AI-driven site intelligence for urban healthcare
        </div>
      </AbsoluteFill>

      <SceneFade fadeInDur={22} fadeOutDur={22} />
    </AbsoluteFill>
  );
};

// ─── CLIP SCENE — video at 3× with step label overlay ─────────────────────────
const ClipScene: React.FC<{
  src: string;
  step: string;
  label: string;
}> = ({ src, step, label }) => {
  const f = useCurrentFrame();
  const labelOp = fi(f, 6, 18);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <OffthreadVideo
        src={src}
        muted
        playbackRate={3}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.60) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Speed badge — top right */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 48,
          background: "rgba(0,212,255,0.12)",
          border: "1px solid rgba(0,212,255,0.35)",
          borderRadius: 4,
          padding: "5px 14px",
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: "0.22em",
          color: C.cyan,
          opacity: labelOp,
        }}
      >
        3× speed
      </div>

      {/* Step label — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 64,
          opacity: labelOp,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: "0.30em",
            textTransform: "uppercase",
            color: C.cyan,
            marginBottom: 8,
          }}
        >
          {step}
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 17,
            fontWeight: 500,
            color: "rgba(240,244,255,0.80)",
          }}
        >
          {label}
        </div>
      </div>

      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </AbsoluteFill>
  );
};

// ─── TEXT SLIDE — blurred/frozen video background + stats ─────────────────────
interface Stat {
  value: string;
  label: string;
}

const TextSlide: React.FC<{
  bgSrc: string;
  step: string;
  title: string;
  body: string;
  stats?: Stat[];
}> = ({ bgSrc, step, title, body, stats }) => {
  const f = useCurrentFrame();
  const stepOp = fi(f, 8, 18);
  const lineW = stepOp * 72;
  const titleOp = fi(f, 22, 20);
  const bodyOp = fi(f, 40, 22);
  const statOp = fi(f, 56, 18);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Frozen blurred backdrop — next clip at near-zero playback rate */}
      <AbsoluteFill
        style={{
          opacity: 0.50,
          filter: "blur(30px)",
          transform: "scale(1.08)",
        }}
      >
        <OffthreadVideo
          src={bgSrc}
          muted
          playbackRate={0.01}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Dark scrim */}
      <AbsoluteFill style={{ background: "rgba(6,8,15,0.80)" }} />

      {/* Grid at low opacity */}
      <Grid opacity={0.04} />

      {/* Content column */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 160px",
        }}
      >
        {/* Step mono label */}
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: C.cyan,
            marginBottom: 14,
            opacity: stepOp,
            transform: `translateY(${sl(f, 8, 18)}px)`,
          }}
        >
          {step}
        </div>

        {/* Animated accent line */}
        <div
          style={{
            width: lineW,
            height: 2,
            background: C.cyan,
            marginBottom: 30,
            opacity: stepOp,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 58,
            fontWeight: 800,
            color: C.white,
            letterSpacing: "-1.2px",
            lineHeight: 1.1,
            maxWidth: 920,
            marginBottom: 28,
            opacity: titleOp,
            transform: `translateY(${sl(f, 22, 20)}px)`,
          }}
        >
          {title}
        </div>

        {/* Body */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 19,
            fontWeight: 300,
            color: "rgba(240,244,255,0.68)",
            lineHeight: 1.70,
            maxWidth: 800,
            opacity: bodyOp,
            transform: `translateY(${sl(f, 40, 22)}px)`,
          }}
        >
          {body}
        </div>

        {/* Stats row */}
        {stats && (
          <div
            style={{
              display: "flex",
              gap: 64,
              marginTop: 52,
              opacity: statOp,
              transform: `translateY(${sl(f, 56, 18)}px)`,
            }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 46,
                    fontWeight: 800,
                    color: C.cyan,
                    letterSpacing: "-1px",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginTop: 8,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </AbsoluteFill>

      <SceneFade fadeInDur={16} fadeOutDur={16} />
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid opacity={0.06} />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 900,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.cyan}12 0%, ${C.cyan}05 50%, transparent 76%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontFamily: mono,
          fontSize: 12,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          color: C.cyan,
          marginBottom: 22,
          opacity: fi(f, 18, 22),
          transform: `translateY(${sl(f, 18, 22)}px)`,
        }}
      >
        Digital Blue Foam
      </div>

      <div
        style={{
          fontFamily: inter,
          fontSize: 108,
          fontWeight: 900,
          color: C.white,
          letterSpacing: "-4px",
          lineHeight: 1,
          opacity: fi(f, 28, 26),
          transform: `translateY(${sl(f, 28, 26, 22)}px)`,
        }}
      >
        Onthology
      </div>

      <div
        style={{
          width: fi(f, 52, 22) * 320,
          height: 1,
          background: `linear-gradient(to right, transparent, ${C.cyan}, transparent)`,
          marginTop: 32,
          marginBottom: 32,
          opacity: fi(f, 52, 22),
        }}
      />

      <div
        style={{
          fontFamily: inter,
          fontSize: 24,
          fontWeight: 300,
          color: "rgba(240,244,255,0.50)",
          letterSpacing: "0.06em",
          opacity: fi(f, 60, 22),
          transform: `translateY(${sl(f, 60, 22)}px)`,
        }}
      >
        Site intelligence. Instantly reasoned.
      </div>

      <SceneFade fadeInDur={24} fadeOutDur={30} />
    </AbsoluteFill>
  );
};

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
// Clip durations at 3× (source_seconds / 3 * 30fps):
//   Clip 1: 65.0s → 650 f    Clip 2: 56.3s → 563 f
//   Clip 3: 57.1s → 571 f    Clip 4: 56.7s → 567 f
const T = {
  trailer: 0,   // 0   – 270
  clip1:   270, // 270 – 920
  text1:   920, // 920 – 1100
  clip2:  1100, // 1100– 1663
  text2:  1663, // 1663– 1843
  clip3:  1843, // 1843– 2414
  text3:  2414, // 2414– 2594
  clip4:  2594, // 2594– 3161
  outro:  3161, // 3161– 3361
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export const DBFOnthologyVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>

    {/* Trailer — 3D visualization with Onthology title overlay */}
    <Sequence from={T.trailer} durationInFrames={270}>
      <TrailerScene />
    </Sequence>

    {/* Clip 1 — Gap analysis: AI finds underserved land parcels */}
    <Sequence from={T.clip1} durationInFrames={650}>
      <ClipScene
        src={CLIP1}
        step="01 / Gap Analysis"
        label="Finding land parcels outside healthcare isochrones"
      />
    </Sequence>

    {/* Text slide 1 — gap analysis results */}
    <Sequence from={T.text1} durationInFrames={180}>
      <TextSlide
        bgSrc={CLIP1}
        step="01 / Gap Analysis"
        title="Healthcare Access Gap Detection"
        body="The system queries 5,581 real cadastral land parcels across the district, checking each against 34 hospital, clinic and doctor locations using 15-minute walking isochrones. 103 parcels fall entirely outside any existing facility — flagged as gap candidates for site screening."
        stats={[
          { value: "5,581", label: "parcels checked" },
          { value: "103", label: "gap parcels identified" },
          { value: "34", label: "existing facilities" },
        ]}
      />
    </Sequence>

    {/* Clip 2 — Site screening + traffic context */}
    <Sequence from={T.clip2} durationInFrames={563}>
      <ClipScene
        src={CLIP2}
        step="02 / Site Screening"
        label="Candidate selection with traffic road context"
      />
    </Sequence>

    {/* Text slide 2 — site screening summary */}
    <Sequence from={T.text2} durationInFrames={180}>
      <TextSlide
        bgSrc={CLIP2}
        step="02 / Site Screening"
        title="Candidate Sites & Traffic Context"
        body="6 candidate sites are screened within the access-gap pocket. Zoning conflicts, flood risk and minimum area thresholds disqualify 4 — leaving 2 eligible sites. 1,759 real Overture road segments are loaded to model pedestrian and vehicle access within 400m of each candidate."
        stats={[
          { value: "6", label: "candidates screened" },
          { value: "2", label: "eligible sites" },
          { value: "1,759", label: "road segments loaded" },
        ]}
      />
    </Sequence>

    {/* Clip 3 — Topographic and UHI raster analysis */}
    <Sequence from={T.clip3} durationInFrames={571}>
      <ClipScene
        src={CLIP3}
        step="03 / Terrain & Heat"
        label="Raster to 3D mesh — topography and Urban Heat Island"
      />
    </Sequence>

    {/* Text slide 3 — terrain and UHI summary */}
    <Sequence from={T.text3} durationInFrames={180}>
      <TextSlide
        bgSrc={CLIP3}
        step="03 / Terrain & Heat Analysis"
        title="Topographic & Urban Heat Island Mapping"
        body="A continuous 48×48 surface mesh is built within 535m of each eligible site. Real 30m elevation raster data and Urban Heat Island gradients are bilinearly interpolated — independently assessing flood vulnerability and thermal stress at each site centroid."
        stats={[
          { value: "48×48", label: "mesh resolution" },
          { value: "535m", label: "site radius" },
          { value: "30m", label: "raster pixel size" },
        ]}
      />
    </Sequence>

    {/* Clip 4 — Catchment compilation and final report */}
    <Sequence from={T.clip4} durationInFrames={567}>
      <ClipScene
        src={CLIP4}
        step="04 / Catchment & Ranking"
        label="Compiling all layers into a composite site ranking"
      />
    </Sequence>

    {/* Outro */}
    <Sequence from={T.outro} durationInFrames={200}>
      <OutroScene />
    </Sequence>

  </AbsoluteFill>
);
