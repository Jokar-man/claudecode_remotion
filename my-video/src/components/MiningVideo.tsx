/**
 * Digital Blue Foam — Mining Facility Generative Layout Tool
 * 2-minute feature demo · 1920×1080 · 30fps · 3600 frames
 *
 * Scene 1  0:00–0:08   (  0– 240f)  Aerial pull-in to desert mine site
 * Scene 2  0:08–0:22   (240– 660f)  Site boundary polygon draw + constraint overlays
 * Scene 3  0:22–0:38   (660–1140f)  Objective weight sliders + scoring gradient
 * Scene 4  0:38–0:55   (1140–1650f) Layout generation — 6 variant cards fan out
 * Scene 5  0:55–1:10   (1650–2100f) Hyperparameter controls + live layout reflow
 * Scene 6  1:10–1:25   (2100–2550f) Scoring dashboard + Pareto front chart
 * Scene 7  1:25–1:42   (2550–3060f) Detailed layer view + T264 swept-path animation
 * Scene 8  1:42–1:55   (3060–3450f) Export panel slide-in
 * Scene 9  1:55–2:00   (3450–3600f) Pull-back closing with score badge
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

// ─── Font ─────────────────────────────────────────────────────────────────────
const { fontFamily } = loadFont();

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  bg: "#040B16",
  bgCard: "#0A1628",
  bgPanel: "#081020E0",
  blue: "#0055FF",
  cyan: "#00C8FF",
  electricBlue: "#4A9EFF",
  teal: "#00E5C8",
  white: "#FFFFFF",
  muted: "#6B8BB0",
  faintLine: "#1A2E50",
  green: "#00E5A0",
  amber: "#FFB800",
  orange: "#FF8C00",
  red: "#FF4466",
  // Mine-specific
  sand: "#C8A96E",
  sandDark: "#8B6914",
  earth: "#5C3D11",
  dust: "#B09060",
};

// ─── Asset paths ──────────────────────────────────────────────────────────────
const A = {
  mineSite: staticFile("assets/mine-site-trucks.webp"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const useFadeInOut = (fadeIn = 20, fadeOut = 20): number => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  return interpolate(frame, [0, fadeIn, dur - fadeOut, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// ─── Shared font style ────────────────────────────────────────────────────────
const F = { fontFamily, color: C.white };

// ─── Aerial Mine Site Background ──────────────────────────────────────────────
// Simulates desert/arid satellite imagery with CSS layering
const MineSiteBg: React.FC<{
  scale?: number;
  tx?: number;
  ty?: number;
  dimness?: number;
}> = ({ scale = 1, tx = 0, ty = 0, dimness = 0.35 }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    {/* Real Vantor satellite image with Ken Burns */}
    <Img
      src={A.mineSite}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
        transformOrigin: "center center",
      }}
    />
    {/* Subtle dark vignette to keep UI readable */}
    <AbsoluteFill
      style={{
        background: `rgba(4,11,22,${dimness})`,
      }}
    />
    {/* Edge vignette */}
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 50%, rgba(4,11,22,0.55) 100%)",
      }}
    />
  </AbsoluteFill>
);

// ─── Site Boundary Polygon ────────────────────────────────────────────────────
// Traced from user's hand-drawn red boundary in public/references/Site boundary.jpg
// The reference was drawn directly on top of the satellite image.
//
// mine-site-trucks.webp (1577×848) with objectFit:cover on 1920×1080:
//   scale=1.274 → displayed 2009×1080, horizontal crop 44.5px each side
//   Vertical: full height, no crop.
//
// Exact coordinates extracted from user's Adobe Illustrator file
// (Site boundary-01.ai, viewBox="0 0 1920 1080").
// Path parsed with bezier curves sampled at t=0.25/0.5/0.75/1.
// 27 points total — do NOT simplify; every vertex matters.
const SITE_POLY = [
  { x:   32, y:  253 },  // left wall top
  { x:   32, y: 1052 },  // bottom-left
  { x: 1178, y: 1066 },  // bottom – right staircase start
  { x: 1171, y:  766 },  // staircase: step UP
  { x: 1273, y:  761 },  // staircase: step RIGHT
  { x: 1273, y:  841 },  // staircase: step DOWN
  { x: 1652, y:  847 },  // staircase: step RIGHT
  { x: 1661, y:  951 },  // staircase: step DOWN
  { x: 1793, y:  941 },  // staircase: step RIGHT
  { x: 1808, y:   37 },  // top-right corner
  { x: 1486, y:   46 },  // top edge moving left
  { x: 1299, y:  158 },  // notch right wall – diagonal down
  { x: 1128, y:  334 },  // notch right wall – continuing down
  { x: 1008, y:  291 },  // notch kink (slight upturn before curve)
  { x: 1006, y:  301 },  // bezier t=0.25
  { x:  994, y:  330 },  // bezier t=0.50
  { x:  960, y:  372 },  // bezier t=0.75
  { x:  893, y:  424 },  // bezier end (cubic)
  { x:  827, y:  467 },  // smooth bezier t=0.25
  { x:  793, y:  489 },  // smooth bezier t=0.50
  { x:  780, y:  497 },  // smooth bezier t=0.75
  { x:  778, y:  498 },  // notch bottom deepest point
  { x:  708, y:  486 },  // notch left wall – line segment
  { x:  691, y:  201 },  // notch left wall top (haul road left edge)
  { x:  241, y:  210 },  // top edge left of notch
  { x:  169, y:  305 },  // upper-left irregular terrain
  { x:  101, y:  294 },  // upper-left terrain
];

// Calculate perimeter for dash animation
const polyPerimeter = (() => {
  let p = 0;
  for (let i = 0; i < SITE_POLY.length; i++) {
    const a = SITE_POLY[i];
    const b = SITE_POLY[(i + 1) % SITE_POLY.length];
    p += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return p;
})();

const polyPoints = SITE_POLY.map((p) => `${p.x},${p.y}`).join(" ");
const polyCentroid = {
  x: SITE_POLY.reduce((s, p) => s + p.x, 0) / SITE_POLY.length,
  y: SITE_POLY.reduce((s, p) => s + p.y, 0) / SITE_POLY.length,
};

const SiteBoundary: React.FC<{
  progress: number; // 0–1 draw progress
  fillOpacity?: number;
}> = ({ progress, fillOpacity = 0 }) => {
  const drawn = clamp(progress, 0, 1);
  const dashOffset = polyPerimeter * (1 - drawn);

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Fill */}
      <polygon
        points={polyPoints}
        fill={`${C.electricBlue}${Math.round(fillOpacity * 255).toString(16).padStart(2, "0")}`}
        opacity={drawn}
      />
      {/* Boundary line drawn with dasharray animation */}
      <polygon
        points={polyPoints}
        fill="none"
        stroke={C.electricBlue}
        strokeWidth={2.5}
        strokeDasharray={polyPerimeter}
        strokeDashoffset={dashOffset}
        opacity={drawn > 0 ? 0.95 : 0}
      />
      {/* Corner nodes */}
      {SITE_POLY.map((pt, i) => {
        const nodeProgress = clamp(
          (progress - i * (1 / SITE_POLY.length)) / (1 / SITE_POLY.length),
          0,
          1,
        );
        return (
          <g key={i} opacity={nodeProgress}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={8}
              fill="none"
              stroke={C.cyan}
              strokeWidth={1.5}
              opacity={0.8}
            />
            <circle cx={pt.x} cy={pt.y} r={3} fill={C.cyan} />
          </g>
        );
      })}
    </svg>
  );
};

