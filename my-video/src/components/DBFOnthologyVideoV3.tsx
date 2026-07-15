// Onthology Demo — assembled from pre-cut clips + text slides
// Follows ASSEMBLY_GUIDE.md (Final) shot-for-shot.
// 1280×720 · 30fps · ~91s (2730 frames)

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// ─── PRE-CUT CLIPS ─────────────────────────────────────────────────────────────
// All files are pre-processed: map-only crop, orange accent line, vignette.
// Speed is already baked in. Play each from frame 0.
const P = "references/Sydney/Onthology series/";
const CLIP = {
  trailer: staticFile(P + "Prompts to Urban analysis.mp4"),    // 26s · played at 3× = ~8.7s
  typing:  staticFile(P + "02_question_to_heatmap.mp4"),       // 3× baked
  heatmap: staticFile(P + "03_heatmap_steady.mp4"),            // 1×
  parcelsW:staticFile(P + "04_zoom_to_parcels.mp4"),           // 2× baked
  parcelsC:staticFile(P + "05_parcels_closeup.mp4"),           // 1.5× baked
  sites:   staticFile(P + "06_candidate_sites.mp4"),           // 2× baked
  split:   staticFile(P + "07_split_traffic_terrain.mp4"),     // 1×
  siteD:   staticFile(P + "08_site_d_catchment.mp4"),          // 1.5× baked
  impact:  staticFile(P + "09_impact_dashboard.mp4"),          // 1×
} as const;

const BG     = "#0A0E17";
const ACCENT = "#FF8C00";

// ─── VIDEO CLIP ────────────────────────────────────────────────────────────────
// Plays a file from frame 0. Sequence durationInFrames trims it.
// 9-frame opacity fade in, 9-frame fade out.
// objectFit: "cover" — clips are full 16:9 UI, fills the 1280×720 frame perfectly.
const VideoClip: React.FC<{ src: string }> = ({ src }) => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();

  const fadeIn  = interpolate(f, [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [dur - 9, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeIn * fadeOut }}>
      <OffthreadVideo
        src={src}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// ─── TRAILER WITH TEXT (Shot 01) ───────────────────────────────────────────────
// Full-opacity video + title text on top. Dark scrim behind text for readability.
// Line 2 fades in 1.5s (45 frames) after Line 1.
const TrailerWithText: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();

  const cardOpacity = interpolate(
    f,
    [0, 9, dur - 9, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const line2Opacity = interpolate(f, [45, 57], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: cardOpacity }}>
      {/* Video at full opacity, 3× playback speed (26s source → ~8.7s) */}
      <OffthreadVideo
        src={CLIP.trailer}
        playbackRate={3}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Subtle centre scrim so white text stays readable over any background */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      {/* Text */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 42,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: "0 2px 20px rgba(0,0,0,0.95)",
            lineHeight: 1.25,
          }}
        >
          Onthology — Ask your City and it answers
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 20,
            fontWeight: 400,
            color: ACCENT,
            textAlign: "center",
            textShadow: "0 1px 12px rgba(0,0,0,0.95)",
            opacity: line2Opacity,
          }}
        >
          Every urban decision will run through a reasoning system
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── SPLIT SCREEN CLIP (Shot 13) ───────────────────────────────────────────────
// Video clip with two panel labels pinned to the top corners.
const SplitScreenClip: React.FC<{ src: string }> = ({ src }) => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();

  const fadeIn  = interpolate(f, [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [dur - 9, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Labels fade in slightly after clip starts so they don't clash with the cut
  const labelOpacity = interpolate(f, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelBase: React.CSSProperties = {
    position: "absolute",
    top: 20,
    fontFamily,
    fontSize: 15,
    fontWeight: 600,
    color: "#FFFFFF",
    backgroundColor: "rgba(10,14,23,0.72)",
    padding: "5px 14px",
    borderRadius: 4,
    border: `1px solid rgba(255,140,0,0.35)`,
    opacity: labelOpacity,
    maxWidth: 340,
    lineHeight: 1.3,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeIn * fadeOut }}>
      <OffthreadVideo
        src={src}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ ...labelBase, left: 20 }}>Traffic analysis</div>
      <div style={{ ...labelBase, right: 20, textAlign: "right" }}>
        Topography & Urban Heat Island analysis
      </div>
    </AbsoluteFill>
  );
};

