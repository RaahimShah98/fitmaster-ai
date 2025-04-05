import { SpeechProvider } from "@/context/SpeechContext";
// import LiveStream from "./liveStream";
import { default as WorkoutProgressComponent } from "./oldPage";

const WorkoutProgress = () => {
  return (
    <SpeechProvider>
      <WorkoutProgressComponent />
    </SpeechProvider>
  );
};

export default WorkoutProgress;
