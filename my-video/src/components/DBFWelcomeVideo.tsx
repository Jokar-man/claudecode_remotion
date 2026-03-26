/**
 * Digital Blue Foam — Welcome & Intro Video
 * 2 minutes · 1920×1080 · 30fps
 *
 * Scene 1  0:00–0:08   Company Intro           frames 0–240
 * Scene 2  0:08–0:28   What We Build           frames 240–840
 *           Slide A (0–300):  Gen Design + Analytics split-screen
 *           Slide B (300–600): Collaborative Platform full-width
 * Scene 3  0:28–0:43   Past Work & Partners    frames 840–1290
 * Scene 4  0:43–1:03   Dubai Municipality      frames 1290–1890  (ref 0–20s)
 * Scene 5  1:03–1:55   Project Deep Dive       frames 1890–3450  (ref 20–72s)
 * Scene 6  1:55–2:00   Welcome Outro           frames 3450–3600
 */

import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/IBMPlexMono";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const { fontFamily: inter } = loadFont("normal", {
  weights: ["300", "700", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const { fontFamily: mono } = loadMonoFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  black:     "#000000",
  white:     "#ffffff",
  blue:      "#0d00ff",
  lightBlue: "#4A9EFF",
  cyan:      "#00C8FF",
  muted:     "#6B8BB0",
  green:     "#00E5A0",
};

// ─── Scene Boundaries (frames) ────────────────────────────────────────────────
// Scene 2 Slide A : 240 frames (= gen/city at 8.0 s — plays once, no loop)
// Scene 2 Slide B : 150 frames (= collaborate at 5.0 s — plays once, no loop)
// Scene 3 Mass    : 225 frames (dbfmass is 18.6 s — no loop risk)
// Scene 3 Plot    : 200 frames (dbfplot is 6.8 s — stays just under loop point)
// Scene 5         : 1795 frames distributed over 4 ref-video clips × ~449 f
const S = {
  intro:    { start: 0,    end: 240  },
  build:    { start: 240,  end: 630  },   // 240 + 150 = 390
  partners: { start: 630,  end: 1055 },   // 225 + 200 = 425
  dubai:    { start: 1055, end: 1655 },   // 600
  deepdive: { start: 1655, end: 3450 },   // 1795
  outro:    { start: 3450, end: 3600 },
};

// ─── Asset Paths ──────────────────────────────────────────────────────────────
const REF = staticFile("references/03.10.2025-DM-Demo-Video(revision).mp4");
const V = {
  gen:    staticFile("assets/dbf-videos/gen-vertical.mp4"),
  city:   staticFile("assets/dbf-videos/city-vertical.mp4"),
  collab: staticFile("references/collaborate.mp4"),
  mass:   staticFile("assets/dbf-videos/dbfmass-demo.mp4"),
  plot:   staticFile("assets/dbf-videos/dbfplot-demo.mp4"),
};
const A = { logo: staticFile("assets/dbf-white.svg") };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOut  = (t: number) => 1 - (1 - t) * (1 - t);

/** Fade in: 0 → 1 */
const fi = (f: number, startF: number, dur = 20) =>
  easeOut3(clamp((f - startF) / dur, 0, 1));

/** Slide up: distance → 0 */
const su = (f: number, startF: number, dur = 25, dist = 24) =>
  interpolate(clamp((f - startF) / dur, 0, 1), [0, 1], [dist, 0]);

/** Fade in then fade out */
const fifo = (f: number, startF: number, endF: number, inDur = 20, outDur = 20) =>
  interpolate(
    f,
    [startF, startF + inDur, endF - outDur, endF],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// ─── SceneFade: black → transparent → black ───────────────────────────────────
// Guards against non-monotonic input ranges (e.g. when fadeOutDur = 0).
const SceneFade: React.FC<{ fadeInDur?: number; fadeOutDur?: number }> = ({
  fadeInDur  = 18,
  fadeOutDur = 18,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();

  const inD      = Math.min(fadeInDur, dur);
  const outD     = Math.min(fadeOutDur, dur - inD);
  const outStart = dur - outD;

  const opacity =
    outD > 0
      ? interpolate(frame, [0, inD, outStart, dur], [1, 0, 0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [0, inD], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return <AbsoluteFill style={{ background: C.black, opacity, pointerEvents: "none" }} />;
};

// ─── Portrait video (588×720) — single Video, centered, black sides ───────────
const PortraitBG: React.FC<{
  src: string;
  overlayOpacity?: number;
  startFrom?: number;
}> = ({ src, overlayOpacity = 0.45, startFrom = 0 }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: C.black }}>
    {/* Single centered video — no crop, black letterbox on sides */}
    <Sequence from={-startFrom}>
      <OffthreadVideo
        src={src}
        muted
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          height: "100%",
          width: "auto",
        }}
      />
    </Sequence>
    {/* Side vignettes to soften the black edges */}
    <AbsoluteFill style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
    {/* Content overlay */}
    <AbsoluteFill style={{ background: `rgba(0,0,0,${overlayOpacity})`, pointerEvents: "none" }} />
  </AbsoluteFill>
);