// ─── TEXT SLIDE ────────────────────────────────────────────────────────────────
// Dark background + one or two lines of text.
// Whole card fades in/out over 10 frames each end.
// Line 2 has an optional delayed fade-in (line2DelayFrames from start of card).
const TextSlide: React.FC<{
  line1: string;
  line2?: string;
  line1Size?: number;
  line2Size?: number;
  line2Color?: string;
  line2DelayFrames?: number;
}> = ({
  line1,
  line2,
  line1Size = 40,
  line2Size = 26,
  line2Color = ACCENT,
  line2DelayFrames = 30,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();

  // Whole card opacity: fade in 0→10, hold, fade out dur-10→dur
  const cardOpacity = interpolate(
    f,
    [0, 10, dur - 10, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Line 2 fades in from line2DelayFrames (within the card)
  const line2Opacity = interpolate(
    f,
    [line2DelayFrames, line2DelayFrames + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: cardOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: line1Size,
          fontWeight: 700,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.35,
        }}
      >
        {line1}
      </div>
      {line2 && (
        <div
          style={{
            fontFamily,
            fontSize: line2Size,
            fontWeight: 400,
            color: line2Color,
            textAlign: "center",
            lineHeight: 1.4,
            opacity: line2Opacity,
          }}
        >
          {line2}
        </div>
      )}
    </AbsoluteFill>
  );
};


// ─── END CARD (Shot 18) ────────────────────────────────────────────────────────
// Three staggered lines:
//   0s  → "Onthology" (52pt white bold)
//   1.5s → "Spatial intelligence for cities" (22pt white)
//   3s  → "digitalbluefoam.com" (18pt orange)
// Fades out from 6.5s (frame 195) to 7s (frame 210).
const EndCard: React.FC = () => {
  const f = useCurrentFrame();

  const fadeIn  = interpolate(f, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [195, 210], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOpacity = fadeIn * fadeOut;

  const line2Opacity = interpolate(f, [45, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line3Opacity = interpolate(f, [90, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: cardOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div style={{ fontFamily, fontSize: 52, fontWeight: 700, color: "#FFFFFF" }}>
        Onthology
      </div>
      <div style={{ fontFamily, fontSize: 22, fontWeight: 400, color: "#FFFFFF", opacity: line2Opacity }}>
        Spatial intelligence for cities
      </div>
      <div style={{ fontFamily, fontSize: 18, fontWeight: 400, color: ACCENT, opacity: line3Opacity, marginTop: 8 }}>
        digitalbluefoam.com
      </div>
    </AbsoluteFill>
  );
};

// ─── TOTAL FRAMES ──────────────────────────────────────────────────────────────
// 260+120+240+120+150+90+210+150+120+180+120+90+180+90+180+180+270+210 = 2960
export const ONTHOLOGY_V3_TOTAL = 2960; // ~98.7s at 30fps

// ─── MAIN COMPOSITION ──────────────────────────────────────────────────────────
export const DBFOnthologyVideoV3: React.FC = () => {
  return (
    <Series>

      {/* 01 · TRAILER — "Prompts to Urban analysis.mp4" at 3× speed, full 26s clip (260f) */}
      <Series.Sequence durationInFrames={260}>
        <TrailerWithText />
      </Series.Sequence>

      {/* 02 · TEXT — The Question (4s) */}
      <Series.Sequence durationInFrames={120}>
        <TextSlide line1="Where should we build a new hospital?" line1Size={42} />
      </Series.Sequence>

      {/* 03 · VIDEO — User types → heatmap zooms in (8s, trim from ~12s clip) */}
      {/* 02_question_to_heatmap.mp4 — already at 3× */}
      <Series.Sequence durationInFrames={240}>
        <VideoClip src={CLIP.typing} />
      </Series.Sequence>

      {/* 04 · VIDEO — Completed heatmap holds (4s, trim from 7s clip) */}
      {/* 03_heatmap_steady.mp4 — 1× */}
      <Series.Sequence durationInFrames={120}>
        <VideoClip src={CLIP.heatmap} />
      </Series.Sequence>

      {/* 05 · TEXT — Gap analysis result (5s) */}
      {/* Line 2 appears 1s (30 frames) after Line 1 */}
      <Series.Sequence durationInFrames={150}>
        <TextSlide
          line1="118 districts lack healthcare access"
          line1Size={36}
          line2="43% of the city · 2.2 million people"
          line2Size={26}
          line2DelayFrames={30}
        />
      </Series.Sequence>

      {/* 06 · TEXT — Transition to parcel analysis (3s) */}
      <Series.Sequence durationInFrames={90}>
        <TextSlide
          line1="Analyzing 55,000 land parcels for coverage gaps"
          line1Size={30}
        />
      </Series.Sequence>

      {/* 07 · VIDEO — Zoom from heatmap into isochrone parcels (7s, trim from ~14s) */}
      {/* 04_zoom_to_parcels.mp4 — already at 2× */}
      <Series.Sequence durationInFrames={210}>
        <VideoClip src={CLIP.parcelsW} />
      </Series.Sequence>

      {/* 08 · VIDEO — Street-level parcel close-up (5s, trim from ~8s) */}
      {/* 05_parcels_closeup.mp4 — already at 1.5× */}
      <Series.Sequence durationInFrames={150}>
        <VideoClip src={CLIP.parcelsC} />
      </Series.Sequence>

      {/* 09 · TEXT — Parcel result + pivot to site screening (4s) */}
      {/* Line 2 appears after Line 1 */}
      <Series.Sequence durationInFrames={120}>
        <TextSlide
          line1="19,064 parcels have no healthcare access nearby"
          line1Size={32}
          line2="Screening candidate sites"
          line2Size={24}
          line2DelayFrames={30}
        />
      </Series.Sequence>

      {/* 10 · VIDEO — 5 candidate sites appear on map (6s, trim from ~9s) */}
      {/* 06_candidate_sites.mp4 — already at 2× */}
      <Series.Sequence durationInFrames={180}>
        <VideoClip src={CLIP.sites} />
      </Series.Sequence>

      {/* 11 · TEXT — Screening result (4s) */}
      {/* Line 2 appears after Line 1 */}
      <Series.Sequence durationInFrames={120}>
        <TextSlide
          line1="5 sites screened · 3 disqualified on zoning"
          line1Size={32}
          line2="2 eligible sites remain"
          line2Size={28}
          line2DelayFrames={30}
        />
      </Series.Sequence>

      {/* 12 · TEXT — Transition to parallel analysis (3s) */}
      <Series.Sequence durationInFrames={90}>
        <TextSlide line1="Running multi-layer site analysis" line1Size={30} />
      </Series.Sequence>

      {/* 13 · VIDEO — Split screen with labels: Traffic (left) + Topography/UHI (right) */}
      {/* 07_split_traffic_terrain.mp4 — 1× (6s, full clip) */}
      <Series.Sequence durationInFrames={180}>
        <SplitScreenClip src={CLIP.split} />
      </Series.Sequence>

      {/* 14 · TEXT — AI decision pivot (3s) */}
      <Series.Sequence durationInFrames={90}>
        <TextSlide line1="AI ranks all options" line1Size={34} />
      </Series.Sequence>

      {/* 15 · VIDEO — Site D label + catchment area spreads (6s, trim from ~12s) */}
      {/* 08_site_d_catchment.mp4 — already at 1.5× */}
      <Series.Sequence durationInFrames={180}>
        <VideoClip src={CLIP.siteD} />
      </Series.Sequence>

      {/* 16 · TEXT — The payoff (6s) */}
      {/* Line 2 appears 1.5s (45 frames) after Line 1 */}
      <Series.Sequence durationInFrames={180}>
        <TextSlide
          line1="Site D selected"
          line1Size={42}
          line2="812 people gain access · 35 capacity units · 1.4 ha"
          line2Size={26}
          line2DelayFrames={45}
        />
      </Series.Sequence>

      {/* 17 · VIDEO — Impact dashboard: stat cards + MCDA bars (9s, full clip) */}
      {/* 09_impact_dashboard.mp4 — 1× — extended so viewers can read the report */}
      <Series.Sequence durationInFrames={270}>
        <VideoClip src={CLIP.impact} />
      </Series.Sequence>

      {/* 18 · END CARD — Staggered 3-line brand close (7s) */}
      <Series.Sequence durationInFrames={210}>
        <EndCard />
      </Series.Sequence>

    </Series>
  );
};
