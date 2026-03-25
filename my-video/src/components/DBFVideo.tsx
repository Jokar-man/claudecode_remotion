/**
 * Digital Blue Foam — "The City, Scored."
 * 2-minute brand video · 1920×1080 · 30fps
 *
 * Scene 1  0:00–0:20  The Problem     — NASA Black Marble world map + scattered property listings
 * Scene 2  0:20–0:40  The Shift       — Real Singapore street map + isochrone intelligence
 * Scene 3  0:40–1:10  The Product     — Per-city aerial photos + live score panels
 * Scene 4  1:10–1:30  Credibility     — Dubai Burj Khalifa view + partner credentials
 * Scene 5  1:30–2:00  The Call        — Singapore aerial + score tags + logo reveal
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
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
  blue: "#0055FF",
  cyan: "#00C8FF",
  electricBlue: "#4A9EFF",
  white: "#FFFFFF",
  muted: "#6B8BB0",
  faintLine: "#1A2E50",
  green: "#00E5A0",
  amber: "#FFB800",
  red: "#FF4466",
};

// ─── Asset paths ──────────────────────────────────────────────────────────────
const A = {
  worldNight: staticFile("assets/world-night.jpg"),
  singaporeAerial: staticFile("assets/singapore-aerial.jpg"),
  singaporeMap: staticFile("assets/singapore-map.png"),
  dubai: staticFile("assets/dubai.jpg"),
  bangkok: staticFile("assets/bangkok.jpg"),
  kualalumpur: staticFile("assets/kualalumpur.jpg"),
  jakarta: staticFile("assets/jakarta.jpg"),
  lastFrameBg: staticFile("assets/last-frame-bg.jpg"),
  globe: staticFile("assets/globe3.jpg"),
  singaporeSatellite: staticFile("assets/singapore-satellite.jpg"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const useFadeInOut = (fadeIn = 20, fadeOut = 20): number => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  return interpolate(frame, [0, fadeIn, dur - fadeOut, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Ken Burns slow zoom/pan on a photo
const KenBurns: React.FC<{
  src: string;
  scale?: [number, number]; // [from, to]
  tx?: [number, number];    // translate x % [from, to]
  ty?: [number, number];    // translate y % [from, to]
  filter?: string;
  opacity?: number;
}> = ({
  src,
  scale = [1, 1.08],
  tx = [0, 0],
  ty = [0, 0],
  filter,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const s = scale[0] + (scale[1] - scale[0]) * t;
  const x = tx[0] + (tx[1] - tx[0]) * t;
  const y = ty[0] + (ty[1] - ty[0]) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s}) translate(${x}%, ${y}%)`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

// Dark overlay gradient
const DarkOverlay: React.FC<{
  opacity?: number;
  gradient?: string;
}> = ({
  opacity = 1,
  gradient = "linear-gradient(to bottom, rgba(2,8,20,0.55) 0%, rgba(2,8,20,0.3) 50%, rgba(2,8,20,0.7) 100%)",
}) => (
  <AbsoluteFill style={{ background: gradient, opacity }} />
);

// ─── Isochrone Rings (SVG) ────────────────────────────────────────────────────
const IsochroneRings: React.FC<{
  cx: number;
  cy: number;
  progress: number;
  color?: string;
}> = ({ cx, cy, progress, color = C.cyan }) => {
  const rings = [
    { maxR: 160, delay: 0 },
    { maxR: 290, delay: 0.18 },
    { maxR: 430, delay: 0.33 },
  ];
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {rings.map((ring, i) => {
        const lp = clamp((progress - ring.delay) / (1 - ring.delay + 0.01), 0, 1);
        const r = ring.maxR * easeOut(lp);
        const opa = lp > 0 ? 0.5 * (1 - lp * 0.4) : 0;
        return (
          <g key={i}>
            <circle
              cx={cx} cy={cy} r={r}
              fill={`${color}0A`}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="10 6"
              opacity={opa}
            />
          </g>
        );
      })}
      {progress > 0.05 && (
        <>
          <circle cx={cx} cy={cy} r={18} fill={color} opacity={0.18} />
          <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.85} />
          <circle cx={cx} cy={cy} r={3} fill={C.white} />
        </>
      )}
    </svg>
  );
};

// ─── POI Dots ─────────────────────────────────────────────────────────────────
const POI_DOTS = [
  { x: 880, y: 530 },
  { x: 730, y: 480 },
  { x: 1020, y: 460 },
  { x: 660, y: 600 },
  { x: 970, y: 640 },
  { x: 820, y: 420 },
  { x: 1100, y: 570 },
  { x: 750, y: 680 },
];

const DataDots: React.FC<{ progress: number; cx?: number; cy?: number }> = ({
  progress,
  cx = 860,
  cy = 560,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0 }}>
    {POI_DOTS.map((dot, i) => {
      const delay = (i / POI_DOTS.length) * 0.6;
      const lp = clamp((progress - delay) / 0.2, 0, 1);
      const s = easeOut(lp);
      // Offset dots relative to center
      const dx = dot.x - 860 + cx;
      const dy = dot.y - 560 + cy;
      return (
        <g key={i} transform={`translate(${dx},${dy}) scale(${s})`}>
          <circle r={14} fill={C.cyan} opacity={0.82} />
          <circle r={14} fill="none" stroke={C.white} strokeWidth={1} opacity={0.4} />
          <circle r={4.5} fill={C.white} opacity={0.95} />
        </g>
      );
    })}
  </svg>
);

// ─── Score Panel ──────────────────────────────────────────────────────────────
const LIVEABILITY = [
  { label: "Transit", val: 85, color: C.cyan },
  { label: "Fitness", val: 90, color: C.green },
  { label: "Safety", val: 70, color: C.electricBlue },
  { label: "Culture", val: 78, color: C.amber },
];
const CLIMATE = [
  { label: "Heat", val: 55, color: C.amber },
  { label: "Flood", val: 18, color: C.electricBlue },
  { label: "Quake", val: 30, color: C.red },
];

const ScorePanel: React.FC<{
  city: string;
  score: number;
  panelP: number;
}> = ({ city, score, panelP }) => {
  const opacity = clamp(panelP * 5, 0, 1);
  const barP = clamp((panelP - 0.2) / 0.8, 0, 1);
  const displayScore = Math.round(score * clamp(panelP * 4, 0, 1));

  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: "50%",
        transform: "translateY(-50%)",
        width: 440,
        opacity,
        fontFamily,
      }}
    >
      <div
        style={{
          background: "rgba(6,12,26,0.96)",
          border: `1px solid rgba(0,200,255,0.3)`,
          borderRadius: 16,
          padding: "28px 28px 24px",
          boxShadow: "0 0 80px rgba(0,85,255,0.3), 0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
          {city} · DBF ANALYSIS
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 18 }}>
          <span style={{ fontSize: 86, fontWeight: 900, color: C.cyan, lineHeight: 1, letterSpacing: -4 }}>
            {displayScore}
          </span>
          <span style={{ fontSize: 26, color: C.muted, marginLeft: 4 }}>/100</span>
        </div>
        <div style={{ color: C.muted, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>
          Liveability Score
        </div>

        {LIVEABILITY.map((b, i) => (
          <div key={i} style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: C.white, fontSize: 11, fontWeight: 500 }}>{b.label}</span>
              <span style={{ color: b.color, fontSize: 11, fontWeight: 700 }}>{Math.round(b.val * barP)}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
              <div style={{
                height: 4,
                width: `${b.val * barP}%`,
                background: `linear-gradient(90deg,${b.color}55,${b.color})`,
                borderRadius: 2,
              }} />
            </div>
          </div>
        ))}

        <div style={{ height: 1, background: "rgba(0,200,255,0.14)", margin: "16px 0" }} />
        <div style={{ color: C.muted, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>
          Climate Risk · 2050
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {CLIMATE.map((r, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: `2px solid ${r.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 5px",
                color: r.color, fontSize: 16, fontWeight: 800,
              }}>
                {Math.round(r.val * barP)}
              </div>
              <div style={{ color: C.muted, fontSize: 9, letterSpacing: 1 }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Property Listing Card ────────────────────────────────────────────────────
const PropertyCard: React.FC<{
  city: string;
  address: string;
  price: string;
  beds: string;
  score?: number | null;
  gradientA: string;
  gradientB: string;
  opacity?: number;
  scale?: number;
  showScore?: boolean;
}> = ({
  city,
  address,
  price,
  beds,
  score = null,
  gradientA,
  gradientB,
  opacity = 1,
  scale = 1,
  showScore = false,
}) => (
  <div
    style={{
      width: 220,
      background: "rgba(255,255,255,0.97)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "bottom center",
      fontFamily,
    }}
  >
    {/* Photo */}
    <div
      style={{
        height: 100,
        background: `linear-gradient(135deg,${gradientA},${gradientB})`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 32 }}>🏢</span>
      {showScore && score !== null && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: `linear-gradient(135deg,${C.blue},${C.cyan})`,
            borderRadius: 8,
            padding: "4px 8px",
            color: C.white,
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {score}/100
        </div>
      )}
      {!showScore && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.35)",
            borderRadius: 8,
            padding: "4px 8px",
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
          }}
        >
          No Score
        </div>
      )}
    </div>
    {/* Info */}
    <div style={{ padding: "10px 12px" }}>
      <div style={{ color: "#555", fontSize: 9, letterSpacing: 0.8, fontWeight: 600, marginBottom: 2 }}>
        {city.toUpperCase()}
      </div>
      <div style={{ color: "#888", fontSize: 9, marginBottom: 5 }}>{address}</div>
      <div style={{ color: "#111", fontSize: 17, fontWeight: 800, marginBottom: 3 }}>{price}</div>
      <div style={{ color: "#999", fontSize: 9 }}>{beds}</div>
    </div>
  </div>
);