// ─── Portrait video inside a fixed-width panel — single Video ─────────────────
const PortraitPanel: React.FC<{
  src: string;
  left: number;
  width: number;
}> = ({ src, left, width }) => (
  <div style={{ position: "absolute", left, top: 0, width, height: 1080, overflow: "hidden", background: C.black }}>
    {/* Single centered video — no crop, black letterbox on sides */}
    <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center" }}>
      <OffthreadVideo src={src} muted style={{ height: "100%", width: "auto" }} />
    </div>
  </div>
);

// ─── Landscape reference video (1920×1080) ────────────────────────────────────
const LandscapeBG: React.FC<{
  src: string;
  startFrom?: number;
  overlayOpacity?: number;
}> = ({ src, startFrom = 0, overlayOpacity = 0.45 }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Sequence from={-startFrom}>
      <OffthreadVideo src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Sequence>
    <AbsoluteFill style={{ background: `linear-gradient(160deg, rgba(0,0,0,${overlayOpacity * 0.9}) 0%, rgba(13,0,255,${overlayOpacity * 0.07}) 50%, rgba(0,0,0,${overlayOpacity}) 100%)`, pointerEvents: "none" }} />
  </AbsoluteFill>
);

// ─── Landscape demo video (800×500) — single Video, centered ──────────────────
const DemoBG: React.FC<{
  src: string;
  overlayOpacity?: number;
}> = ({ src, overlayOpacity = 0.3 }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#06080F" }}>
    {/* Single centered video — natural size, no crop */}
    <OffthreadVideo
      src={src}
      muted
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        maxWidth: "86%",
        maxHeight: "86%",
        objectFit: "contain",
      }}
    />
    <AbsoluteFill style={{ background: `rgba(0,0,0,${overlayOpacity})`, pointerEvents: "none" }} />
  </AbsoluteFill>
);

// ─── Shared text primitives ───────────────────────────────────────────────────
const Grid: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0, opacity, pointerEvents: "none" }}>
    {Array.from({ length: 11 }).map((_, i) => (
      <line key={`v${i}`} x1={((i+1)*1920)/12} y1={0} x2={((i+1)*1920)/12} y2={1080} stroke={C.blue} strokeWidth={0.4} />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={((i+1)*1080)/6} x2={1920} y2={((i+1)*1080)/6} stroke={C.blue} strokeWidth={0.4} />
    ))}
  </svg>
);

const Scan: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => {
  const f = useCurrentFrame();
  const y = ((f % 90) / 90) * 1080;
  return <div style={{ position: "absolute", top: y, left: 0, width: "100%", height: 1, background: `linear-gradient(to right, transparent 0%, ${C.cyan}55 40%, ${C.cyan}55 60%, transparent 100%)`, opacity, pointerEvents: "none" }} />;
};

