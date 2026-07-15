import "./index.css";
import { Composition, getStaticFiles } from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { DBFVideo } from "./components/DBFVideo";
import { DBFWelcomeVideo } from "./components/DBFWelcomeVideo";
import { DBFSydneyVideo, GIF1Video, GIF2Video } from "./components/DBFSydneyVideo";
import { DBFOntologyVideo } from "./components/DBFOntologyVideo";
import { DBFOnthologyVideo } from "./components/DBFOnthologyVideo";
import { DBFOnthologyVideoV2 } from "./components/DBFOnthologyVideoV2";
import { DBFOnthologyVideoV3, ONTHOLOGY_V3_TOTAL } from "./components/DBFOnthologyVideoV3";
import { MiningVideo } from "./components/MiningVideo";
import { ThesisVideo } from "./components/ThesisVideo";
import { ThesisNewsNode } from "./components/ThesisNewsNode";
import { FPS, INTRO_DURATION } from "./lib/constants";
import { getTimelinePath, loadTimelineFromFile } from "./lib/utils";

export const RemotionRoot: React.FC = () => {
  const staticFiles = getStaticFiles();
  const timelines = staticFiles
    .filter((file) => file.name.endsWith("timeline.json"))
    .map((file) => file.name.split("/")[1]);

  return (
    <>
      {/* Digital Blue Foam — Welcome & Intro Video (1920×1080, 2 min) */}
      <Composition
        id="dbf-welcome"
        component={DBFWelcomeVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={120 * 30}
        defaultProps={{}}
      />

      {/* Digital Blue Foam — Sydney City Brain (1920×1080, 2 min 15 s) */}
      <Composition
        id="dbf-sydney"
        component={DBFSydneyVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={4050}
        defaultProps={{}}
      />

      {/* GIF 1 — Scene5C crop, absolute frames 2685–2978 */}
      <Composition
        id="gif-1"
        component={GIF1Video}
        fps={30}
        width={1332}
        height={782}
        durationInFrames={293}
        defaultProps={{}}
      />

      {/* GIF 2 — Scene5D crop, absolute frames 3153–3440 */}
      <Composition
        id="gif-2"
        component={GIF2Video}
        fps={30}
        width={1332}
        height={782}
        durationInFrames={287}
        defaultProps={{}}
      />

      {/* DBF Ontology — Product Launch (1920×1080, 2 min) */}
      <Composition
        id="dbf-ontology"
        component={DBFOntologyVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={3600}
        defaultProps={{}}
      />

      {/* DBF Onthology — Speed-Ramp Cut (1920×1080, ~2:00) */}
      <Composition
        id="dbf-onthology-short"
        component={DBFOnthologyVideoV2}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={3598}
        defaultProps={{}}
      />

      {/* DBF Onthology — Shot-by-shot edit v3 (1280×720, ~78s) */}
      <Composition
        id="dbf-onthology-v3"
        component={DBFOnthologyVideoV3}
        fps={30}
        width={1280}
        height={720}
        durationInFrames={ONTHOLOGY_V3_TOTAL}
        defaultProps={{}}
      />

      {/* DBF Onthology — Full Demo Video (1920×1080, ~3:36) */}
      <Composition
        id="dbf-onthology"
        component={DBFOnthologyVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={6477}
        defaultProps={{}}
      />

      {/* Digital Blue Foam — "The City, Scored." (1920×1080, 2 min) */}
      <Composition
        id="dbf-city-scored"
        component={DBFVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={120 * 30}
        defaultProps={{}}
      />

      {/* Thesis — Vintage Documentary: Climate Change 1958–2026 */}
      <Composition
        id="thesis-archival"
        component={ThesisVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={1800}
        defaultProps={{}}
      />

      {/* Thesis — Miro-board camera pan through news archive */}
      <Composition
        id="thesis-newsnode"
        component={ThesisNewsNode}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={1140}
        defaultProps={{}}
      />

      {/* Mining Facility Generative Layout Tool — 2-minute demo */}
      <Composition
        id="mining-layout-demo"
        component={MiningVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={120 * 30}
        defaultProps={{}}
      />

      {timelines.map((storyName) => (
        <Composition
          key={storyName}
          id={storyName}
          component={AIVideo}
          fps={FPS}
          width={1080}
          height={1920}
          schema={aiVideoSchema}
          defaultProps={{
            timeline: null,
          }}
          calculateMetadata={async ({ props }) => {
            const { lengthFrames, timeline } = await loadTimelineFromFile(
              getTimelinePath(storyName),
            );

            return {
              durationInFrames: lengthFrames + INTRO_DURATION,
              props: {
                ...props,
                timeline,
              },
            };
          }}
        />
      ))}
    </>
  );
};
