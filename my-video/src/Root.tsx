import "./index.css";
import { Composition, getStaticFiles } from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { DBFVideo } from "./components/DBFVideo";
import { DBFWelcomeVideo } from "./components/DBFWelcomeVideo";
import { DBFSydneyVideo } from "./components/DBFSydneyVideo";
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
