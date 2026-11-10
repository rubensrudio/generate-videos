import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { z } from "zod";
import { SCENES, type SceneKey } from "./constants";
import { Scene1Intro } from "./Scene1Intro";
import { Scene2Signups } from "./Scene2Signups";
import { Scene3Pain } from "./Scene3Pain";
import { Scene4Complexity } from "./Scene4Complexity";
import { Scene5Relief } from "./Scene5Relief";
import { Scene6Templates } from "./Scene6Templates";
import { Scene6bEmailPreview } from "./Scene6bEmailPreview";
import { Scene7Automation } from "./Scene7Automation";
import { Scene8Metrics } from "./Scene8Metrics";
import { Scene9MicDrop } from "./Scene9MicDrop";
import { Scene10CTA } from "./Scene10CTA";

export const testandoSchema = z.object({});

const SCENE_COMPONENTS: Record<SceneKey, React.FC<{ duration: number }>> = {
  s01: Scene1Intro,
  s02: Scene2Signups,
  s03: Scene3Pain,
  s04: Scene4Complexity,
  s05: Scene5Relief,
  s06: Scene6Templates,
  s06b: Scene6bEmailPreview,
  s07: Scene7Automation,
  s08: Scene8Metrics,
  s09: Scene9MicDrop,
  s10: Scene10CTA,
};

export const TestandoVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background music — starts at frame 45, low volume */}
      <Sequence from={45}>
        <Audio src={staticFile("background.mp3")} volume={0.15} />
      </Sequence>

      {(Object.keys(SCENES) as SceneKey[]).map((key) => {
        const { from, duration } = SCENES[key];
        const Scene = SCENE_COMPONENTS[key];
        return (
          <Sequence key={key} from={from} durationInFrames={duration} name={key}>
            <Scene duration={duration} />
            <Audio src={staticFile(`audio/testando/v1-${key}.mp3`)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