const MonoTag: React.FC<{ text: string; f: number; startF?: number; color?: string }> = ({
  text, f, startF = 0, color = C.blue,
}) => (
  <div style={{ position: "absolute", top: 76, left: 120, opacity: fi(f, startF), transform: `translateY(${su(f, startF)}px)`, display: "flex", alignItems: "center", gap: 10, fontFamily: mono, fontSize: 13, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", color }}>
    <div style={{ width: 28, height: 1, background: color }} />
    {text}
  </div>
);

const H1: React.FC<{
  text: React.ReactNode; f: number; startF?: number;
  top?: number; left?: number; fontSize?: number; maxWidth?: number; color?: string;
  opacity?: number;
}> = ({ text, f, startF = 0, top = 380, left = 120, fontSize = 80, maxWidth = 1200, color = C.white, opacity }) => (
  <div style={{ position: "absolute", top, left, opacity: opacity ?? fi(f, startF, 28), transform: `translateY(${su(f, startF, 28, 28)}px)`, fontFamily: inter, fontSize, fontWeight: 900, color, letterSpacing: "-2px", lineHeight: 1.05, maxWidth }}>
    {text}
  </div>
);

const BodyText: React.FC<{
  text: string; f: number; startF?: number;
  top?: number; left?: number; maxWidth?: number; opacity?: number;
}> = ({ text, f, startF = 0, top = 480, left = 120, maxWidth = 860, opacity }) => (
  <div style={{ position: "absolute", top, left, opacity: opacity ?? fi(f, startF, 22), transform: `translateY(${su(f, startF, 22, 15)}px)`, fontFamily: inter, fontSize: 24, fontWeight: 300, color: C.muted, letterSpacing: "0.01em", lineHeight: 1.55, maxWidth }}>
    {text}
  </div>
);

const BotLabel: React.FC<{ text: string; f: number; startF?: number }> = ({ text, f, startF = 0 }) => (
  <div style={{ position: "absolute", bottom: 108, left: 120, opacity: fi(f, startF, 18), transform: `translateX(${interpolate(clamp((f - startF) / 18, 0, 1), [0, 1], [-16, 0])}px)`, display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue, boxShadow: `0 0 12px ${C.cyan}` }} />
    <div style={{ fontFamily: inter, fontSize: 22, fontWeight: 600, color: C.white, letterSpacing: "0.01em" }}>{text}</div>
  </div>
);

const DTitle: React.FC<{ num: string; title: string; f: number; startF?: number }> = ({ num, title, f, startF = 0 }) => (
  <div style={{ position: "absolute", top: 76, left: 120, opacity: fi(f, startF, 22), transform: `translateY(${su(f, startF, 22, 16)}px)` }}>
    <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 400, letterSpacing: "0.28em", textTransform: "uppercase", color: C.cyan, marginBottom: 10 }}>{num}</div>
    <div style={{ fontFamily: inter, fontSize: 48, fontWeight: 800, color: C.white, letterSpacing: "-0.5px", lineHeight: 1.1, maxWidth: 760 }}>{title}</div>
  </div>
);

const Logo: React.FC<{ opacity?: number }> = ({ opacity = 0.75 }) => (
  <div style={{ position: "absolute", bottom: 44, right: 80, opacity }}>
    <Img src={A.logo} style={{ height: 38, width: "auto" }} />
  </div>
);

const KPICard: React.FC<{ label: string; value: string; unit: string; color: string; f: number; startF: number }> = ({
  label, value, unit, color, f, startF,
}) => (
  <div style={{ opacity: fi(f, startF, 20), transform: `translateY(${su(f, startF, 20, 14)}px)`, background: "rgba(4,11,22,0.84)", border: `1px solid ${color}28`, borderRadius: 10, padding: "18px 22px", minWidth: 210 }}>
    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
    <div style={{ fontFamily: inter, fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 15, fontWeight: 400, color: C.muted, marginLeft: 6 }}>{unit}</span>
    </div>
  </div>
);

const IsoRings: React.FC<{ cx: number; cy: number; progress: number }> = ({ cx, cy, progress }) => {
  const rings = [
    { maxR: 190, delay: 0,    color: C.green,     label: "5 min" },
    { maxR: 340, delay: 0.22, color: C.cyan,      label: "10 min" },
    { maxR: 490, delay: 0.42, color: C.lightBlue, label: "20 min" },
  ];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      {rings.map((ring, i) => {
        const lp  = clamp((progress - ring.delay) / (1 - ring.delay + 0.01), 0, 1);
        const r   = ring.maxR * easeOut(lp);
        const opa = lp > 0 ? 0.55 * (1 - lp * 0.28) : 0;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={`${ring.color}09`} stroke={ring.color} strokeWidth={1.5} strokeDasharray="10 7" opacity={opa} />
            {lp > 0.75 && (
              <text x={cx + r + 10} y={cy + 5} fill={ring.color} fontSize={13} fontFamily={`${mono}, monospace`} opacity={Math.min((lp - 0.75) / 0.2, 1) * 0.85}>{ring.label}</text>
            )}
          </g>
        );
      })}
      {progress > 0.05 && (
        <>
          <circle cx={cx} cy={cy} r={22} fill={C.cyan} opacity={0.12} />
          <circle cx={cx} cy={cy} r={9}  fill={C.cyan} opacity={0.75} />
          <circle cx={cx} cy={cy} r={4}  fill={C.white} />
        </>
      )}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Company Intro (240 frames = 8 s)
