import "./index.css";
import { Composition } from "remotion";
import { NotaFlowVideo, notaFlowSchema } from "./NotaFlow/NotaFlowVideo";
import { TOTAL_FRAMES, FPS } from "./NotaFlow/constants";
import { TestandoVideo, testandoSchema } from "./Testando/TestandoVideo";
import {
  TOTAL_FRAMES as TESTANDO_TOTAL_FRAMES,
  FPS as TESTANDO_FPS,
} from "./Testando/constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NotaFlow"
        component={NotaFlowVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        schema={notaFlowSchema}
        defaultProps={{}}
      />
      <Composition
        id="Testando"
        component={TestandoVideo}
        durationInFrames={TESTANDO_TOTAL_FRAMES}
        fps={TESTANDO_FPS}
        width={1920}
        height={1080}
        schema={testandoSchema}
        defaultProps={{}}
      />
    </>
  );
};
