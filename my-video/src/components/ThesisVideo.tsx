/**
 * ThesisVideo — Vintage Documentary Archive
 * All 9 newspaper clips fly in from camera (large → small) and stay on screen.
 * No intro title, no outro text, overlapping is intentional.
 * 1920×1080 · 30fps · 30s (900 frames)
 *
 * Motion principle: each card starts at screen centre at 4.5× scale (as if
 * directly in front of the camera lens), then translates and scales down to its
 * resting position simultaneously — giving the "thrown away from camera" feel.
 * Cards accumulate; nothing ever disappears.
 */

import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";

loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

// ─── Assets ───────────────────────────────────────────────────────────────────
const A = {
  p1958:     staticFile("references/Thesis/paper 2.jpg"),
  p1988:     staticFile("references/Thesis/paper 3.jpg"),
  editorial: staticFile("references/Thesis/paper 1.jpg"),
  p4:        staticFile("references/Thesis/Paper 4.png"),
  p51:       staticFile("references/Thesis/Paper 5 (1).png"),
  p52:       staticFile("references/Thesis/Paper 5 (2).png"),
  p53:       staticFile("references/Thesis/Paper 5 (3).png"),
  p54:       staticFile("references/Thesis/Paper 5 (4).png"),
  p55:       staticFile("references/Thesis/Paper 5 (5).png"),
};

// ─── Card layout ──────────────────────────────────────────────────────────────
// cx / cy = approximate visual centre of the card at rest (1920×1080 space)
// w      = card width (image height is natural / uncropped)
// rot    = final tilt in degrees (animates from 0 during fly-in)
// enter  = global frame when this card begins its fly-in
// scan   = show CV bounding-box scanner after landing
interface CardDef {
  src: string;
  cx: number;
  cy: number;
  w: number;
  rot: number;
  enter: number;
  scan?: boolean;
}

const CARDS: CardDef[] = [
  { src: A.p1958,     cx: 295,  cy: 375, w: 490, rot: -3.0, enter: 0,   scan: true  },
  { src: A.p1988,     cx: 870,  cy: 355, w: 465, rot:  2.2, enter: 45,  scan: true  },
  { src: A.editorial, cx: 1535, cy: 395, w: 435, rot: -1.8, enter: 90,  scan: true  },
  { src: A.p51,       cx: 210,  cy: 730, w: 445, rot:  3.5, enter: 135, scan: false },
  { src: A.p54,       cx: 680,  cy: 750, w: 405, rot: -2.5, enter: 180, scan: false },
  { src: A.p4,        cx: 960,  cy: 545, w: 445, rot:  0.8, enter: 225, scan: false },
  { src: A.p55,       cx: 1265, cy: 745, w: 415, rot:  2.0, enter: 270, scan: false },
  { src: A.p53,       cx: 1640, cy: 715, w: 425, rot: -3.2, enter: 315, scan: false },
  { src: A.p52,       cx: 1795, cy: 865, w: 385, rot:  1.5, enter: 360, scan: false },
];

const FLY_FRAMES = 60; // duration of the fly-in per card

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Deterministic pseudo-random — Math.random() is forbidden in Remotion
const frand = (seed: number): number => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

// ─── Global colour grade ──────────────────────────────────────────────────────
// Desaturate → warm sepia tint → lifted blacks
const ColorGrade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "grayscale(1) sepia(0.18) contrast(0.88) brightness(1.06)" }}>
    {children}
  </AbsoluteFill>
);

