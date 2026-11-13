import { Composition, registerRoot } from "remotion";
import { FPS, totalFrames } from "./timeline";
import { Video } from "./Video";

registerRoot(() => <Composition id="Video" component={Video} durationInFrames={totalFrames} fps={FPS} width={1920} height={1080} />);