// ═══════════════════════════════════════════════════════════════════════════════
const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const bgOp   = clamp(f / 20, 0, 1);
  const logoOp = fi(f, 20, 30);
  const logoSc = interpolate(clamp((f - 20) / 30, 0, 1), [0, 1], [0.88, 1]);
  return (
    <>
      <AbsoluteFill style={{ background: C.black, opacity: bgOp }} />
      <div style={{ position: "absolute", top: -200, right: -200, width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(circle, ${C.blue}20 0%, transparent 68%)`, opacity: bgOp }} />
      <div style={{ position: "absolute", bottom: -140, left: -80, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}12 0%, transparent 70%)`, opacity: bgOp * 0.7 }} />
      <Grid opacity={0.06 * bgOp} />

      {/* DBF Logo */}
      <div style={{ position: "absolute", top: "32%", left: "50%", transform: `translate(-50%, -50%) scale(${logoSc})`, opacity: logoOp }}>
        <Img src={A.logo} style={{ height: 58, width: "auto" }} />
      </div>

      {/* Title */}
      <div style={{ position: "absolute", top: "45%", left: "50%", transform: `translate(-50%, calc(-50% + ${su(f, 55, 28, 26)}px))`, opacity: fi(f, 55, 28), fontFamily: inter, fontSize: 96, fontWeight: 900, color: C.white, letterSpacing: "-3px", lineHeight: 1, textAlign: "center", whiteSpace: "nowrap" }}>
        Digital Blue Foam
      </div>

      {/* Subtitle */}
      <div style={{ position: "absolute", top: "57%", left: "50%", transform: `translate(-50%, calc(-50% + ${su(f, 100, 26, 16)}px))`, opacity: fi(f, 100, 26), fontFamily: inter, fontSize: 25, fontWeight: 300, color: C.lightBlue, letterSpacing: "0.05em", textAlign: "center", whiteSpace: "nowrap" }}>
        AI-Powered Urban Design Platform
      </div>

      {/* Divider */}
      <div style={{ position: "absolute", top: "63.5%", left: "50%", transform: "translateX(-50%)", opacity: fi(f, 130, 26), display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 1, background: `${C.blue}70` }} />
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.blue }} />
        <div style={{ width: 52, height: 1, background: `${C.blue}70` }} />
      </div>

      {/* URL */}
      <div style={{ position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)", opacity: fi(f, 155, 24) * 0.6, fontFamily: mono, fontSize: 12, letterSpacing: "0.28em", color: C.muted, textTransform: "uppercase" }}>
        digitalbluefoam.com
      </div>

      <SceneFade fadeInDur={20} fadeOutDur={18} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — What We Build (600 frames = 20 s)
//   Slide A (0–300):  Gen Design + Performance Analytics — side-by-side
//   Slide B (300–600): Collaborative Platform — full width
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Panel text block (used inside PortraitPanel wrapper) ─────────────────────
const PanelText: React.FC<{
  label: string;
  title: string;
  body: string;
  accentColor: string;
  f: number;
  startF?: number;
  left?: number;
  right?: number;
}> = ({ label, title, body, accentColor, f, startF = 0, left = 40, right = 40 }) => (
  <div style={{ position: "absolute", bottom: 90, left, right, opacity: fi(f, startF, 22), transform: `translateY(${su(f, startF, 22, 16)}px)` }}>
    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.26em", color: accentColor, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
    <div style={{ fontFamily: inter, fontSize: 30, fontWeight: 800, color: C.white, lineHeight: 1.1, marginBottom: 12 }}>{title}</div>
    <div style={{ fontFamily: inter, fontSize: 17, fontWeight: 300, color: C.muted, lineHeight: 1.55 }}>{body}</div>
  </div>
);

// ─── Slide A: Split-screen (Gen Design left, Analytics right) ─────────────────
const Scene2SlideA: React.FC = () => {
  const f = useCurrentFrame();
  const PW = 960; // panel width

  const panels = [
    {
      src: V.gen,
      left: 0,
      accentColor: C.cyan,
      label: "Generative Design",
      title: "Form from Constraints",
      body: "AI creates building massing from site rules — thousands of layout variants in minutes.",
    },
    {
      src: V.city,
      left: PW,
      accentColor: C.lightBlue,
      label: "Performance Analytics",
      title: "Live Urban KPIs",
      body: "Walkability, density, green space, solar access — computed in real time as you design.",
    },
  ];

  return (
    <>
      {/* Section tag sits across both panels */}
      <MonoTag text="What We Build" f={f} startF={8} />

      {panels.map((p) => (
        <React.Fragment key={p.label}>
          {/* Full portrait video in panel — no crop */}
          <PortraitPanel src={p.src} left={p.left} width={PW} />

          {/* Bottom gradient over that panel */}
          <div style={{ position: "absolute", left: p.left, bottom: 0, width: PW, height: 400, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.93))", pointerEvents: "none" }} />

          {/* Accent top bar */}
          <div style={{ position: "absolute", top: 0, left: p.left, width: PW, height: 3, background: p.accentColor, opacity: fi(f, 20, 22) }} />

          {/* Text */}
          <div style={{ position: "absolute", left: p.left, top: 0, width: PW, height: 1080 }}>
            <PanelText label={p.label} title={p.title} body={p.body} accentColor={p.accentColor} f={f} startF={22} />
          </div>
        </React.Fragment>
      ))}

      {/* Centre divider */}
      <div style={{ position: "absolute", left: PW - 1, top: 0, width: 1, height: 1080, background: `${C.blue}35`, pointerEvents: "none" }} />

      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

// ─── Slide B: Collaborative Platform full-width ───────────────────────────────
const Scene2SlideB: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <PortraitBG src={V.collab} overlayOpacity={0.50} />
      <Grid opacity={0.06} />
      <MonoTag text="What We Build" f={f} startF={8} />
      <H1 text="Collaborative Platform" f={f} startF={20} top={370} />
      <BodyText text="Cloud-synced project workspaces — real-time multi-user editing, scenario comparison, and shareable analysis reports." f={f} startF={48} top={468} />
      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

const Scene2: React.FC = () => (
  <>
    <Sequence from={0}   durationInFrames={240}><Scene2SlideA /></Sequence>
    <Sequence from={240} durationInFrames={150}><Scene2SlideB /></Sequence>
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — Past Work & Partners (450 frames = 15 s)
// ═══════════════════════════════════════════════════════════════════════════════
const Scene3Mass: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <DemoBG src={V.mass} overlayOpacity={0.28} />
      <Grid opacity={0.07} />
      <Scan opacity={0.13} />
      <MonoTag text="Our Work & Partners" f={f} startF={8} />
      <H1 text="DBFMass" f={f} startF={20} top={370} fontSize={90} />
      <BodyText text="3D generative massing — turn zoning rules into buildable form at urban scale." f={f} startF={48} top={474} />
      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

const Scene3Plot: React.FC = () => {
  const f = useCurrentFrame();
  const partners = ["Emaar", "AECOM", "Dubai Municipality", "Singapore URA", "Neom"];
  return (
    <>
      <DemoBG src={V.plot} overlayOpacity={0.28} />
      <Grid opacity={0.07} />
      <MonoTag text="Our Work & Partners" f={f} startF={8} />
      <H1 text="DBFPlot" f={f} startF={20} top={370} fontSize={90} />
      <BodyText text="Site analysis platform — plot constraints, FAR calculations, zoning compliance, export-ready." f={f} startF={48} top={474} />
      {/* Partner strip */}
      <div style={{ position: "absolute", bottom: 108, left: 120, display: "flex", alignItems: "center", gap: 32, opacity: fi(f, 62, 20) }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.22em", color: C.muted, textTransform: "uppercase" }}>Partners</div>
        {partners.map((p, i) => (
          <div key={p} style={{ fontFamily: inter, fontSize: 15, fontWeight: 600, color: C.white, letterSpacing: "0.08em", textTransform: "uppercase", opacity: fi(f, 72 + i * 12, 14) }}>{p}</div>
        ))}
      </div>
      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

const Scene3: React.FC = () => (
  <>
    <Sequence from={0}   durationInFrames={225}><Scene3Mass /></Sequence>
    <Sequence from={225} durationInFrames={200}><Scene3Plot /></Sequence>
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — Dubai Municipality (600 frames = 20 s, ref 0–20 s)
//
// Text fades OUT at frame 180 so the reference video plays clean for the
// second half of the scene — no overlap with the video's own UI/labels.
// ═══════════════════════════════════════════════════════════════════════════════
const Scene4: React.FC = () => {
  const f = useCurrentFrame();

  // Text is visible only in the first ~6 s (0–180 frames), then fades out
  const tagOp  = fifo(f,  24, 175, 20, 22);
  const h1Op   = fifo(f,  50, 180, 25, 25);
  const bodyOp = fifo(f,  90, 175, 22, 22);

  return (
    <>
      {/* Reference video from 0 s */}
      <LandscapeBG src={REF} startFrom={0} overlayOpacity={0.46} />

      {/* HUD grid lines */}
      <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0, opacity: 0.12 }}>
        <line x1={0}    y1={375}  x2={1920} y2={375}  stroke={C.cyan} strokeWidth={0.5} strokeDasharray="9 5" />
        <line x1={0}    y1={705}  x2={1920} y2={705}  stroke={C.cyan} strokeWidth={0.5} strokeDasharray="9 5" />
        <line x1={280}  y1={0}    x2={280}  y2={1080} stroke={C.cyan} strokeWidth={0.5} strokeDasharray="9 5" />
        <line x1={1640} y1={0}    x2={1640} y2={1080} stroke={C.cyan} strokeWidth={0.5} strokeDasharray="9 5" />
      </svg>

      {/* Section tag — fades out */}
      <div style={{ position: "absolute", top: 76, left: 120, opacity: tagOp, transform: `translateY(${su(f, 24, 20)}px)`, display: "flex", alignItems: "center", gap: 10, fontFamily: mono, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: C.cyan }}>
        <div style={{ width: 28, height: 1, background: C.cyan }} />
        Current Project
      </div>

      {/* Main headline — fades out */}
      <div style={{ position: "absolute", top: 340, left: 120, opacity: h1Op, transform: `translateY(${su(f, 50, 28, 28)}px)`, fontFamily: inter, fontSize: 76, fontWeight: 900, color: C.white, letterSpacing: "-2px", lineHeight: 1.05 }}>
        Dubai Municipality
        <br />
        <span style={{ color: C.blue }}>× Digital Blue Foam</span>
      </div>

      {/* Body — fades out */}
      <div style={{ position: "absolute", top: 530, left: 120, opacity: bodyOp, fontFamily: inter, fontSize: 22, fontWeight: 300, color: C.muted, lineHeight: 1.55, maxWidth: 760 }}>
        AI-driven urban masterplanning — turning raw municipal data into generative city plans.
      </div>

      {/* Logo always visible */}
      <Logo opacity={0.75} />
      <SceneFade fadeInDur={20} fadeOutDur={18} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — Project Deep Dive (1560 frames = 52 s, 4 × 390 frames = 13 s)
//   ref timestamps (30fps composition):
//   A → ref 20–33 s : startFrom 600
//   B → ref 33–46 s : startFrom 990
//   C → ref 46–59 s : startFrom 1380
//   D → ref 59–72 s : startFrom 1770
// ═══════════════════════════════════════════════════════════════════════════════
const Scene5A: React.FC = () => {
  const f = useCurrentFrame();
  const kpis = [
    { label: "Population Density", value: "12,400", unit: "/km²",  color: C.cyan },
    { label: "Road Connectivity",  value: "0.87",   unit: "index", color: C.green },
    { label: "Green Space Ratio",  value: "18.4%",  unit: "area",  color: C.green },
    { label: "Transit Score",      value: "76",      unit: "/ 100", color: C.lightBlue },
  ];
  return (
    <>
      <LandscapeBG src={REF} startFrom={600} overlayOpacity={0.55} />
      <Grid opacity={0.10} />
      <Scan opacity={0.20} />
      <DTitle num="01 / KPI FRAMEWORK" title="Data Processing & Urban Metrics" f={f} startF={8} />
      <div style={{ position: "absolute", bottom: 110, left: 120, display: "flex", gap: 20 }}>
        {kpis.map((m, i) => <KPICard key={m.label} {...m} f={f} startF={22 + i * 15} />)}
      </div>
      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

const Scene5B: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <LandscapeBG src={REF} startFrom={1050} overlayOpacity={0.50} />
      <Grid opacity={0.07} />
      <DTitle num="02 / GENERATIVE PLANNING" title="AI-Driven Urban Layout Generation" f={f} startF={8} />
      <BotLabel text="Generative Urban Planning" f={f} startF={28} />
      <div style={{ position: "absolute", bottom: 108, right: 120, opacity: fi(f, 48, 18), fontFamily: mono, fontSize: 13, letterSpacing: "0.2em", color: C.muted }}>
        From parameters to masterplan in minutes
      </div>
      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

const Scene5C: React.FC = () => {
  const f = useCurrentFrame();
  const isoProgress = clamp((f - 48) / 200, 0, 1);
  return (
    <>
      <LandscapeBG src={REF} startFrom={1500} overlayOpacity={0.52} />
      <DTitle num="03 / 20-MINUTE CITY" title="Proximity Scoring & Isochrone Analysis" f={f} startF={8} />
      <IsoRings cx={960} cy={590} progress={isoProgress} />
      <BotLabel text="20-Minute City Scoring" f={f} startF={28} />
      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

const Scene5D: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <LandscapeBG src={REF} startFrom={1950} overlayOpacity={0.46} />
      <Grid opacity={0.06} />
      <DTitle num="04 / INTERACTIVE TECH" title="Real-Time Planning Interface" f={f} startF={8} />
      <BotLabel text="Interactive Technology Development" f={f} startF={28} />
      <Logo />
      <SceneFade fadeInDur={16} fadeOutDur={16} />
    </>
  );
};

const Scene5: React.FC = () => {
  // 1795 total frames → 449 + 449 + 449 + 448
  const CD = 449;
  return (
    <>
      <Sequence from={0}      durationInFrames={CD}><Scene5A /></Sequence>
      <Sequence from={CD}     durationInFrames={CD}><Scene5B /></Sequence>
      <Sequence from={CD * 2} durationInFrames={CD}><Scene5C /></Sequence>
      <Sequence from={CD * 3} durationInFrames={448}><Scene5D /></Sequence>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — Welcome Outro (150 frames = 5 s)
// ═══════════════════════════════════════════════════════════════════════════════
const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const bgOp = clamp(f / 20, 0, 1);
  return (
    <>
      <AbsoluteFill style={{ background: C.black, opacity: bgOp }} />
      <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 1100, height: 600, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.blue}1E 0%, transparent 72%)`, opacity: bgOp }} />
      <Grid opacity={0.055 * bgOp} />

      <div style={{ position: "absolute", top: "40%", left: "50%", transform: `translate(-50%, calc(-50% + ${su(f, 36, 30, 28)}px))`, opacity: fi(f, 36, 28), fontFamily: inter, fontSize: 88, fontWeight: 900, color: C.white, letterSpacing: "-3px", lineHeight: 1, textAlign: "center", whiteSpace: "nowrap" }}>
        Welcome to the Team.
      </div>

      <div style={{ position: "absolute", top: "55%", left: "50%", transform: `translate(-50%, calc(-50% + ${su(f, 88, 22, 14)}px))`, opacity: fi(f, 88, 22), fontFamily: inter, fontSize: 26, fontWeight: 300, fontStyle: "italic", color: C.lightBlue, letterSpacing: "0.015em", textAlign: "center", whiteSpace: "nowrap" }}>
        Let's build the cities of tomorrow.
      </div>

      <div style={{ position: "absolute", bottom: "18%", left: "50%", transform: "translateX(-50%)", opacity: fi(f, 108, 20) }}>
        <Img src={A.logo} style={{ height: 48, width: "auto" }} />
      </div>

      {/* SceneFade with no fade-out (video ends) */}
      <SceneFade fadeInDur={20} fadeOutDur={0} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export const DBFWelcomeVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>
    <Sequence from={S.intro.start}    durationInFrames={S.intro.end    - S.intro.start}>    <Scene1 /></Sequence>
    <Sequence from={S.build.start}    durationInFrames={S.build.end    - S.build.start}>    <Scene2 /></Sequence>
    <Sequence from={S.partners.start} durationInFrames={S.partners.end - S.partners.start}> <Scene3 /></Sequence>
    <Sequence from={S.dubai.start}    durationInFrames={S.dubai.end    - S.dubai.start}>    <Scene4 /></Sequence>
    <Sequence from={S.deepdive.start} durationInFrames={S.deepdive.end - S.deepdive.start}> <Scene5 /></Sequence>
    <Sequence from={S.outro.start}    durationInFrames={S.outro.end    - S.outro.start}>    <Scene6 /></Sequence>
  </AbsoluteFill>
);
