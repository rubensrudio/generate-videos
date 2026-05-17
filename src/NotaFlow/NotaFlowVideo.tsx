import { Audio, Sequence, staticFile } from "remotion";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Scene1Intro } from "./Scene1Intro";
import { Scene2Urgency } from "./Scene2Urgency";
import { Scene3Pain } from "./Scene3Pain";
import { Scene4Agitation } from "./Scene4Agitation";
import { Scene5Relief } from "./Scene5Relief";
import { Scene6Batch } from "./Scene6Batch";
import { Scene6bForm } from "./Scene6bForm";
import { Scene7Dashboard } from "./Scene7Dashboard";
import { Scene8Metrics } from "./Scene8Metrics";
import { Scene9MicDrop } from "./Scene9MicDrop";
import { Scene10CTA } from "./Scene10CTA";
import { SCENES } from "./constants";

export const notaFlowSchema = z.object({});

const narrations = [
  { key: "s01" as const, file: "audio/v1-s01.mp3" },
  { key: "s02" as const, file: "audio/v1-s02.mp3" },
  { key: "s03" as const, file: "audio/v1-s03.mp3" },
  { key: "s04" as const, file: "audio/v1-s04.mp3" },
  { key: "s05" as const, file: "audio/v1-s05.mp3" },
  { key: "s06" as const, file: "audio/v1-s06.mp3" },
  { key: "s06b" as const, file: "audio/v1-s06b.mp3" },
  { key: "s07" as const, file: "audio/v1-s07.mp3" },
  { key: "s08" as const, file: "audio/v1-s08.mp3" },
  { key: "s09" as const, file: "audio/v1-s09.mp3" },
  { key: "s10" as const, file: "audio/v1-s10.mp3" },
];

export const NotaFlowVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background music — starts at frame 45, low volume */}
      <Sequence from={45}>
        <Audio src={staticFile("background.mp3")} volume={0.15} />
      </Sequence>

      {/* Narration audio per scene */}
      {narrations.map(({ key, file }) => (
        <Sequence
          key={key}
          from={SCENES[key].from}
          durationInFrames={SCENES[key].duration}
        >
          <Audio src={staticFile(file)} volume={1} />
        </Sequence>
      ))}

      {/* Scene 1: Intro */}
      <Sequence from={SCENES.s01.from} durationInFrames={SCENES.s01.duration}>
        <Scene1Intro />
      </Sequence>

      {/* Scene 2: Urgency */}
      <Sequence from={SCENES.s02.from} durationInFrames={SCENES.s02.duration}>
        <Scene2Urgency />
      </Sequence>

      {/* Scene 3: Pain */}
      <Sequence from={SCENES.s03.from} durationInFrames={SCENES.s03.duration}>
        <Scene3Pain />
      </Sequence>

      {/* Scene 4: Agitation */}
      <Sequence from={SCENES.s04.from} durationInFrames={SCENES.s04.duration}>
        <Scene4Agitation />
      </Sequence>

      {/* Scene 5: Relief */}
      <Sequence from={SCENES.s05.from} durationInFrames={SCENES.s05.duration}>
        <Scene5Relief />
      </Sequence>

      {/* Scene 6: Batch */}
      <Sequence from={SCENES.s06.from} durationInFrames={SCENES.s06.duration}>
        <Scene6Batch />
      </Sequence>

      {/* Scene 6b: Form preview */}
      <Sequence from={SCENES.s06b.from} durationInFrames={SCENES.s06b.duration}>
        <Scene6bForm />
      </Sequence>

      {/* Scene 7: Dashboard */}
      <Sequence from={SCENES.s07.from} durationInFrames={SCENES.s07.duration}>
        <Scene7Dashboard />
      </Sequence>

      {/* Scene 8: Metrics */}
      <Sequence from={SCENES.s08.from} durationInFrames={SCENES.s08.duration}>
        <Scene8Metrics />
      </Sequence>

      {/* Scene 9: Mic Drop */}
      <Sequence from={SCENES.s09.from} durationInFrames={SCENES.s09.duration}>
        <Scene9MicDrop />
      </Sequence>

      {/* Scene 10: CTA */}
      <Sequence from={SCENES.s10.from} durationInFrames={SCENES.s10.duration}>
        <Scene10CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