// ─── SCENE 1 — The Problem ────────────────────────────────────────────────────
// World map at night with property listings scattered over major cities

// Equirectangular: px = (lng+180)/360*1920,  py = (90-lat)/180*1080
// All coordinates verified to land on city-light clusters in NASA Black Marble
const WORLD_LISTINGS = [
  {
    // Singapore island centre  → px≈1512, py≈532
    lat: 1.35, lng: 103.82,
    city: "Singapore", address: "Marina Bay, SG", price: "S$2,850,000",
    beds: "4 Bed · 3 Bath", ga: "#b8d4e8", gb: "#7ba8c8",
  },
  {
    // Central London (inland)  → px≈959, py≈231
    lat: 51.5, lng: -0.09,
    city: "London", address: "Kensington, UK", price: "£1,240,000",
    beds: "3 Bed · 2 Bath", ga: "#c8b8e8", gb: "#9870c8",
  },
  {
    // Midtown Manhattan         → px≈565, py≈296
    lat: 40.75, lng: -73.98,
    city: "New York", address: "Manhattan, NY", price: "$3,200,000",
    beds: "2 Bed · 2 Bath", ga: "#e8c8b8", gb: "#c89870",
  },
  {
    // Downtown Dubai (inland)   → px≈1253, py≈391
    lat: 25.07, lng: 55.14,
    city: "Dubai", address: "Downtown Dubai", price: "AED 4,500,000",
    beds: "3 Bed · 4 Bath", ga: "#e8deb8", gb: "#c8b860",
  },
  {
    // Central Tokyo / Shinjuku  → px≈1702, py≈326
    lat: 35.69, lng: 139.69,
    city: "Tokyo", address: "Shinjuku, JP", price: "¥180,000,000",
    beds: "3LDK", ga: "#b8e8d4", gb: "#70c8a8",
  },
  {
    // Inner Sydney (not harbour) → px≈1764, py≈742
    lat: -33.87, lng: 151.18,
    city: "Sydney", address: "Surry Hills, NSW", price: "A$4,100,000",
    beds: "5 Bed · 3 Bath", ga: "#b8d8e8", gb: "#60a8c8",
  },
  {
    // Mumbai eastern suburbs (clearly on land) → px≈1352, py≈426
    lat: 19.08, lng: 73.01,
    city: "Mumbai", address: "Bandra West, IN", price: "₹12,50,00,000",
    beds: "4 Bed · 3 Bath", ga: "#e8c0b8", gb: "#c88070",
  },
];

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(30, 30);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* NASA Black Marble world map — static (no movement so pins stay over land) */}
      <KenBurns
        src={A.worldNight}
        scale={[1, 1]}
        tx={[0, 0]}
        ty={[0, 0]}
        filter="brightness(1.15) saturate(1.3)"
      />
      <DarkOverlay gradient="linear-gradient(to bottom, rgba(2,8,20,0.3) 0%, rgba(2,8,20,0.15) 50%, rgba(2,8,20,0.55) 100%)" />

      {/* City pins + Property cards */}
      {WORLD_LISTINGS.map((listing, i) => {
        const px = ((listing.lng + 180) / 360) * 1920;
        const py = ((90 - listing.lat) / 180) * 1080;

        const cardAppear = interpolate(frame, [40 + i * 35, 80 + i * 35], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const cardBob = Math.sin(frame * 0.04 + i * 0.8) * 4;

        // Card offset — alternate above/below/left/right to avoid overlap
        const offsets: [number, number][] = [
          [-240, -140], [-240, 20], [20, -140], [20, 20],
          [-240, -140], [20, -140], [-240, 20],
        ];
        const [ox, oy] = offsets[i % offsets.length];

        return (
          <div key={i} style={{ position: "absolute", left: px, top: py }}>
            {/* City glow */}
            <div style={{
              position: "absolute",
              width: 24, height: 24,
              borderRadius: "50%",
              background: C.cyan,
              transform: "translate(-12px,-12px)",
              boxShadow: `0 0 20px 8px ${C.cyan}66`,
              opacity: cardAppear * 0.9,
            }} />
            {/* Connecting line */}
            <svg
              style={{ position: "absolute", overflow: "visible" }}
              width={1} height={1}
            >
              <line
                x1={0} y1={0}
                x2={ox + 110} y2={oy + cardBob + 50}
                stroke={`${C.cyan}80`} strokeWidth={1}
                strokeDasharray="4 3"
                opacity={cardAppear}
              />
            </svg>
            {/* Property card */}
            <div style={{
              position: "absolute",
              left: ox,
              top: oy + cardBob,
              opacity: cardAppear,
            }}>
              <PropertyCard
                city={listing.city}
                address={listing.address}
                price={listing.price}
                beds={listing.beds}
                gradientA={listing.ga}
                gradientB={listing.gb}
                showScore={false}
              />
            </div>
          </div>
        );
      })}

      {/* Headline */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        fontFamily,
        opacity: interpolate(frame, [200, 260], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }),
        zIndex: 10,
        pointerEvents: "none",
      }}>
        <div style={{
          background: "rgba(4,11,22,0.78)",
          backdropFilter: "blur(20px)",
          borderRadius: 16,
          border: `1px solid rgba(0,200,255,0.2)`,
          padding: "36px 56px",
          maxWidth: 680,
        }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 14 }}>
            40 Million Decisions · Every Year
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.15, color: C.white, marginBottom: 12 }}>
            They're given a price.
            <br />A photo. A floor plan.
          </div>
          <div style={{
            fontSize: 30, fontWeight: 700,
            background: `linear-gradient(90deg,${C.cyan},${C.electricBlue})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            But never the full picture.
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 48, left: "50%",
        transform: "translateX(-50%)",
        fontFamily, color: C.muted, fontSize: 12, letterSpacing: 4,
        textTransform: "uppercase",
        opacity: interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        Southeast Asia · Property Intelligence
      </div>
    </AbsoluteFill>
  );
};

// ─── SCENE 2 — The Shift ──────────────────────────────────────────────────────
// Real Singapore street map (dark-filtered OSM) + isochrone rings + POI dots

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(30, 30);

  const mapReveal = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const isoP = interpolate(frame, [30, 200], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const dotsP = interpolate(frame, [100, 380], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cardP = interpolate(frame, [260, 370], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Marina Bay / CBD area on the Singapore OSM map
  // The map is 1920×1305, displayed with cover → crops ~112px top/bottom
  // CBD is roughly at 60% x, 65% y on the full map → ~1152, ~848 → after cover crop ~1152, ~736
  const isoCx = 1140;
  const isoCy = 700;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Singapore satellite map — real aerial imagery, darkened for drama */}
      <AbsoluteFill style={{ opacity: mapReveal }}>
        <Img
          src={A.singaporeSatellite}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            filter: "brightness(0.6) saturate(1.3) contrast(1.1)",
          }}
        />
      </AbsoluteFill>

      {/* Deep navy overlay so isochrone / UI pops */}
      <AbsoluteFill style={{
        background: "rgba(2,8,20,0.5)",
        opacity: mapReveal,
      }} />

      {/* Isochrone rings */}
      {isoP > 0 && <IsochroneRings cx={isoCx} cy={isoCy} progress={isoP} />}

      {/* POI dots */}
      {dotsP > 0 && <DataDots progress={dotsP} cx={isoCx} cy={isoCy} />}

      {/* "What if" card — slides in */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%)`,
        fontFamily,
        opacity: cardP,
        zIndex: 20,
      }}>
        <div style={{
          background: "rgba(4,11,22,0.9)",
          padding: "44px 60px",
          borderRadius: 20,
          border: `1px solid rgba(0,200,255,0.25)`,
          backdropFilter: "blur(24px)",
          maxWidth: 740,
          textAlign: "center",
          boxShadow: "0 0 80px rgba(0,85,255,0.25)",
        }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 3.5, marginBottom: 18, textTransform: "uppercase" }}>
            Singapore · 15-Minute Liveability Zone
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: C.white, lineHeight: 1.18, marginBottom: 16 }}>
            What if every property came
            <br />with <span style={{ color: C.cyan }}>intelligence?</span>
          </div>
          <div style={{ color: C.muted, fontSize: 20, lineHeight: 1.65 }}>
            Not just location — but liveability.
            <br />
            Not just an address — but a risk profile.
          </div>
        </div>
      </div>

      {/* Legend bottom bar */}
      {dotsP > 0.6 && (
        <div style={{
          position: "absolute",
          bottom: 64,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 18,
          fontFamily,
          opacity: interpolate(dotsP, [0.6, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          {["🚇 Transit", "🏫 Education", "🏥 Healthcare", "🌿 Green Space"].map((lbl) => (
            <div key={lbl} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(6,14,30,0.85)",
              padding: "8px 16px", borderRadius: 8,
              border: `1px solid ${C.cyan}28`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.cyan }} />
              <span style={{ color: C.white, fontSize: 13 }}>{lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* Map attribution */}
      <div style={{
        position: "absolute", bottom: 14, right: 16,
        color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily,
      }}>
        Map © OpenStreetMap contributors
      </div>
    </AbsoluteFill>
  );
};

// ─── SCENE 3 — The Product ────────────────────────────────────────────────────
// City aerials cycling through Singapore → KL → Bangkok → Dubai → Jakarta

const CITIES_DATA = [
  {
    id: "singapore",
    label: "Singapore",
    src: A.singaporeAerial,
    score: 74,
    price: "S$2,850,000",
    address: "Marina Bay Residences",
    ken: { scale: [1, 1.07] as [number, number], tx: [0, -2] as [number, number], ty: [0, -1] as [number, number] },
    isoCx: 720, isoCy: 560,
  },
  {
    id: "kl",
    label: "Kuala Lumpur",
    src: A.kualalumpur,
    score: 82,
    price: "MYR 3,200,000",
    address: "KLCC Twin Towers Vicinity",
    ken: { scale: [1.05, 1] as [number, number], tx: [1, 0] as [number, number], ty: [1, 0] as [number, number] },
    isoCx: 720, isoCy: 520,
  },
  {
    id: "bangkok",
    label: "Bangkok",
    src: A.bangkok,
    score: 68,
    price: "THB 38,000,000",
    address: "Sukhumvit District",
    ken: { scale: [1.08, 1.02] as [number, number], tx: [0, 2] as [number, number], ty: [0, 1] as [number, number] },
    isoCx: 680, isoCy: 540,
  },
  {
    id: "dubai",
    label: "Dubai",
    src: A.dubai,
    score: 88,
    price: "AED 4,500,000",
    address: "Downtown Dubai",
    ken: { scale: [1, 1.06] as [number, number], tx: [0, -1] as [number, number], ty: [0, -2] as [number, number] },
    isoCx: 700, isoCy: 530,
  },
  {
    id: "jakarta",
    label: "Jakarta",
    src: A.jakarta,
    score: 71,
    price: "IDR 18,500,000,000",
    address: "Central Business District",
    ken: { scale: [1.04, 1.1] as [number, number], tx: [0, 0] as [number, number], ty: [0, -2] as [number, number] },
    isoCx: 700, isoCy: 500,
  },
];


const CityDemo: React.FC<{
  city: (typeof CITIES_DATA)[0];
  localFrame: number;
  cycleDur: number;
}> = ({ city, localFrame, cycleDur }) => {
  const mapP = interpolate(localFrame, [0, 80], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const panelP = interpolate(localFrame, [30, 200], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cardP = interpolate(localFrame, [50, 130], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });
  const fadeOut = interpolate(localFrame, [cycleDur - 30, cycleDur], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Left 58% — city aerial with Ken Burns */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "58%", overflow: "hidden" }}>
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <Img
            src={city.src}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              transform: `scale(${city.ken.scale[0] + (city.ken.scale[1] - city.ken.scale[0]) * (localFrame / cycleDur)}) translate(${city.ken.tx[0] + (city.ken.tx[1] - city.ken.tx[0]) * (localFrame / cycleDur)}%, ${city.ken.ty[0] + (city.ken.ty[1] - city.ken.ty[0]) * (localFrame / cycleDur)}%)`,
              filter: "brightness(0.8) saturate(1.2)",
            }}
          />
        </AbsoluteFill>

        {/* Dark left-edge fade for panel overlap */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(4,11,22,0.2) 0%, transparent 30%, transparent 65%, rgba(4,11,22,0.9) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(4,11,22,0.4) 0%, transparent 20%, transparent 80%, rgba(4,11,22,0.6) 100%)",
        }} />

        {/* Isochrone on map */}
        {mapP > 0.05 && (
          <IsochroneRings cx={city.isoCx} cy={city.isoCy} progress={mapP} />
        )}

        {/* Property card floating on image */}
        <div style={{
          position: "absolute",
          left: city.isoCx - 110,
          top: city.isoCy - 230 + Math.sin(localFrame * 0.04) * 5,
          opacity: cardP,
          transform: `scale(${cardP}) translateY(${(1 - cardP) * 20}px)`,
        }}>
          <PropertyCard
            city={city.label}
            address={city.address}
            price={city.price}
            beds="4 Bed · 3 Bath"
            score={city.score}
            gradientA="#1a3870"
            gradientB="#0a1e40"
            showScore
          />
        </div>

        {/* City label top-left */}
        <div style={{
          position: "absolute", top: 52, left: 52, fontFamily,
          opacity: interpolate(localFrame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
            DBF Analysis
          </div>
          <div style={{ color: C.white, fontSize: 36, fontWeight: 800 }}>{city.label}</div>
        </div>

        {/* Lower-third */}
        <div style={{
          position: "absolute", bottom: 76, left: 52, fontFamily,
          opacity: interpolate(localFrame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(localFrame, [30, 90], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}>
          <div style={{
            display: "inline-block",
            background: `linear-gradient(90deg,${C.blue},${C.cyan})`,
            padding: "3px 16px 3px 0", marginBottom: 4,
          }}>
            <span style={{ color: C.white, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              20-Minute City Intelligence
            </span>
          </div>
          <div style={{ color: C.electricBlue, fontSize: 15 }}>
            Liveability · Climate · One API
          </div>
        </div>
      </div>

      {/* Right panel — score */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "42%",
        background: "rgba(4,11,22,0.92)",
        borderLeft: `1px solid rgba(0,200,255,0.12)`,
      }}>
        <ScorePanel
          city={city.label.toUpperCase()}
          score={city.score}
          panelP={panelP}
        />
      </div>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(30, 30);

  const CYCLE = 180; // 6s per city
  const cityIdx = clamp(Math.floor(frame / CYCLE), 0, CITIES_DATA.length - 1);
  const localFrame = frame % CYCLE;

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ background: C.bg }} />
      <CityDemo
        key={cityIdx}
        city={CITIES_DATA[cityIdx]}
        localFrame={localFrame}
        cycleDur={CYCLE}
      />
    </AbsoluteFill>
  );
};

// ─── SCENE 4 — Credibility ────────────────────────────────────────────────────
// Dubai Burj Khalifa night view (real photo) + globe + partner list


const PARTNERS = [
  { name: "TAKENAKA", note: "Construction & Urban Development", color: C.electricBlue, icon: "🏗️" },
  { name: "Jacobs", note: "Infrastructure & Smart Cities", color: C.cyan, icon: "🔩" },
  { name: "EMAAR", note: "Real Estate Development", color: C.amber, icon: "🏢" },
  { name: "Dubai Municipality", note: "Urban Planning at Scale", color: C.green, icon: "🏛️" },
  { name: "McKinsey & Company", note: "Strategy & City Intelligence", color: C.electricBlue, icon: "📈" },
  { name: "Egis", note: "Engineering & Mobility", color: C.cyan, icon: "🛤️" },
];

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(30, 30);
  const titleP = interpolate(frame, [20, 80], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Left half — Dubai real photo */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", overflow: "hidden" }}>
        <KenBurns
          src={A.dubai}
          scale={[1.02, 1.08]}
          tx={[0, -2]}
          ty={[1, 0]}
          filter="brightness(0.75) saturate(1.3)"
        />
        {/* Dark fade right edge */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, transparent 55%, rgba(4,11,22,0.95) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(4,11,22,0.4) 0%, transparent 25%)",
        }} />

        {/* DBF overlay badge on photo */}
        <div style={{
          position: "absolute",
          top: 60, left: 56,
          fontFamily,
          opacity: titleP,
        }}>
          <div style={{
            background: "rgba(6,12,26,0.88)",
            border: `1px solid rgba(0,200,255,0.35)`,
            borderRadius: 12,
            padding: "14px 20px",
            backdropFilter: "blur(16px)",
          }}>
            <div style={{ color: C.muted, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4 }}>
              DBF Interface · Dubai
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ color: C.cyan, fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>88</span>
              <span style={{ color: C.muted, fontSize: 18 }}>/100</span>
            </div>
            <div style={{ color: C.green, fontSize: 11, marginTop: 2 }}>↑ Top 5% Globally</div>
          </div>
        </div>


      </div>

      {/* Divider */}
      <div style={{
        position: "absolute", left: "50%", top: "8%", bottom: "8%",
        width: 1,
        background: `linear-gradient(to bottom, transparent, ${C.cyan}44, transparent)`,
      }} />

      {/* Right half — partners */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "50%",
        background: "rgba(4,11,22,0.96)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "80px 72px 80px 56px",
        fontFamily,
      }}>
        <div style={{ color: C.muted, fontSize: 11, letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 18, opacity: titleP }}>
          Built on Global Science
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.white, lineHeight: 1.2, marginBottom: 36, opacity: titleP }}>
          Trusted by the world&apos;s
          <br /><span style={{ color: C.cyan }}>smartest cities.</span>
        </div>

        {PARTNERS.map((p, i) => {
          const ep = interpolate(frame, [40 + i * 38, 95 + i * 38], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const dx = interpolate(frame, [40 + i * 38, 95 + i * 38], [40, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              marginBottom: 14, opacity: ep,
              transform: `translateX(${dx}px)`,
            }}>
              <div style={{
                width: 46, height: 46,
                background: `${p.color}1C`,
                border: `1px solid ${p.color}40`,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>
                {p.icon}
              </div>
              <div>
                <div style={{ color: p.color, fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{p.note}</div>
              </div>
            </div>
          );
        })}

        <div style={{
          marginTop: 20, padding: "14px 18px",
          background: "rgba(0,200,255,0.05)",
          border: `1px solid rgba(0,200,255,0.14)`,
          borderRadius: 10,
          opacity: interpolate(frame, [260, 360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>
            On any property platform in Asia
          </div>
          <div style={{ color: C.cyan, fontSize: 14, marginTop: 4 }}>In days, not months.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── SCENE 5 — The Call ───────────────────────────────────────────────────────
// Singapore aerial (real photo) · score tags floating over buildings · logo reveal

const SCORE_TAGS = [
  { x: 165, y: 380, score: 72, color: C.amber },
  { x: 340, y: 285, score: 88, color: C.green },
  { x: 490, y: 360, score: 65, color: C.amber },
  { x: 695, y: 235, score: 91, color: C.green },
  { x: 880, y: 330, score: 74, color: C.electricBlue },
  { x: 1090, y: 280, score: 83, color: C.green },
  { x: 1295, y: 355, score: 61, color: C.red },
  { x: 1490, y: 260, score: 77, color: C.electricBlue },
  { x: 1695, y: 335, score: 89, color: C.green },
  { x: 1590, y: 435, score: 55, color: C.red },
  { x: 1395, y: 490, score: 80, color: C.green },
  { x: 795, y: 480, score: 69, color: C.amber },
  { x: 95, y: 480, score: 78, color: C.electricBlue },
  { x: 1200, y: 440, score: 87, color: C.green },
  { x: 600, y: 420, score: 73, color: C.amber },
];

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(30, 50);

  const scoresP = interpolate(frame, [40, 350], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const logoP = interpolate(frame, [360, 540], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const logoScale = 0.72 + 0.28 * easeOutCubic(logoP);
  const ctaP = interpolate(frame, [540, 660], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Last-frame background (user-provided) — slow zoom-out reveal */}
      <KenBurns
        src={A.lastFrameBg}
        scale={[1.12, 1.0]}
        tx={[0, 0]}
        ty={[0, 0]}
        filter="brightness(0.6) saturate(1.25)"
      />

      {/* Dark overlay — stronger toward center for logo */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(4,11,22,0.1) 0%, rgba(4,11,22,0.45) 100%)",
      }} />
      <DarkOverlay gradient="linear-gradient(to bottom, rgba(4,11,22,0.5) 0%, rgba(4,11,22,0.1) 40%, rgba(4,11,22,0.1) 60%, rgba(4,11,22,0.55) 100%)" />

      {/* Score tags floating over buildings */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {SCORE_TAGS.map((tag, i) => {
          const delay = (i / SCORE_TAGS.length) * 0.5;
          const lp = clamp((scoresP - delay) / 0.5, 0, 1);
          const dy = (1 - clamp(lp * 3, 0, 1)) * 24;
          const bob = Math.sin(frame * 0.04 + i * 0.75) * 3;
          return (
            <g key={i} opacity={lp} transform={`translate(${tag.x},${tag.y + dy + bob})`}>
              <rect x={-32} y={-23} width={64} height={30} rx={8}
                fill="rgba(5,12,25,0.9)" stroke={tag.color} strokeWidth={1.2} />
              <text x={0} y={-2} textAnchor="middle"
                fill={tag.color} fontSize={16} fontWeight={800}
                fontFamily="Inter,sans-serif">
                {tag.score}
              </text>
              <line x1={0} y1={7} x2={0} y2={18} stroke={tag.color} strokeWidth={1} opacity={0.55} />
              <circle cx={0} cy={22} r={3} fill={tag.color} />
            </g>
          );
        })}
      </svg>

      {/* Central hero card */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        opacity: logoP,
        textAlign: "center",
        fontFamily,
        zIndex: 20,
      }}>
        <div style={{
          background: "rgba(4,11,22,0.95)",
          border: `1px solid rgba(0,200,255,0.25)`,
          borderRadius: 24,
          padding: "56px 84px",
          backdropFilter: "blur(32px)",
          minWidth: 640,
          boxShadow: "0 0 120px rgba(0,85,255,0.35), 0 40px 80px rgba(0,0,0,0.7)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64,
              background: `linear-gradient(135deg,${C.blue},${C.cyan})`,
              borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 36px ${C.cyan}55`,
            }}>
              <svg width={38} height={38} viewBox="0 0 38 38">
                <rect x={4} y={4} width={13} height={13} rx={2} fill="white" opacity={0.95} />
                <rect x={21} y={4} width={13} height={13} rx={2} fill="white" opacity={0.7} />
                <rect x={4} y={21} width={13} height={13} rx={2} fill="white" opacity={0.7} />
                <rect x={21} y={21} width={13} height={13} rx={2} fill="white" opacity={0.95} />
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: C.white, fontSize: 21, fontWeight: 800, letterSpacing: 0.5 }}>
                Digital Blue Foam
              </div>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase" }}>
                Property Intelligence
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 76, fontWeight: 900,
            background: `linear-gradient(135deg,${C.white} 0%,${C.cyan} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.06, marginBottom: 10, letterSpacing: -3,
          }}>
            The City, Scored.
          </div>

          <div style={{ color: C.muted, fontSize: 19, marginBottom: 32 }}>
            Liveability · Climate Risk · One API
          </div>

          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.cyan}44,transparent)`, marginBottom: 28 }} />

          {/* CTA */}
          <div style={{ opacity: ctaP, transform: `translateY(${(1 - ctaP) * 20}px)` }}>
            <div style={{ color: C.cyan, fontSize: 16, fontWeight: 600, marginBottom: 12, letterSpacing: 0.5 }}>
              digitalbluefoam.com
            </div>
            <div style={{
              display: "inline-block",
              background: `linear-gradient(135deg,${C.blue},${C.cyan})`,
              padding: "14px 38px",
              borderRadius: 10,
              color: C.white, fontSize: 16, fontWeight: 700,
              boxShadow: `0 0 36px ${C.blue}55`,
            }}>
              Contact us for a demo →
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────
const FPS = 30;
const S1 = { from: 0,        dur: 20 * FPS };  // 0–600
const S2 = { from: 20 * FPS, dur: 20 * FPS };  // 600–1200
const S3 = { from: 40 * FPS, dur: 30 * FPS };  // 1200–2100
const S4 = { from: 70 * FPS, dur: 20 * FPS };  // 2100–2700
const S5 = { from: 90 * FPS, dur: 30 * FPS };  // 2700–3600

export const DBFVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Sequence from={S1.from} durationInFrames={S1.dur}><Scene1 /></Sequence>
    <Sequence from={S2.from} durationInFrames={S2.dur}><Scene2 /></Sequence>
    <Sequence from={S3.from} durationInFrames={S3.dur}><Scene3 /></Sequence>
    <Sequence from={S4.from} durationInFrames={S4.dur}><Scene4 /></Sequence>
    <Sequence from={S5.from} durationInFrames={S5.dur}><Scene5 /></Sequence>
  </AbsoluteFill>
);
