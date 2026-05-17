import "./index.css";
import { Composition } from "remotion";
import { NotaFlowVideo, notaFlowSchema } from "./NotaFlow/NotaFlowVideo";
import { TOTAL_FRAMES, FPS } from "./NotaFlow/constants";

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
    </>
  );
};
