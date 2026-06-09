/**
 * ThesisNewsNode — Miro-board camera, one article at a time, zoomed close.
 * Virtual canvas: 5800×900 px. Camera zoom Z=3 (1 screen = 640×360 canvas px).
 * Background: overlapping newspaper collage. FX: grain, dust, weave, smoke vignette.
 * 1920×1080 · 30fps · 38s (1140 frames)
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";

loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });

// ─── Assets ────────────────────────────────────────────────────────────────────
const A = {
  p1958:     staticFile("references/Thesis/paper 2.jpg"),
  p1988:     staticFile("references/Thesis/paper 3.jpg"),
  editorial: staticFile("references/Thesis/paper 1.jpg"),
  p4:        staticFile("references/Thesis/Paper 4.png"),
  p51:       staticFile("references/Thesis/Paper 5 (1).png"),
  p52:       staticFile("references/Thesis/Paper 5 (2).png"),
  p53:       staticFile("references/Thesis/Paper 5 (3).png"),
  p54:       staticFile("references/Thesis/Paper 5 (4).png"),
};

// ─── Canvas & camera constants ────────────────────────────────────────────────
const Z     = 3.0;   // zoom — 1 viewport px = 1/Z canvas px
const CW    = 5800;  // virtual canvas width
const CH    = 900;   // virtual canvas height
const VW    = 1920 / Z; // visible canvas width  = 640
const HOLD  = 90;    // frames parked on each card (3 s)
const TRANS = 60;    // frames per pan transition (2 s)

// Card arrival frame: card i first appears at frame i*(HOLD+TRANS)
const af = (i: number) => i * (HOLD + TRANS);

// ─── Card definitions ─────────────────────────────────────────────────────────
// cx/cy = card centre on canvas. cy=295 keeps headlines in the upper half
// of the 360 px tall visible window. Cards are spaced 700 px apart.
interface CardDef {
  src: string; cx: number; cy: number; w: number; rot: number;
  revealFrame: number; scan?: boolean; scanStart?: number;
}

const CARDS: CardDef[] = [
  { src: A.p1958,     cx: 390,  cy: 295, w: 450, rot: -2.8, revealFrame: 0,        scan: true,  scanStart: 20  },
  { src: A.p1988,     cx: 1090, cy: 295, w: 430, rot:  2.0, revealFrame: af(1)-25, scan: true,  scanStart: af(1)+20 },
  { src: A.editorial, cx: 1790, cy: 295, w: 420, rot: -1.5, revealFrame: af(2)-25, scan: true,  scanStart: af(2)+20 },
  { src: A.p51,       cx: 2490, cy: 295, w: 430, rot:  2.5, revealFrame: af(3)-25, scan: false },
  { src: A.p54,       cx: 3190, cy: 295, w: 410, rot: -2.2, revealFrame: af(4)-25, scan: false },
  { src: A.p4,        cx: 3890, cy: 295, w: 420, rot:  1.0, revealFrame: af(5)-25, scan: false },
  { src: A.p53,       cx: 4590, cy: 295, w: 425, rot:  2.8, revealFrame: af(6)-25, scan: false },
  { src: A.p52,       cx: 5290, cy: 295, w: 410, rot: -1.5, revealFrame: af(7)-25, scan: false },
];

// ─── Background newspaper collage ────────────────────────────────────────────
// Large raw newspaper images spread across the full canvas width, overlapping.
// Rendered behind the polaroid cards (z-index 1-10) at low opacity.
interface BgDef { src: string; cx: number; cy: number; w: number; rot: number; op: number; }

const BG: BgDef[] = [
  { src: A.p1958,     cx: 270,  cy: 200, w: 880, rot: -3.2, op: 0.28 },
  { src: A.p1988,     cx: 940,  cy: 260, w: 850, rot:  2.6, op: 0.26 },
  { src: A.editorial, cx: 1610, cy: 190, w: 870, rot: -1.8, op: 0.27 },
  { src: A.p51,       cx: 2280, cy: 245, w: 840, rot:  3.0, op: 0.25 },
  { src: A.p4,        cx: 2960, cy: 200, w: 860, rot: -2.5, op: 0.26 },
  { src: A.p54,       cx: 3640, cy: 255, w: 835, rot:  1.6, op: 0.27 },
  { src: A.p52,       cx: 4310, cy: 205, w: 865, rot: -3.0, op: 0.25 },
  { src: A.p53,       cx: 4990, cy: 248, w: 845, rot:  2.5, op: 0.26 },
  { src: A.p52,       cx: 5670, cy: 200, w: 855, rot: -1.5, op: 0.27 },
];

// ─── Camera path ──────────────────────────────────────────────────────────────
// For each card i the camera parks at (camX, camY) for HOLD frames then
// glides to card i+1 over TRANS frames using easeInOut.
type Vec2 = { x: number; y: number };
type WayPoint = { f: number; x: number; y: number };

// Camera top-left in canvas space when centred on card i
const camStop = (card: CardDef): Vec2 => ({
  x: Math.max(0, card.cx - VW / 2),
  y: Math.max(0, card.cy - card.w * 0.5 - 25),
});

// Two waypoints per card: arrival and departure (same position = hold)
const WAYPOINTS: WayPoint[] = CARDS.flatMap((card, i) => {
  const { x, y } = camStop(card);
  return [
    { f: af(i),        x, y },
    { f: af(i) + HOLD, x, y },
  ];
});

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const getCamPos = (frame: number): Vec2 => {
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const w0 = WAYPOINTS[i], w1 = WAYPOINTS[i + 1];
    if (frame >= w0.f && frame <= w1.f) {
      const t = easeInOut((frame - w0.f) / (w1.f - w0.f));
      return { x: w0.x + (w1.x - w0.x) * t, y: w0.y + (w1.y - w0.y) * t };
    }
  }
  const last = WAYPOINTS[WAYPOINTS.length - 1];
  return { x: last.x, y: last.y };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const frand = (s: number) => { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); };

// ─── Color grade ─────────────────────────────────────────────────────────────
const ColorGrade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "grayscale(1) sepia(0.18) contrast(0.88) brightness(1.06)" }}>
    {children}
  </AbsoluteFill>
);

// ─── Gate weave ───────────────────────────────────────────────────────────────
const GateWeave: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      transform: `translate(${(frand(frame * 31 + 7) - 0.5) * 2.2}px,${(frand(frame * 47 + 13) - 0.5) * 1.6}px)`,
    }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── Film grain ───────────────────────────────────────────────────────────────
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const id = `gnn${frame}`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.18, zIndex: 100 }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        <defs>
          <filter id={id}>
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="3" seed={frame} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="1920" height="1080" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Film dust ────────────────────────────────────────────────────────────────
const FilmDust: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: 5 }, (_, i) => ({
    x: frand(frame * 97 + i * 43) * 1920,
    y: frand(frame * 113 + i * 61) * 1080,
    r: frand(frame * 57 + i * 29) * 2.2 + 0.4,
  }));
  const sc = frame % 11 === 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="white" opacity={0.28} />)}
        {sc && <line x1={frand(frame * 67) * 1400} y1={frand(frame * 89 + 5) * 1080}
          x2={frand(frame * 67) * 1400 + frand(frame * 31 + 11) * 280 + 80}
          y2={frand(frame * 89 + 5) * 1080}
          stroke="white" strokeWidth={frand(frame) * 0.7 + 0.2} opacity={0.18} />}
      </svg>
    </AbsoluteFill>
  );
};

// ─── Luminance flicker ────────────────────────────────────────────────────────
const Flicker: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame % 23 >= 2) return null;
  return <AbsoluteFill style={{ pointerEvents: "none", background: "rgba(250,247,242,0.045)", zIndex: 95, mixBlendMode: "screen" }} />;
};

// ─── Smoke / cloud vignette ───────────────────────────────────────────────────
const SmokeVignette: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = Math.sin(frame * 0.007) * 22;
  const s2 = Math.cos(frame * 0.009) * 18;
  const s3 = Math.sin(frame * 0.005 + 1.4) * 28;
  const s4 = Math.cos(frame * 0.006 + 0.8) * 20;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 60 }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        <defs>
          <filter id="sf-smoke" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="52" />
          </filter>
        </defs>
        <g filter="url(#sf-smoke)">
          <ellipse cx={175 + s1} cy={125 + s2}  rx={395} ry={292} fill="rgba(238,231,218,0.72)" />
          <ellipse cx={1745 - s2} cy={105 + s1}  rx={375} ry={278} fill="rgba(235,228,215,0.68)" />
          <ellipse cx={155 + s3} cy={975 + s2}   rx={385} ry={285} fill="rgba(237,230,217,0.70)" />
          <ellipse cx={1765 + s4} cy={955 - s1}  rx={368} ry={275} fill="rgba(234,227,214,0.68)" />
          <ellipse cx={960 + s2}  cy={50 + s3 * 0.5}   rx={590} ry={188} fill="rgba(237,230,216,0.52)" />
          <ellipse cx={960 - s3}  cy={1035 + s4 * 0.5} rx={610} ry={182} fill="rgba(235,228,215,0.52)" />
          <ellipse cx={42 + s4}   cy={540 + s1}  rx={200} ry={385} fill="rgba(236,229,216,0.56)" />
          <ellipse cx={1878 - s1} cy={540 - s2}  rx={195} ry={375} fill="rgba(234,227,214,0.53)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ─── CV bounding box ──────────────────────────────────────────────────────────
// Drawn in canvas coordinate space (inside the canvas SVG).
interface CVBoxProps { x: number; y: number; w: number; h: number; label: string; conf: number; sf: number; }
const CVBox: React.FC<CVBoxProps> = ({ x, y, w, h, label, conf, sf }) => {
  const frame = useCurrentFrame();
  const lf = frame - sf;
  if (lf < 0) return null;
  const perim = 2 * (w + h);
  const eOut = (t: number) => 1 - (1 - t) * (1 - t);
  const dash  = perim * (1 - eOut(clamp(lf / 22, 0, 1)));
  const bOp   = 0.62 + Math.sin(lf * 0.22) * 0.14;
  const lblOp = clamp((lf - 28) / 12, 0, 1);
  const ticks: [number, number, number, number][] = [
    [x,   y,   1,  1], [x+w, y,   -1,  1],
    [x,   y+h, 1, -1], [x+w, y+h, -1, -1],
  ];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#00E87A" strokeWidth={1.8}
        strokeDasharray={perim} strokeDashoffset={dash} opacity={bOp} rx={1} />
      {clamp(lf / 22, 0, 1) > 0.5 && ticks.map(([tx, ty, sx, sy], i) => (
        <g key={i}>
          <line x1={tx} y1={ty} x2={tx + sx * 10} y2={ty} stroke="#00E87A" strokeWidth={2.5} />
          <line x1={tx} y1={ty} x2={tx} y2={ty + sy * 10} stroke="#00E87A" strokeWidth={2.5} />
        </g>
      ))}
      {lblOp > 0 && (
        <g opacity={lblOp}>
          <rect x={x} y={y-18} width={label.length * 6.8 + 52} height={16} rx={2} fill="#00E87A" fillOpacity={0.90} />
          <text x={x+4} y={y-5} fill="#000" fontSize={9} fontFamily="monospace" fontWeight="600">
            {label} {Math.round(conf * 100)}%
          </text>
        </g>
      )}
    </g>
  );
};

// ─── Canvas CV scanner ────────────────────────────────────────────────────────
const CanvasCVScanner: React.FC<{ cx: number; cy: number; w: number; sf: number }> = ({ cx, cy, w, sf }) => {
  const frame = useCurrentFrame();
  if (frame < sf) return null;
  const bw = w * 0.04;
  const imgX = cx - w / 2 + bw, imgY = cy - w * 0.5 + bw;
  const iw = w - bw * 2, estH = w * 1.3;
  const scanY = imgY + estH * clamp((frame - sf) / 70, 0, 1);
  return (
    <svg width={CW} height={CH} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 30 }}>
      {frame - sf < 75 && <line x1={imgX} y1={scanY} x2={imgX + iw} y2={scanY} stroke="#00E87A" strokeWidth={1} opacity={0.42} />}
      <CVBox x={imgX + iw*0.02} y={imgY + estH*0.03} w={iw*0.90} h={estH*0.09} label="MASTHEAD" conf={0.98} sf={sf+5}  />
      <CVBox x={imgX + iw*0.02} y={imgY + estH*0.15} w={iw*0.76} h={estH*0.12} label="HEADLINE" conf={0.95} sf={sf+22} />
      <CVBox x={imgX + iw*0.02} y={imgY + estH*0.30} w={iw*0.54} h={estH*0.08} label="SUBHEAD"  conf={0.90} sf={sf+38} />
      <CVBox x={imgX + iw*0.02} y={imgY + estH*0.41} w={iw*0.48} h={estH*0.34} label="BODY"     conf={0.85} sf={sf+55} />
    </svg>
  );
};

// ─── Background collage ───────────────────────────────────────────────────────
// Raw newspaper images at large scale, overlapping, behind the polaroid cards.
const NewsBgCollage: React.FC = () => (
  <>
    {BG.map((bg, i) => (
      <div key={i} style={{
        position: "absolute",
        left: bg.cx - bg.w / 2,
        top:  bg.cy - bg.w * 0.5,
        width: bg.w,
        opacity: bg.op,
        transform: `rotate(${bg.rot}deg)`,
        transformOrigin: "center center",
        zIndex: i + 1,
      }}>
        <Img src={bg.src} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
    ))}
  </>
);

// ─── Polaroid news card ───────────────────────────────────────────────────────
const NewsCard: React.FC<CardDef & { zi: number }> = ({ src, cx, cy, w, rot, revealFrame, zi }) => {
  const frame = useCurrentFrame();
  const bw = w * 0.04, bBot = w * 0.10;
  const opacity = interpolate(frame, [revealFrame, revealFrame + 35], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad),
  });
  const scaleIn = interpolate(frame, [revealFrame, revealFrame + 50], [0.93, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.1)),
  });
  return (
    <div style={{
      position: "absolute",
      left: cx - w / 2, top: cy - w * 0.5,
      width: w, opacity,
      transform: `scale(${scaleIn}) rotate(${rot}deg)`,
      transformOrigin: "center center",
      zIndex: zi,
      background: "#FAF7F2",
      boxShadow: "4px 8px 36px rgba(0,0,0,0.58), 2px 3px 8px rgba(0,0,0,0.35)",
      borderRadius: 2,
    }}>
      <div style={{ padding: `${bw}px ${bw}px 0 ${bw}px` }}>
        <Img src={src} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <div style={{ height: bBot }} />
    </div>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const ThesisNewsNode: React.FC = () => {
  const frame = useCurrentFrame();
  const { x: camX, y: camY } = getCamPos(frame);

  return (
    <ColorGrade>
      <GateWeave>
        {/* Parchment base — always visible behind everything */}
        <AbsoluteFill style={{ background: "#E8E0CE" }} />

        {/* Viewport clip guard */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/*
           * Canvas container.
           * Transform: scale(Z) is applied AFTER translate (CSS right-to-left),
           * with transformOrigin "0 0" so canvas point (camX, camY) maps to
           * viewport (0, 0), and (camX + VW, camY + VH) maps to (1920, 1080).
           */}
          <div style={{
            position: "absolute", left: 0, top: 0,
            width: CW, height: CH,
            transform: `scale(${Z}) translate(${-camX}px, ${-camY}px)`,
            transformOrigin: "0 0",
          }}>
            {/* Layer 0: newspaper background collage */}
            <NewsBgCollage />

            {/* Layer 1: polaroid cards */}
            {CARDS.map((card, i) => (
              <NewsCard key={i} {...card} zi={i + 12} />
            ))}

            {/* CV scanners for print-era cards */}
            {CARDS.filter((c) => c.scan && c.scanStart != null).map((card, i) => (
              <CanvasCVScanner key={i} cx={card.cx} cy={card.cy} w={card.w} sf={card.scanStart!} />
            ))}
          </div>
        </div>

        {/* Viewport-fixed overlays */}
        <SmokeVignette />
        <Grain />
        <FilmDust />
        <Flicker />
      </GateWeave>
    </ColorGrade>
  );
};
