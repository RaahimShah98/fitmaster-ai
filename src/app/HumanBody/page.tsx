import React from "react";

const musclePositionMap: Record<string, { top: string; left: string }[]> = {
  Biceps: [
    { top: "25%", left: "26.75%" },
    { top: "25%", left: "67%" },
  ],
  Chest: [
    { top: "20%", left: "38%" },
    { top: "20%", left: "55%" },
  ],
  Triceps: [
    { top: "25%", left: "21%" },
    { top: "25%", left: "72%" },
  ],
  Shoulders: [
    { top: "14%", left: "30%" },
    { top: "14%", left: "65%" },
  ],
  Quadriceps: [
    { top: "57%", left: "35%" },
    { top: "57%", left: "57%" },
  ],
  Glutes: [
    { top: "57%", left: "42%" },
    { top: "57%", left: "50%" },
  ],
  // Hamstrings: [{ top: "68%", left: "25%" }],
  Core: [
    { top: "32%", left: "42%" },
    { top: "32%", left: "52%" },
  ],
};

interface MuscleImageOverlayProps {
  workedMuscles: string[];
}

const MuscleImageOverlay: React.FC<MuscleImageOverlayProps> = ({
  workedMuscles = [
    "Biceps",
    "Chest",
    "Triceps",
    "Shoulders",
    "Quads",
    "Glutes",
    // "Hamstrings",
    "Core",
  ],
}) => {
  return (
    <div className="relative w-[300px] h-[450px] mx-auto">
      <img
        src="/muscles.png"
        alt="Muscle Map"
        className="w-full h-full object-contain"
      />

      {workedMuscles.map((muscle) => {
        const pos = musclePositionMap[muscle];
        if (!pos) return null;

        return pos.map((position, index) => (
          <div
            key={`${muscle}-${index}`}
            className="absolute w-5 h-5 rounded-full bg-green-400 border-2 border-white shadow-md animate-pulse"
            style={{ top: position.top, left: position.left }}
            title={muscle}
          />
        ));
      })}
    </div>
  );
};

export default MuscleImageOverlay;