// ─── Charging Station Pads ────────────────────────────────────────────────────
// Charging pads placed in the organised right-section parking/fleet area
// (the rows of vehicles visible at x≈1050–1600, y≈440–820 on canvas)
const CHARGER_POSITIONS = [
  { x: 1080, y: 480, id: "CH-01" },
  { x: 1160, y: 480, id: "CH-02" },
  { x: 1240, y: 480, id: "CH-03" },
  { x: 1080, y: 555, id: "CH-04" },
  { x: 1160, y: 555, id: "CH-05" },
  { x: 1240, y: 555, id: "CH-06" },
  { x: 1080, y: 630, id: "CH-07" },
  { x: 1160, y: 630, id: "CH-08" },
  { x: 1240, y: 630, id: "CH-09" },
];

const SUBSTATION_POS = { x: 1010, y: 555 };
// Trucks enter from the haul road that curves through centre of image
const TRUCK_ENTRY = { x: 920, y: 520 };

const ChargingLayout: React.FC<{ progress: number; variant?: number }> = ({
  progress,
  variant = 0,
}) => {
  // Variant offsets — small shifts within the staging area
  const offsets = [
    { dx: 0,   dy: 0   },
    { dx: 20,  dy: -15 },
    { dx: -15, dy: 20  },
    { dx: 15,  dy: 25  },
    { dx: -20, dy: -20 },
    { dx: 25,  dy: 10  },
  ];
  const off = offsets[variant % offsets.length];

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Power grid lines from substation */}
      {CHARGER_POSITIONS.slice(0, Math.ceil(progress * 9)).map((ch, i) => (
        <line
          key={i}
          x1={SUBSTATION_POS.x + off.dx}
          y1={SUBSTATION_POS.y + off.dy}
          x2={ch.x + off.dx}
          y2={ch.y + off.dy}
          stroke={C.amber}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.4}
        />
      ))}

      {/* Substation */}
      {progress > 0.1 && (
        <g
          transform={`translate(${SUBSTATION_POS.x + off.dx - 22},${SUBSTATION_POS.y + off.dy - 22})`}
        >
          <rect
            width={44}
            height={44}
            rx={4}
            fill={`${C.amber}22`}
            stroke={C.amber}
            strokeWidth={2}
          />
          <text
            x={22}
            y={26}
            textAnchor="middle"
            fill={C.amber}
            fontSize={18}
            fontFamily={fontFamily}
          >
            ⚡
          </text>
        </g>
      )}

      {/* Charging pads */}
      {CHARGER_POSITIONS.map((ch, i) => {
        const shown =
          progress > (i / CHARGER_POSITIONS.length) * 0.7 + 0.05 ? 1 : 0;
        return (
          <g
            key={i}
            opacity={shown}
            transform={`translate(${ch.x + off.dx - 28},${ch.y + off.dy - 18})`}
          >
            <rect
              width={56}
              height={36}
              rx={3}
              fill={`${C.electricBlue}1A`}
              stroke={C.electricBlue}
              strokeWidth={1.5}
            />
            <rect
              x={4}
              y={4}
              width={48}
              height={8}
              rx={2}
              fill={`${C.cyan}33`}
            />
            <text
              x={28}
              y={28}
              textAnchor="middle"
              fill={C.muted}
              fontSize={8}
              fontFamily={fontFamily}
            >
              {ch.id}
            </text>
          </g>
        );
      })}

      {/* Haul road spur from main road into the charging grid */}
      {progress > 0.6 && (
        <path
          d={`M ${TRUCK_ENTRY.x + off.dx} ${TRUCK_ENTRY.y + off.dy} Q ${960 + off.dx} ${500 + off.dy} ${1000 + off.dx} ${520 + off.dy} L ${1060 + off.dx} ${530 + off.dy}`}
          stroke={C.sand}
          strokeWidth={14}
          fill="none"
          opacity={0.4}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

// ─── Site Functional Zones ────────────────────────────────────────────────────
// Polygon-based zones mapped to real features in mine-site-trucks.webp at
// 1920×1080.  Each zone has: points[], fill colour, border colour, label,
// and a label anchor (lx, ly).
const SITE_ZONES = [
  {
    id: "pit",
    label: "ACTIVE MINE FACE",
    subLabel: "No-entry · Blast exclusion",
    // Left section within boundary: x=32–691, y=253–1052
    points: [[32,253],[691,201],[700,490],[650,900],[32,1052]] as [number,number][],
    fill: C.red,
    border: C.red,
  },
  {
    id: "haul",
    label: "PRIMARY HAUL ROAD",
    subLabel: "Heavy vehicle corridor",
    // The notch corridor: x=691–1486, follows the curved notch shape
    points: [[691,201],[1486,46],[1299,158],[1128,334],[960,372],[778,498],[708,486]] as [number,number][],
    fill: C.amber,
    border: C.amber,
  },
  {
    id: "workshop",
    label: "WORKSHOP & MAINTENANCE",
    subLabel: "Buildings · MCC · Substation",
    // Upper-right: x=1486–1808, y=37–761
    points: [[1486,46],[1808,37],[1793,761],[1171,761]] as [number,number][],
    fill: C.electricBlue,
    border: C.electricBlue,
  },
  {
    id: "charging",
    label: "BEV CHARGING ZONE",
    subLabel: "Proposed 9 × 350 kW pads",
    // Mid-right between staircase levels: x=1171–1652, y=761–847
    points: [[1171,761],[1652,847],[1273,841],[1273,761]] as [number,number][],
    fill: C.cyan,
    border: C.cyan,
  },
  {
    id: "fleet",
    label: "FLEET STAGING",
    subLabel: "Truck parking · Pre-shift bay",
    // Lower-right staircase area: x=1652–1793, y=847–941
    points: [[1652,847],[1793,941],[1661,951],[1273,841]] as [number,number][],
    fill: C.teal,
    border: C.teal,
  },
  {
    id: "stockpile",
    label: "ORE STOCKPILE",
    subLabel: "ROM pad · Crusher feed",
    // Bottom: x=32–1178, y=900–1066
    points: [[650,900],[1178,1066],[32,1052]] as [number,number][],
    fill: C.sand,
    border: C.sandDark,
  },
];

// ─── Constraint Circles ───────────────────────────────────────────────────────
// Precise hazard markers overlaid on the zone map
const CONSTRAINT_ZONES = [
  { cx: 380,  cy: 380, r: 110, color: C.red,    label: "BLAST EXCLUSION" },  // pit centre
  { cx: 1780, cy: 290, r: 80,  color: C.orange, label: "HV SUBSTATION"   },  // top-right building
  { cx: 1100, cy: 700, r: 65,  color: C.amber,  label: "DRAINAGE SUMP"   },  // lower charging area
];

const ConstraintOverlays: React.FC<{ progress: number }> = ({ progress }) => (
  <svg
    width={1920}
    height={1080}
    style={{ position: "absolute", top: 0, left: 0 }}
  >
    {CONSTRAINT_ZONES.map((z, i) => {
      const p = clamp((progress - i * 0.25) / 0.6, 0, 1);
      const r = z.r * easeOut(p);
      return (
        <g key={i} opacity={p}>
          <circle
            cx={z.cx}
            cy={z.cy}
            r={r}
            fill={`${z.color}0D`}
            stroke={z.color}
            strokeWidth={1.5}
            strokeDasharray="8 5"
          />
          <circle cx={z.cx} cy={z.cy} r={6} fill={z.color} opacity={0.7} />
          {p > 0.5 && (() => {
            const lx = z.cx + r * 0.72 + 6;
            const ly = z.cy - 16;
            const lw = z.label.length * 7.2 + 14;
            const lo = clamp((p - 0.5) * 2, 0, 1);
            return (
              <g opacity={lo}>
                <rect x={lx - 4} y={ly - 13} width={lw} height={20} rx={3}
                  fill="rgba(4,11,22,0.82)" />
                <text x={lx} y={ly} fill={z.color} fontSize={11}
                  fontFamily={fontFamily} fontWeight="600">
                  {z.label}
                </text>
              </g>
            );
          })()}
        </g>
      );
    })}
  </svg>
);

// ─── Site Zone Overlays ───────────────────────────────────────────────────────
// Renders coloured polygon fills + labels for each functional zone.
// `progress` 0→1 staggers each zone fading in.
const SiteZones: React.FC<{ progress: number; fillAlpha?: number }> = ({
  progress,
  fillAlpha = 0.18,
}) => {
  // Label centroid: average of polygon vertices
  const centroid = (pts: [number, number][]) => ({
    x: pts.reduce((s, p) => s + p[0], 0) / pts.length,
    y: pts.reduce((s, p) => s + p[1], 0) / pts.length,
  });

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {SITE_ZONES.map((z, i) => {
        const p = clamp((progress - i * 0.14) / 0.28, 0, 1);
        if (p === 0) return null;
        const pts = z.points.map((pt) => pt.join(",")).join(" ");
        const c = centroid(z.points);
        const labelOpacity = clamp((p - 0.5) * 3, 0, 1);
        const lw = z.label.length * 7.4 + 20;
        const lh = 34;

        return (
          <g key={z.id} opacity={p}>
            {/* Filled polygon */}
            <polygon
              points={pts}
              fill={z.fill}
              fillOpacity={fillAlpha * p}
              stroke={z.border}
              strokeOpacity={0.7 * p}
              strokeWidth={1.5}
              strokeDasharray="10 6"
            />
            {/* Zone label badge */}
            {labelOpacity > 0 && (
              <g opacity={labelOpacity}>
                <rect
                  x={c.x - lw / 2}
                  y={c.y - lh / 2}
                  width={lw}
                  height={lh}
                  rx={4}
                  fill="rgba(4,11,22,0.80)"
                  stroke={z.border}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />
                <text
                  x={c.x}
                  y={c.y - 4}
                  textAnchor="middle"
                  fill={z.fill}
                  fontSize={11}
                  fontWeight="700"
                  fontFamily={fontFamily}
                  letterSpacing="0.10"
                >
                  {z.label}
                </text>
                <text
                  x={c.x}
                  y={c.y + 10}
                  textAnchor="middle"
                  fill="rgba(180,200,220,0.75)"
                  fontSize={8.5}
                  fontFamily={fontFamily}
                >
                  {z.subLabel}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── UI Panel (Glassmorphism) ─────────────────────────────────────────────────
const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  opacity?: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, title, opacity = 1, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: "rgba(8,16,32,0.88)",
      border: `1px solid ${C.faintLine}`,
      borderRadius: 8,
      overflow: "hidden",
      opacity,
      backdropFilter: "blur(12px)",
    }}
  >
    <div
      style={{
        background: `linear-gradient(90deg, ${C.blue}22, transparent)`,
        borderBottom: `1px solid ${C.faintLine}`,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 3,
          height: 14,
          background: C.electricBlue,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          ...F,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.electricBlue,
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ padding: "12px 16px" }}>{children}</div>
  </div>
);

// ─── Slider Row ────────────────────────────────────────────────────────────────
const SliderRow: React.FC<{
  label: string;
  value: number; // 0–1
  color?: string;
  unit?: string;
}> = ({ label, value, color = C.cyan, unit = "%" }) => (
  <div style={{ marginBottom: 14 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          ...F,
          fontSize: 11,
          color: C.muted,
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span style={{ ...F, fontSize: 11, color }}>
        {Math.round(value * 100)}
        {unit}
      </span>
    </div>
    <div
      style={{
        height: 4,
        background: C.faintLine,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
        }}
      />
    </div>
    <div
      style={{
        position: "relative",
        height: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${value * 100}%`,
          top: -8,
          transform: "translateX(-50%)",
          width: 12,
          height: 12,
          background: color,
          borderRadius: "50%",
          border: "2px solid #040B16",
        }}
      />
    </div>
  </div>
);

// ─── Score Gauge ──────────────────────────────────────────────────────────────
const ScoreGauge: React.FC<{ score: number; label: string; color?: string }> =
  ({ score, label, color = C.green }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <svg width={80} height={80}>
        <circle
          cx={40}
          cy={40}
          r={32}
          fill="none"
          stroke={C.faintLine}
          strokeWidth={5}
        />
        <circle
          cx={40}
          cy={40}
          r={32}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${(score / 100) * 201} 201`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text
          x={40}
          y={45}
          textAnchor="middle"
          fill={C.white}
          fontSize={18}
          fontWeight="700"
          fontFamily={fontFamily}
        >
          {score}
        </text>
      </svg>
      <span
        style={{
          ...F,
          fontSize: 10,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  );

// ─── Pareto Front Chart ───────────────────────────────────────────────────────
const PARETO_POINTS = [
  { x: 0.18, y: 0.92, active: false },
  { x: 0.28, y: 0.87, active: false },
  { x: 0.42, y: 0.79, active: true },
  { x: 0.56, y: 0.68, active: false },
  { x: 0.68, y: 0.55, active: false },
  { x: 0.79, y: 0.41, active: false },
  { x: 0.88, y: 0.24, active: false },
];

const ParetoChart: React.FC<{ progress: number }> = ({ progress }) => {
  const cw = 340,
    ch = 200;
  const pad = { l: 40, r: 20, t: 15, b: 30 };
  const iw = cw - pad.l - pad.r;
  const ih = ch - pad.t - pad.b;

  const pts = PARETO_POINTS.slice(
    0,
    Math.ceil(progress * PARETO_POINTS.length),
  );
  const lineD =
    pts.length > 1
      ? "M " +
        pts
          .map(
            (p) =>
              `${pad.l + p.x * iw} ${pad.t + (1 - p.y) * ih}`,
          )
          .join(" L ")
      : "";

  return (
    <svg
      width={cw}
      height={ch}
      style={{ display: "block", marginTop: 8 }}
    >
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <line
          key={v}
          x1={pad.l}
          y1={pad.t + v * ih}
          x2={pad.l + iw}
          y2={pad.t + v * ih}
          stroke={C.faintLine}
          strokeWidth={0.5}
        />
      ))}
      {/* Axes */}
      <line
        x1={pad.l}
        y1={pad.t}
        x2={pad.l}
        y2={pad.t + ih}
        stroke={C.muted}
        strokeWidth={1}
      />
      <line
        x1={pad.l}
        y1={pad.t + ih}
        x2={pad.l + iw}
        y2={pad.t + ih}
        stroke={C.muted}
        strokeWidth={1}
      />
      {/* Axis labels */}
      <text
        x={pad.l + iw / 2}
        y={ch - 4}
        textAnchor="middle"
        fill={C.muted}
        fontSize={9}
        fontFamily={fontFamily}
      >
        Charger Density →
      </text>
      <text
        x={12}
        y={pad.t + ih / 2}
        textAnchor="middle"
        fill={C.muted}
        fontSize={9}
        fontFamily={fontFamily}
        transform={`rotate(-90 12 ${pad.t + ih / 2})`}
      >
        Safety Score →
      </text>
      {/* Pareto front line */}
      {lineD && (
        <path
          d={lineD}
          fill="none"
          stroke={C.cyan}
          strokeWidth={2}
          strokeDasharray="4 2"
          opacity={0.7}
        />
      )}
      {/* Points */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={pad.l + p.x * iw}
            cy={pad.t + (1 - p.y) * ih}
            r={5}
            fill={p.active ? C.amber : C.electricBlue}
            stroke={p.active ? C.white : "none"}
            strokeWidth={1.5}
          />
          {p.active && (
            <circle
              cx={pad.l + p.x * iw}
              cy={pad.t + (1 - p.y) * ih}
              r={9}
              fill="none"
              stroke={C.amber}
              strokeWidth={1}
              opacity={0.6}
            />
          )}
        </g>
      ))}
    </svg>
  );
};

// ─── T264 Truck Swept Path ────────────────────────────────────────────────────
// Path follows the actual haul road visible in mine-site-trucks.webp:
//   1. Enters from top at the concave notch (~808, 97)
//   2. Curves down-left through the open-pit excavation area (~640, 380)
//   3. Swings right along the lower haul road (~780, 520)
//   4. Enters the facility / staging area (~960, 510)
//   5. Pulls into a charging bay (~1120, 500)
const TRUCK_PATH = `M 808 97 C 790 190 730 290 660 375 C 590 460 620 530 740 525 L 870 518 Q 940 512 1000 510 L 1080 505 L 1120 500`;
const TRUCK_PATH_LENGTH = 720; // approximate arc length

// Pre-sampled waypoints for truck-head dot (t=0..1 along path)
const TRUCK_WX = [0,    0.10, 0.20, 0.30, 0.40, 0.50, 0.62, 0.72, 0.82, 0.90, 1.0];
const TRUCK_PX = [808,  800,  770,  720,  670,  628,  670,  740,  870,  990, 1120];
const TRUCK_PY = [ 97,  155,  225,  295,  360,  430,  490,  526,  519,  510,  500];

const TruckPath: React.FC<{ progress: number }> = ({ progress }) => {
  const drawn = progress * TRUCK_PATH_LENGTH;

  const hx = interpolate(progress, TRUCK_WX, TRUCK_PX, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hy = interpolate(progress, TRUCK_WX, TRUCK_PY, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Path glow shadow */}
      <path
        d={TRUCK_PATH}
        fill="none"
        stroke={C.green}
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.07}
      />
      {/* Animated swept path */}
      <path
        d={TRUCK_PATH}
        fill="none"
        stroke={C.green}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={TRUCK_PATH_LENGTH}
        strokeDashoffset={TRUCK_PATH_LENGTH - drawn}
        opacity={0.85}
      />
      {/* Truck head dot — follows waypoints */}
      {progress > 0.02 && (
        <>
          {/* Outer ring */}
          <circle cx={hx} cy={hy} r={16} fill="none" stroke={C.green} strokeWidth={2} opacity={0.6} />
          {/* Inner fill */}
          <circle cx={hx} cy={hy} r={10} fill={C.green} opacity={0.95} />
          {/* Label */}
          <rect
            x={hx + 16}
            y={hy - 10}
            width={46}
            height={20}
            rx={4}
            fill="rgba(4,11,22,0.75)"
          />
          <text
            x={hx + 20}
            y={hy + 4}
            fill={C.green}
            fontSize={12}
            fontFamily={fontFamily}
            fontWeight={700}
          >
            T264
          </text>
        </>
      )}
      {/* Turning radius arc — shown mid-path where the S-bend is sharpest */}
      {progress > 0.35 && progress < 0.65 && (
        <path
          d="M 630 450 Q 620 490 640 520"
          fill="none"
          stroke={C.teal}
          strokeWidth={2}
          strokeDasharray="5 4"
          opacity={0.55}
        />
      )}
    </svg>
  );
};

// ─── Layout Variant Card ──────────────────────────────────────────────────────
const VariantCard: React.FC<{
  index: number;
  score: number;
  chargers: number;
  safety: number;
  throughput: number;
  active?: boolean;
  progress: number;
}> = ({ index, score, chargers, safety, throughput, active, progress }) => {
  const colors = [
    C.electricBlue,
    C.cyan,
    C.teal,
    C.green,
    C.amber,
    C.electricBlue,
  ];
  const color = colors[index % colors.length];
  const p = clamp((progress - index * 0.12) / 0.25, 0, 1);
  const y = lerp(40, 0, easeOutCubic(p));

  return (
    <div
      style={{
        width: 200,
        background: active ? `${color}22` : "rgba(8,16,32,0.9)",
        border: `1.5px solid ${active ? color : C.faintLine}`,
        borderRadius: 8,
        padding: "14px 14px 12px",
        opacity: p,
        transform: `translateY(${y}px)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: color,
            padding: "2px 8px",
            borderBottomLeftRadius: 6,
            fontSize: 9,
            ...F,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          BEST
        </div>
      )}
      {/* Mini layout preview */}
      <svg width={172} height={80} style={{ display: "block", marginBottom: 8 }}>
        <rect
          x={0}
          y={0}
          width={172}
          height={80}
          rx={4}
          fill={`${C.bg}CC`}
        />
        {/* Site outline mini */}
        <polygon
          points="20,10 152,8 160,60 130,72 22,70 10,42"
          fill={`${color}0A`}
          stroke={color}
          strokeWidth={1}
        />
        {/* Charger pads mini */}
        {Array.from({ length: Math.min(chargers, 9) }).map((_, j) => (
          <rect
            key={j}
            x={45 + (j % 3) * 26}
            y={22 + Math.floor(j / 3) * 16}
            width={18}
            height={10}
            rx={1}
            fill={`${C.electricBlue}55`}
            stroke={C.electricBlue}
            strokeWidth={0.5}
          />
        ))}
        {/* Haul road mini */}
        <path
          d="M 10 65 Q 32 60 40 50 L 40 30"
          stroke={C.sand}
          strokeWidth={4}
          fill="none"
          opacity={0.5}
          strokeLinecap="round"
        />
      </svg>

      <div
        style={{
          ...F,
          fontSize: 12,
          fontWeight: 700,
          color,
          marginBottom: 6,
          letterSpacing: "0.05em",
        }}
      >
        LAYOUT {String(index + 1).padStart(2, "0")}
      </div>

      {[
        { label: "Score", val: `${score}`, col: color },
        { label: "Chargers", val: `${chargers}`, col: C.white },
        { label: "Safety", val: `${safety}%`, col: C.green },
        { label: "Throughput", val: `${throughput}/h`, col: C.cyan },
      ].map(({ label, val, col }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <span style={{ ...F, fontSize: 10, color: C.muted }}>{label}</span>
          <span style={{ ...F, fontSize: 10, color: col, fontWeight: 600 }}>
            {val}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Layer Stack ──────────────────────────────────────────────────────────────
const LAYERS = [
  { label: "Satellite Base", color: C.muted, active: true },
  { label: "Site Boundary", color: C.electricBlue, active: true },
  { label: "Constraint Zones", color: C.red, active: true },
  { label: "Charger Layout", color: C.cyan, active: true },
  { label: "Power Grid", color: C.amber, active: true },
  { label: "Haul Roads", color: C.sand, active: true },
  { label: "Swept Paths", color: C.green, active: true },
];

const LayerStack: React.FC<{ progress: number }> = ({ progress }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {LAYERS.map((layer, i) => {
      const p = clamp((progress - i * 0.1) / 0.2, 0, 1);
      return (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: p,
            transform: `translateX(${lerp(20, 0, easeOut(p))}px)`,
          }}
        >
          <div
            style={{
              width: 28,
              height: 4,
              background: layer.color,
              borderRadius: 2,
              opacity: 0.8,
            }}
          />
          <span style={{ ...F, fontSize: 11, color: C.white, flex: 1 }}>
            {layer.label}
          </span>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              background: layer.active ? `${layer.color}44` : C.faintLine,
              border: `1px solid ${layer.active ? layer.color : C.faintLine}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {layer.active && (
              <div
                style={{ width: 6, height: 6, background: layer.color, borderRadius: 1 }}
              />
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── DBF Wordmark ─────────────────────────────────────────────────────────────
const DBFLogo: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top: 28,
      left: 40,
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "rgba(4,11,22,0.72)",
      padding: "8px 14px 8px 10px",
      borderRadius: 8,
      border: `1px solid ${C.faintLine}`,
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{ ...F, fontSize: 14, fontWeight: 800, letterSpacing: "-0.05em" }}
      >
        DBF
      </span>
    </div>
    <div>
      <div
        style={{
          ...F,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.05em",
          lineHeight: 1.1,
        }}
      >
        Digital Blue Foam
      </div>
      <div
        style={{
          ...F,
          fontSize: 9,
          color: C.muted,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Generative Planning
      </div>
    </div>
  </div>
);

// ─── Coordinate HUD ───────────────────────────────────────────────────────────
const CoordHud: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      bottom: 28,
      left: 40,
      opacity,
      display: "flex",
      gap: 24,
      background: "rgba(4,11,22,0.72)",
      padding: "8px 18px",
      borderRadius: 6,
      border: `1px solid ${C.faintLine}`,
    }}
  >
    {[
      { label: "LAT", val: "23°42′08″N" },
      { label: "LON", val: "58°27′33″E" },
      { label: "ALT", val: "1,240 m" },
      { label: "SITE", val: "VANTOR-ALPHA" },
    ].map(({ label, val }) => (
      <div key={label}>
        <div
          style={{ ...F, fontSize: 9, color: C.muted, letterSpacing: "0.12em" }}
        >
          {label}
        </div>
        <div
          style={{
            ...F,
            fontSize: 12,
            color: C.cyan,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {val}
        </div>
      </div>
    ))}
  </div>
);

// ─── Step Label (dark pill, used in every scene) ─────────────────────────────
const StepLabel: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      top: 26,
      left: "50%",
      transform: "translateX(-50%)",
      opacity,
      background: "rgba(4,11,22,0.78)",
      border: `1px solid ${C.faintLine}`,
      borderRadius: 20,
      padding: "6px 20px",
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        ...F,
        fontSize: 11,
        color: C.electricBlue,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  </div>
);

// ─── Scene 1: Aerial Pull-In ───────────────────────────────────────────────────
// 0–240 frames (0–8s)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // Scale from 1.3 down to 1 (pull back = zoom in)
  const scale = interpolate(frame, [0, durationInFrames], [1.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const titleProgress = interpolate(frame, [40, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleProgress = interpolate(frame, [80, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <MineSiteBg scale={scale} ty={lerp(3, 0, t)} dimness={0.5} />

      {/* Grid scan lines */}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(74,158,255,0.03) 60px, rgba(74,158,255,0.03) 61px)",
          opacity: 0.8,
        }}
      />

      <DBFLogo opacity={titleProgress} />
      <CoordHud opacity={subtitleProgress} />

      {/* Scan reticle */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, opacity: subtitleProgress * 0.7 }}
      >
        {/* Corner brackets */}
        {[
          [840, 420, 1, 1],
          [1080, 420, -1, 1],
          [840, 660, 1, -1],
          [1080, 660, -1, -1],
        ].map(([cx, cy, sx, sy], i) => (
          <g key={i} transform={`translate(${cx}, ${cy}) scale(${sx}, ${sy})`}>
            <line x1={0} y1={0} x2={28} y2={0} stroke={C.cyan} strokeWidth={2} opacity={0.7} />
            <line x1={0} y1={0} x2={0} y2={28} stroke={C.cyan} strokeWidth={2} opacity={0.7} />
          </g>
        ))}
        <circle cx={960} cy={540} r={6} fill={C.cyan} opacity={0.6} />
        <circle cx={960} cy={540} r={20} fill="none" stroke={C.cyan} strokeWidth={1} opacity={0.3} />
      </svg>

      {/* Title — dark scrim behind for legibility */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          opacity: titleProgress,
          background: "rgba(4,11,22,0.62)",
          padding: "32px 52px 36px",
          borderRadius: 16,
          border: `1px solid ${C.faintLine}`,
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            ...F,
            fontSize: 12,
            letterSpacing: "0.35em",
            color: C.cyan,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Mining Facility · BEV Charging Infrastructure
        </div>
        <div
          style={{
            ...F,
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textShadow: "0 2px 16px rgba(0,0,0,0.8)",
          }}
        >
          Generative Layout
          <br />
          <span
            style={{
              background: `linear-gradient(90deg, ${C.electricBlue}, ${C.cyan})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Optimisation Tool
          </span>
        </div>
        <div
          style={{
            ...F,
            fontSize: 15,
            color: C.muted,
            marginTop: 16,
            letterSpacing: "0.04em",
            opacity: subtitleProgress,
          }}
        >
          Automated site planning for heavy-duty BEV truck charging stations
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Site Boundary Drawing + Constraints ─────────────────────────────
// 240–660 frames (8–22s)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();
  const opacity = useFadeInOut(20, 20);

  const polyProgress = interpolate(frame, [10, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const zoneProgress = interpolate(frame, [140, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const constraintProgress = interpolate(frame, [310, 400], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panelProgress = interpolate(frame, [240, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg dimness={0.6} />

      <SiteBoundary progress={polyProgress} fillOpacity={0.06} />
      <SiteZones progress={zoneProgress} />
      <ConstraintOverlays progress={constraintProgress} />

      {/* Area label */}
      {polyProgress > 0.8 && (
        <div
          style={{
            position: "absolute",
            left: polyCentroid.x - 80,
            top: polyCentroid.y - 22,
            ...F,
            fontSize: 13,
            fontWeight: 700,
            color: C.electricBlue,
            opacity: clamp((polyProgress - 0.8) * 5, 0, 1),
            letterSpacing: "0.08em",
            background: "rgba(4,11,22,0.78)",
            padding: "5px 12px",
            borderRadius: 5,
            border: `1px solid ${C.electricBlue}55`,
          }}
        >
          ⬡ SITE AREA: 42.8 ha
        </div>
      )}

      {/* Right info panel */}
      <div
        style={{
          position: "absolute",
          right: panelProgress > 0
            ? lerp(1960, 40, easeOutCubic(panelProgress))
            : 1960,
          top: 120,
          opacity: panelProgress,
        }}
      >
        <Panel x={0} y={0} w={300} h={320} title="Site Configuration">
          {[
            { label: "Site Area", val: "42.8 ha", color: C.white },
            { label: "Elevation", val: "1,240–1,280 m", color: C.white },
            {
              label: "Blast Exclusion",
              val: "120 m radius",
              color: C.red,
            },
            {
              label: "No-Build Zone",
              val: "100 m radius",
              color: C.orange,
            },
            {
              label: "Drainage Buffer",
              val: "80 m radius",
              color: C.amber,
            },
            { label: "Buildable Area", val: "28.3 ha", color: C.green },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: `1px solid ${C.faintLine}`,
              }}
            >
              <span style={{ ...F, fontSize: 11, color: C.muted }}>{label}</span>
              <span style={{ ...F, fontSize: 11, color, fontWeight: 600 }}>
                {val}
              </span>
            </div>
          ))}
        </Panel>
      </div>

      <DBFLogo opacity={0.7} />
      <CoordHud opacity={0.6} />

      <StepLabel>Step 1 — Define Site Boundary &amp; Constraints</StepLabel>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Objective Weight Sliders ────────────────────────────────────────
// 660–1140 frames (22–38s)
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(20, 20);

  const panelProgress = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Sliders animate over time
  const sliderT = interpolate(frame, [80, 350], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sliders = [
    {
      label: "Charger Throughput",
      value: lerp(0.3, 0.78, sliderT),
      color: C.cyan,
    },
    {
      label: "Safety Compliance",
      value: lerp(0.5, 0.92, sliderT),
      color: C.green,
    },
    {
      label: "Cable Run Length",
      value: lerp(0.7, 0.45, sliderT),
      color: C.electricBlue,
    },
    {
      label: "Expansion Capacity",
      value: lerp(0.2, 0.65, sliderT),
      color: C.teal,
    },
    {
      label: "Cost per kWh",
      value: lerp(0.6, 0.55, sliderT),
      color: C.amber,
    },
  ];

  // Gradient overlay changes as sliders move
  const heatProgress = sliderT;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg dimness={0.65} />

      <SiteBoundary progress={1} fillOpacity={0.05} />
      <SiteZones progress={1} fillAlpha={0.12} />

      {/* Scoring heat map overlay */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 45% 40% at 52% 52%, ${C.green}${Math.round(heatProgress * 0.25 * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          opacity: heatProgress,
        }}
      />

      {/* Left panel */}
      <div
        style={{
          position: "absolute",
          left: panelProgress > 0 ? lerp(-340, 40, easeOutCubic(panelProgress)) : -340,
          top: 120,
          opacity: panelProgress,
        }}
      >
        <Panel x={0} y={0} w={320} h={380} title="Objective Weights">
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                ...F,
                fontSize: 10,
                color: C.muted,
                marginBottom: 14,
                lineHeight: 1.4,
              }}
            >
              Adjust priority weights — the optimiser updates the scoring
              gradient in real-time.
            </div>
            {sliders.map((s) => (
              <SliderRow
                key={s.label}
                label={s.label}
                value={s.value}
                color={s.color}
              />
            ))}
          </div>
          {/* Live score */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: `1px solid ${C.faintLine}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ ...F, fontSize: 11, color: C.muted }}>
              Feasibility Score
            </span>
            <span
              style={{
                ...F,
                fontSize: 20,
                fontWeight: 800,
                color: C.green,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(lerp(61, 84, sliderT))}
            </span>
          </div>
        </Panel>
      </div>

      <DBFLogo opacity={0.7} />

      <StepLabel>Step 2 — Set Objective Weights</StepLabel>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Layout Generation — Variant Cards ───────────────────────────────
// 1140–1650 frames (38–55s)
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(20, 20);

  const cardsProgress = interpolate(frame, [30, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const layoutProgress = interpolate(frame, [20, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const VARIANTS = [
    { score: 84, chargers: 9, safety: 92, throughput: 18 },
    { score: 79, chargers: 12, safety: 87, throughput: 24 },
    { score: 77, chargers: 7, safety: 95, throughput: 14 },
    { score: 73, chargers: 11, safety: 88, throughput: 22 },
    { score: 68, chargers: 14, safety: 80, throughput: 28 },
    { score: 65, chargers: 6, safety: 97, throughput: 12 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg dimness={0.7} />

      <SiteBoundary progress={1} fillOpacity={0.05} />
      <SiteZones progress={1} fillAlpha={0.12} />
      <ChargingLayout progress={layoutProgress} variant={0} />

      {/* Generation animation */}
      {frame < 80 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${C.blue}18 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Variant cards row */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 40,
          right: 40,
          display: "flex",
          gap: 16,
          justifyContent: "center",
        }}
      >
        {VARIANTS.map((v, i) => (
          <VariantCard
            key={i}
            index={i}
            score={v.score}
            chargers={v.chargers}
            safety={v.safety}
            throughput={v.throughput}
            active={i === 0}
            progress={cardsProgress}
          />
        ))}
      </div>

      <DBFLogo opacity={0.7} />

      <StepLabel>Step 3 — Generate Layout Variants</StepLabel>
      {cardsProgress > 0.2 && (
        <div
          style={{
            position: "absolute",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            ...F,
            fontSize: 13,
            color: C.cyan,
            opacity: clamp((cardsProgress - 0.2) * 2.5, 0, 1),
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
          }}
        >
          6 candidate layouts generated · Ranked by composite score
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Scene 5: Hyperparameter Controls + Layout Reflow ─────────────────────────
// 1650–2100 frames (55–70s)
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(20, 20);

  const panelSlide = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const reflowT = interpolate(frame, [100, 380], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const variantIndex = Math.floor(reflowT * 3);

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg dimness={0.65} />

      <SiteBoundary progress={1} fillOpacity={0.05} />
      <SiteZones progress={1} fillAlpha={0.12} />
      <ChargingLayout progress={1} variant={variantIndex} />
      <ConstraintOverlays progress={1} />

      {/* Left panel — hyperparameter controls */}
      <div
        style={{
          position: "absolute",
          left: lerp(-360, 40, easeOutCubic(panelSlide)),
          top: 100,
          opacity: panelSlide,
        }}
      >
        <Panel x={0} y={0} w={300} h={440} title="Hyperparameters">
          <div style={{ marginBottom: 6 }}>
            {[
              {
                label: "Population Size",
                value: lerp(0.4, 0.65, reflowT),
                color: C.electricBlue,
                unit: "",
              },
              {
                label: "Mutation Rate",
                value: lerp(0.3, 0.22, reflowT),
                color: C.cyan,
                unit: "",
              },
              {
                label: "Crossover Rate",
                value: 0.75,
                color: C.teal,
                unit: "",
              },
              {
                label: "Min Charger Spacing",
                value: lerp(0.5, 0.38, reflowT),
                color: C.amber,
                unit: "m",
              },
              {
                label: "Max Cable Run",
                value: lerp(0.45, 0.6, reflowT),
                color: C.green,
                unit: "m",
              },
              {
                label: "Turning Radius (T264)",
                value: 0.82,
                color: C.sand,
                unit: "m",
              },
            ].map((s) => (
              <SliderRow
                key={s.label}
                label={s.label}
                value={s.value}
                color={s.color}
                unit={s.unit}
              />
            ))}
          </div>
          <div
            style={{
              paddingTop: 10,
              borderTop: `1px solid ${C.faintLine}`,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ ...F, fontSize: 10, color: C.muted }}>
              Optimiser
            </span>
            <span
              style={{
                ...F,
                fontSize: 10,
                color: C.cyan,
                fontWeight: 600,
              }}
            >
              NSGA-II · Multi-objective
            </span>
          </div>
        </Panel>
      </div>

      {/* Reflow pulse */}
      {reflowT > 0.1 && reflowT < 0.9 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            ...F,
            fontSize: 11,
            color: C.cyan,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: Math.abs(Math.sin(frame * 0.25)) * 0.9,
            background: "rgba(4,11,22,0.82)",
            padding: "6px 18px",
            borderRadius: 20,
            border: `1px solid ${C.cyan}44`,
          }}
        >
          ● Reflowing layout...
        </div>
      )}

      <DBFLogo opacity={0.7} />

      <StepLabel>Step 4 — Tune Hyperparameters</StepLabel>
    </AbsoluteFill>
  );
};

// ─── Scene 6: Scoring Dashboard + Pareto Front ───────────────────────────────
// 2100–2550 frames (70–85s)
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(20, 20);

  const dashProgress = interpolate(frame, [20, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const paretoProgress = interpolate(frame, [100, 380], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gaugeT = interpolate(frame, [60, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg dimness={0.75} />

      <SiteBoundary progress={1} fillOpacity={0.05} />
      <SiteZones progress={1} fillAlpha={0.12} />
      <ChargingLayout progress={1} variant={0} />

      {/* Central score gauges */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 32,
          opacity: dashProgress,
        }}
      >
        <ScoreGauge
          score={Math.round(lerp(0, 84, gaugeT))}
          label="Overall"
          color={C.electricBlue}
        />
        <ScoreGauge
          score={Math.round(lerp(0, 92, gaugeT))}
          label="Safety"
          color={C.green}
        />
        <ScoreGauge
          score={Math.round(lerp(0, 78, gaugeT))}
          label="Throughput"
          color={C.cyan}
        />
        <ScoreGauge
          score={Math.round(lerp(0, 88, gaugeT))}
          label="Cost"
          color={C.amber}
        />
        <ScoreGauge
          score={Math.round(lerp(0, 76, gaugeT))}
          label="Expansion"
          color={C.teal}
        />
      </div>

      {/* Pareto front panel */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 40,
          opacity: dashProgress,
        }}
      >
        <Panel x={0} y={0} w={380} h={270} title="Pareto Front — Safety vs Density">
          <ParetoChart progress={paretoProgress} />
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.amber,
                }}
              />
              <span style={{ ...F, fontSize: 9, color: C.muted }}>
                Selected optimum
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.electricBlue,
                }}
              />
              <span style={{ ...F, fontSize: 9, color: C.muted }}>
                Pareto-optimal
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Metrics breakdown panel */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 40,
          opacity: dashProgress,
        }}
      >
        <Panel x={0} y={0} w={300} h={270} title="Layout 01 · Metrics">
          {[
            { label: "Charger Pads", val: "9 × 350 kW", color: C.electricBlue },
            {
              label: "Total Capacity",
              val: "3,150 kW",
              color: C.cyan,
            },
            {
              label: "Cable Total Run",
              val: "284 m",
              color: C.teal,
            },
            {
              label: "Avg Truck Dwell",
              val: "18.4 min",
              color: C.green,
            },
            {
              label: "Daily Throughput",
              val: "62 truck-cycles",
              color: C.amber,
            },
            {
              label: "Capital Cost Est.",
              val: "$4.2M",
              color: C.white,
            },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: `1px solid ${C.faintLine}`,
              }}
            >
              <span style={{ ...F, fontSize: 11, color: C.muted }}>
                {label}
              </span>
              <span
                style={{ ...F, fontSize: 11, color, fontWeight: 600 }}
              >
                {val}
              </span>
            </div>
          ))}
        </Panel>
      </div>

      <DBFLogo opacity={0.7} />

      <StepLabel>Step 5 — Scoring Dashboard</StepLabel>
    </AbsoluteFill>
  );
};

// ─── Scene 7: Detailed Layer View + T264 Swept Path ──────────────────────────
// 2550–3060 frames (85–102s)
const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(20, 20);

  const layerProgress = interpolate(frame, [20, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const truckProgress = interpolate(frame, [180, 460], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const panelProgress = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg dimness={0.65} />

      <SiteBoundary progress={1} fillOpacity={0.06} />
      <SiteZones progress={1} fillAlpha={0.12} />
      <ChargingLayout progress={1} variant={0} />
      <ConstraintOverlays progress={1} />
      <TruckPath progress={truckProgress} />

      {/* Layer panel */}
      <div
        style={{
          position: "absolute",
          right: lerp(1960, 40, easeOutCubic(panelProgress)),
          top: 100,
          opacity: panelProgress,
        }}
      >
        <Panel x={0} y={0} w={260} h={300} title="Layer Control">
          <LayerStack progress={layerProgress} />
        </Panel>
      </div>

      {/* Truck info callout */}
      {truckProgress > 0.15 && (
        <div
          style={{
            position: "absolute",
            left: 60,
            bottom: 200,
            opacity: clamp((truckProgress - 0.15) * 4, 0, 1),
          }}
        >
          <Panel x={0} y={0} w={280} h={160} title="BEV Truck · T264">
            {[
              {
                label: "Vehicle Type",
                val: "Caterpillar 793 BEV",
                color: C.white,
              },
              { label: "GVW", val: "380 t", color: C.white },
              {
                label: "Min Turn Radius",
                val: "14.8 m",
                color: C.cyan,
              },
              {
                label: "Swept Width",
                val: "9.2 m",
                color: C.cyan,
              },
              {
                label: "Charge Req.",
                val: "350 kW · 1.8h",
                color: C.amber,
              },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 7,
                }}
              >
                <span style={{ ...F, fontSize: 10, color: C.muted }}>
                  {label}
                </span>
                <span
                  style={{ ...F, fontSize: 10, color, fontWeight: 600 }}
                >
                  {val}
                </span>
              </div>
            ))}
          </Panel>
        </div>
      )}

      <DBFLogo opacity={0.7} />
      <CoordHud opacity={0.5} />

      <StepLabel>Step 6 — Layer Detail + Swept-Path Simulation</StepLabel>
    </AbsoluteFill>
  );
};

// ─── Scene 8: Export Panel ────────────────────────────────────────────────────
// 3060–3450 frames (102–115s)
const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(20, 20);

  const panelProgress = interpolate(frame, [20, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });
  const itemsProgress = interpolate(frame, [80, 320], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const EXPORT_FORMATS = [
    { label: "DWG / AutoCAD", icon: "⬡", desc: "Full 2D drawing package", color: C.electricBlue },
    { label: "IFC / BIM", icon: "◈", desc: "3D model + metadata", color: C.cyan },
    { label: "GeoJSON", icon: "⬟", desc: "Site boundary + zones", color: C.green },
    { label: "PDF Report", icon: "◻", desc: "Executive summary + scores", color: C.amber },
    { label: "Simulation Data", icon: "⬦", desc: "Truck routing + dwell CSV", color: C.teal },
    { label: "Cost Estimate", icon: "⬤", desc: "BoQ + unit rates", color: C.sand },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg dimness={0.72} />

      <SiteBoundary progress={1} fillOpacity={0.05} />
      <SiteZones progress={1} fillAlpha={0.12} />
      <ChargingLayout progress={1} variant={0} />

      {/* Large export modal */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${lerp(0.85, 1, easeOutCubic(panelProgress))})`,
          opacity: panelProgress,
          width: 700,
        }}
      >
        {/* Modal */}
        <div
          style={{
            background: "rgba(6,12,24,0.95)",
            border: `1px solid ${C.faintLine}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(90deg, ${C.blue}33, ${C.cyan}11)`,
              borderBottom: `1px solid ${C.faintLine}`,
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  ...F,
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                Export Layout Package
              </div>
              <div
                style={{
                  ...F,
                  fontSize: 11,
                  color: C.muted,
                }}
              >
                Layout 01 · VANTOR-ALPHA · 84 / 100
              </div>
            </div>
            <div
              style={{
                background: `${C.electricBlue}22`,
                border: `1px solid ${C.electricBlue}`,
                borderRadius: 6,
                padding: "6px 16px",
                ...F,
                fontSize: 11,
                color: C.electricBlue,
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              EXPORT ALL
            </div>
          </div>

          {/* Format list */}
          <div style={{ padding: "16px 24px 20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {EXPORT_FORMATS.map((fmt, i) => {
                const p = clamp((itemsProgress - i * 0.1) / 0.25, 0, 1);
                return (
                  <div
                    key={fmt.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      background: `${fmt.color}0A`,
                      border: `1px solid ${fmt.color}33`,
                      borderRadius: 8,
                      opacity: p,
                      transform: `translateY(${lerp(12, 0, easeOut(p))}px)`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        color: fmt.color,
                        width: 28,
                        textAlign: "center",
                      }}
                    >
                      {fmt.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          ...F,
                          fontSize: 12,
                          fontWeight: 600,
                          color: fmt.color,
                          marginBottom: 2,
                        }}
                      >
                        {fmt.label}
                      </div>
                      <div
                        style={{
                          ...F,
                          fontSize: 10,
                          color: C.muted,
                        }}
                      >
                        {fmt.desc}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `1.5px solid ${fmt.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: fmt.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DBFLogo opacity={0.7} />

      <StepLabel>Step 7 — Export Design Package</StepLabel>
    </AbsoluteFill>
  );
};

// ─── Scene 9: Pull-Back Closing + Score Badge ─────────────────────────────────
// 3450–3600 frames (115–120s)
const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = useFadeInOut(20, 15);

  // Pull back = zoom out
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  const badgeProgress = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });

  const taglineProgress = interpolate(frame, [40, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <MineSiteBg scale={scale} dimness={0.55} />

      {/* All layers visible for closing shot */}
      <SiteBoundary progress={1} fillOpacity={0.07} />
      <SiteZones progress={1} fillAlpha={0.14} />
      <ChargingLayout progress={1} variant={0} />
      <ConstraintOverlays progress={0.8} />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(4,11,22,0.7) 100%)",
        }}
      />

      {/* Central score badge */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${badgeProgress})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `conic-gradient(${C.electricBlue} 0deg ${Math.round(0.84 * 360)}deg, ${C.faintLine} ${Math.round(0.84 * 360)}deg 360deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${C.electricBlue}44`,
          }}
        >
          <div
            style={{
              width: 154,
              height: 154,
              borderRadius: "50%",
              background: C.bg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <div
              style={{
                ...F,
                fontSize: 11,
                color: C.muted,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Layout Score
            </div>
            <div
              style={{
                ...F,
                fontSize: 48,
                fontWeight: 800,
                color: C.electricBlue,
                lineHeight: 1,
              }}
            >
              84
            </div>
            <div
              style={{ ...F, fontSize: 11, color: C.muted }}
            >
              / 100
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: taglineProgress,
          background: "rgba(4,11,22,0.70)",
          padding: "20px 40px",
          borderRadius: 12,
          border: `1px solid ${C.faintLine}`,
          backdropFilter: "blur(6px)",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            ...F,
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "-0.01em",
            textShadow: "0 2px 12px rgba(0,0,0,0.7)",
          }}
        >
          From constraints to{" "}
          <span
            style={{
              background: `linear-gradient(90deg, ${C.electricBlue}, ${C.cyan})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            optimised layout
          </span>
          {" "}in minutes.
        </div>
        <div
          style={{
            ...F,
            fontSize: 13,
            color: C.muted,
            letterSpacing: "0.04em",
          }}
        >
          digitalbluefoam.com
        </div>
      </div>

      <DBFLogo opacity={taglineProgress} />
    </AbsoluteFill>
  );
};

// ─── Root Composition ─────────────────────────────────────────────────────────
export const MiningVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily }}>
      {/* Scene 1: Aerial pull-in — 0–240f */}
      <Sequence from={0} durationInFrames={240}>
        <Scene1 />
      </Sequence>

      {/* Scene 2: Site boundary + constraints — 240–660f */}
      <Sequence from={240} durationInFrames={420}>
        <Scene2 />
      </Sequence>

      {/* Scene 3: Objective sliders — 660–1140f */}
      <Sequence from={660} durationInFrames={480}>
        <Scene3 />
      </Sequence>

      {/* Scene 4: Layout variant cards — 1140–1650f */}
      <Sequence from={1140} durationInFrames={510}>
        <Scene4 />
      </Sequence>

      {/* Scene 5: Hyperparameter controls — 1650–2100f */}
      <Sequence from={1650} durationInFrames={450}>
        <Scene5 />
      </Sequence>

      {/* Scene 6: Scoring dashboard — 2100–2550f */}
      <Sequence from={2100} durationInFrames={450}>
        <Scene6 />
      </Sequence>

      {/* Scene 7: Layer view + truck path — 2550–3060f */}
      <Sequence from={2550} durationInFrames={510}>
        <Scene7 />
      </Sequence>

      {/* Scene 8: Export panel — 3060–3450f */}
      <Sequence from={3060} durationInFrames={390}>
        <Scene8 />
      </Sequence>

      {/* Scene 9: Pull-back closing — 3450–3600f */}
      <Sequence from={3450} durationInFrames={150}>
        <Scene9 />
      </Sequence>
    </AbsoluteFill>
  );
};