// ─── Gate weave ───────────────────────────────────────────────────────────────
// 1–2 px deterministic random jitter per frame — mimics unstable film projection
const GateWeave: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const jx = (frand(frame * 31 + 7) - 0.5) * 2.2;
  const jy = (frand(frame * 47 + 13) - 0.5) * 1.6;
  return (
    <AbsoluteFill style={{ transform: `translate(${jx}px,${jy}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── Film grain ───────────────────────────────────────────────────────────────
// Different SVG turbulence seed each frame = animated grain
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const id = `gr${frame}`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.20, zIndex: 100 }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        <defs>
          <filter id={id}>
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="3"
              seed={frame} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="1920" height="1080" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Film dust & scratches ────────────────────────────────────────────────────
const FilmDust: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: 5 }, (_, i) => ({
    x: frand(frame * 97 + i * 43) * 1920,
    y: frand(frame * 113 + i * 61) * 1080,
    r: frand(frame * 57 + i * 29) * 2.2 + 0.4,
  }));
  const showScratch = frame % 11 === 0;
  const sy = frand(frame * 89 + 5) * 1080;
  const sx = frand(frame * 67) * 1400;
  const sl = frand(frame * 31 + 11) * 280 + 80;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="white" opacity={0.28} />
        ))}
        {showScratch && (
          <line x1={sx} y1={sy} x2={sx + sl} y2={sy}
            stroke="white" strokeWidth={frand(frame) * 0.7 + 0.2} opacity={0.18} />
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ─── Luminance flicker ────────────────────────────────────────────────────────
const Flicker: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame % 23 >= 2) return null;
  return (
    <AbsoluteFill style={{
      pointerEvents: "none", background: "rgba(250,247,242,0.045)", zIndex: 95, mixBlendMode: "screen",
    }} />
  );
};

// ─── Vignette ─────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <AbsoluteFill style={{
    pointerEvents: "none",
    background: "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 38%, rgba(8,6,4,0.65) 100%)",
    zIndex: 50,
  }} />
);

// ─── Newsprint background ─────────────────────────────────────────────────────
// Warm parchment base + two vintage newspaper scans at low opacity as texture.
// px / py drive slow parallax over the video's lifetime.
const NewsprintBg: React.FC<{ px: number; py: number }> = ({ px, py }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg,#E8E0D0 0%,#D4C9B5 50%,#C8BC9E 100%)",
      }} />
      <Img src={A.p1958} style={{
        position: "absolute", left: -60 + px * 0.3, top: -40 + py * 0.3,
        width: "72%", height: "auto", opacity: 0.20,
        filter: "contrast(1.3) brightness(0.9)", transform: "rotate(-1.5deg)",
      }} />
      <Img src={A.p1988} style={{
        position: "absolute", right: -40 - px * 0.2, bottom: -60 - py * 0.2,
        width: "65%", height: "auto", opacity: 0.16,
        filter: "contrast(1.2) brightness(0.85)", transform: "rotate(0.8deg) scaleX(-1)",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(14,11,8,0.48)" }} />
    </AbsoluteFill>
  );
};

// ─── CV Bounding Box ──────────────────────────────────────────────────────────
// Single detection rectangle that draws itself in, then pulses with a label chip.
// sf = global start frame
const CVBox: React.FC<{
  x: number; y: number; w: number; h: number;
  label: string; conf: number; sf: number;
}> = ({ x, y, w, h, label, conf, sf }) => {
  const frame = useCurrentFrame();
  const lf = frame - sf;
  if (lf < 0) return null;

  const perim = 2 * (w + h);
  const drawP = clamp(lf / 22, 0, 1);
  const eOut = (t: number) => 1 - (1 - t) * (1 - t);
  const dash = perim * (1 - eOut(drawP));
  const bOp = 0.62 + Math.sin(lf * 0.22) * 0.14;
  const lblOp = clamp((lf - 28) / 12, 0, 1);

  const ticks: [number, number, number, number][] = [
    [x,     y,      1,  1],
    [x + w, y,     -1,  1],
    [x,     y + h,  1, -1],
    [x + w, y + h, -1, -1],
  ];

  return (
    <g>
      <rect x={x} y={y} width={w} height={h}
        fill="none" stroke="#00E87A" strokeWidth={1.8}
        strokeDasharray={perim} strokeDashoffset={dash}
        opacity={bOp} rx={1} />
      {drawP > 0.5 && ticks.map(([tx, ty, sx, sy], i) => (
        <g key={i}>
          <line x1={tx} y1={ty} x2={tx + sx * 10} y2={ty} stroke="#00E87A" strokeWidth={2.5} />
          <line x1={tx} y1={ty} x2={tx} y2={ty + sy * 10} stroke="#00E87A" strokeWidth={2.5} />
        </g>
      ))}
      {lblOp > 0 && (
        <g opacity={lblOp}>
          <rect x={x} y={y - 18} width={label.length * 6.8 + 52} height={16} rx={2}
            fill="#00E87A" fillOpacity={0.90} />
          <text x={x + 4} y={y - 5} fill="#000" fontSize={9} fontFamily="monospace" fontWeight="600">
            {label} {Math.round(conf * 100)}%
          </text>
        </g>
      )}
    </g>
  );
};

// ─── CV Scanner ───────────────────────────────────────────────────────────────
// Lays 4 detection boxes over a card's image area.
// cx/cy = card rest centre, w = card width, sf = global start frame.
// Cards have: border = w*0.04, image starts at card-top + border.
// Card top ≈ cy - w*0.5 (using the w*0.5 half-height estimate used in PolaroidCard).
const CVScanner: React.FC<{
  cx: number; cy: number; w: number; sf: number;
}> = ({ cx, cy, w, sf }) => {
  const frame = useCurrentFrame();
  if (frame < sf) return null;

  const bw = w * 0.04;
  const cardTop = cy - w * 0.5;
  const imgX = cx - w / 2 + bw;
  const imgY = cardTop + bw;
  const iw = w - bw * 2;
  const estH = w * 1.3; // portrait newspaper estimate

  const scanFrac = clamp((frame - sf) / 70, 0, 1);
  const scanY = imgY + estH * scanFrac;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 30 }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {frame - sf < 75 && (
          <line x1={imgX} y1={scanY} x2={imgX + iw} y2={scanY}
            stroke="#00E87A" strokeWidth={1} opacity={0.42} />
        )}
        <CVBox x={imgX + iw * 0.02} y={imgY + estH * 0.03} w={iw * 0.90} h={estH * 0.09}
          label="MASTHEAD" conf={0.98} sf={sf + 5} />
        <CVBox x={imgX + iw * 0.02} y={imgY + estH * 0.15} w={iw * 0.76} h={estH * 0.12}
          label="HEADLINE" conf={0.95} sf={sf + 22} />
        <CVBox x={imgX + iw * 0.02} y={imgY + estH * 0.30} w={iw * 0.54} h={estH * 0.08}
          label="SUBHEAD" conf={0.90} sf={sf + 38} />
        <CVBox x={imgX + iw * 0.02} y={imgY + estH * 0.41} w={iw * 0.48} h={estH * 0.34}
          label="BODY" conf={0.85} sf={sf + 55} />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Polaroid Card ────────────────────────────────────────────────────────────
// Image is displayed at its natural aspect ratio — no cropping, no fixed height.
// Fly-in: card begins at screen centre (960,540) at 4.5× scale, then translates
// and scales down simultaneously to its resting cx/cy position.
const PolaroidCard: React.FC<CardDef & { zi: number }> = ({
  src, cx, cy, w, rot, enter, zi,
}) => {
  const frame = useCurrentFrame();
  const lf = frame - enter;
  if (lf < 0) return null;

  const bw = w * 0.04;
  const bBot = w * 0.10;

  const p = clamp(lf / FLY_FRAMES, 0, 1);
  const eased = easeOutCubic(p);

  // Scale: 4.5 (close to camera) → 1 (resting distance)
  const scale = 4.5 - 3.5 * eased;

  // Translate from screen centre to resting position
  // CSS translate operates in parent (unscaled) space, so no scale correction needed.
  const tx = (960 - cx) * (1 - eased);
  const ty = (540 - cy) * (1 - eased);

  // Tilt builds up during fly-in
  const rotNow = rot * eased;

  const opacity = interpolate(lf, [0, 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute",
      // cy is the card's approximate visual centre; w*0.5 is a rough half-height estimate.
      left: cx - w / 2,
      top: cy - w * 0.5,
      width: w,
      opacity,
      // translate → scale → rotate: applied right-to-left in element space,
      // but translate moves in parent (screen) space — correct for our formula.
      transform: `translate(${tx}px,${ty}px) scale(${scale}) rotate(${rotNow}deg)`,
      transformOrigin: "center center",
      zIndex: zi,
      background: "#FAF7F2",
      boxShadow: "4px 8px 36px rgba(0,0,0,0.62), 2px 3px 8px rgba(0,0,0,0.38)",
      borderRadius: 2,
    }}>
      {/* White border top + sides */}
      <div style={{ padding: `${bw}px ${bw}px 0 ${bw}px` }}>
        {/* Full image — no overflow hidden, no fixed height = zero cropping */}
        <Img src={src} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      {/* Wider white border at bottom (classic polaroid look) */}
      <div style={{ height: bBot }} />
    </div>
  );
};

// ─── Root Composition ─────────────────────────────────────────────────────────
export const ThesisVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow background parallax drift over the full 30 s
  const px = interpolate(frame, [0, 900], [0, -20]);
  const py = interpolate(frame, [0, 900], [0, -10]);

  return (
    <ColorGrade>
      <GateWeave>
        <NewsprintBg px={px} py={py} />

        {/* All 9 cards — accumulated, never removed */}
        {CARDS.map((card, i) => (
          <PolaroidCard key={i} {...card} zi={i + 1} />
        ))}

        {/* CV scanner on the 3 archival/print-era cards */}
        {CARDS.filter(c => c.scan).map((card, i) => (
          <CVScanner
            key={i}
            cx={card.cx}
            cy={card.cy}
            w={card.w}
            sf={card.enter + FLY_FRAMES + 20}
          />
        ))}

        {/* Always-on FX stack */}
        <Grain />
        <FilmDust />
        <Flicker />
        <Vignette />
      </GateWeave>
    </ColorGrade>
  );
};
