"use client";

// import React, { useEffect, useState } from "react";
// import { getFirestore, collection, getDocs, doc } from "firebase/firestore";
// import { useAuth } from "@/context/FirebaseContext"; // Adjust if your context is named differently

const exerciseToMuscleMap = {
  "bicep-curl": ["Biceps"],
  squat: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
  "push-up": ["Chest", "Triceps", "Shoulders", "Core"],
} as Record<string, string[]>;

// const ProgressBar = ({
//   value,
//   color = "bg-green-500",
// }: {
//   value: number;
//   color?: string;
// }) => (
//   <div className="w-full bg-gray-200 rounded-full h-2">
//     <div
//       className={`h-2 rounded-full ${color}`}
//       style={{ width: `${value}%` }}
//     />
//   </div>
// );

// import { db } from "@/lib/firebase";
// import { Pie, Bar, Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   ArcElement,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// interface SessionSummaryProps {
//   email: string;
//   sessionId: string;
// }

// const CoolSummaryPage: React.FC<SessionSummaryProps> = ({ sessionId }) => {
//   const [exercises, setExercises] = useState<any[]>([]);
//   const [workoutNames, setWorkoutNames] = useState<string[]>([]);
//   const [workoutReps, setWorkoutReps] = useState<number[]>([]);
//   const [accuracyData, setAccuracyData] = useState<number[]>([0, 0]);

//   const { user } = useAuth();
//   const email = user?.email || ""; // Use optional chaining
//   useEffect(() => {
//     if (!email || !sessionId) return;

//     const fetchExercises = async () => {
//       const exercisesRef = collection(
//         db,
//         "user_exercise_data",
//         email,
//         "sessions",
//         sessionId,
//         "exercises"
//       );
//       const snapshot = await getDocs(exercisesRef);
//       const allExercises = snapshot.docs.map((doc) => doc.data().content);
//       setExercises(allExercises);

//       const nameCount: Record<string, number> = {};
//       let correct = 0;
//       let incorrect = 0;

//       allExercises.forEach((ex) => {
//         nameCount[ex.name] =
//           (nameCount[ex.name] || 0) + ex.rep_count + ex.improper_rep_count;
//         correct += ex.rep_count;
//         incorrect += ex.improper_rep_count;
//       });

//       setWorkoutNames(Object.keys(nameCount));
//       setWorkoutReps(Object.values(nameCount));
//       setAccuracyData([correct, incorrect]);
//     };

//     fetchExercises();
//   }, [email, sessionId]);

//   const pieChartData = {
//     labels: workoutNames,
//     datasets: [
//       {
//         data: workoutReps,
//         backgroundColor: [
//           "#4ADE80",
//           "#60A5FA",
//           "#FACC15",
//           "#F472B6",
//           "#34D399",
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const donutChartData = {
//     labels: ["Correct Form", "Incorrect Form"],
//     datasets: [
//       {
//         data: accuracyData,
//         backgroundColor: ["#10B981", "#EF4444"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "bottom" as const,
//       },
//     },
//   };

//   return (
//     <div className="flex min-h-screen w-full bg-gray-900 text-white p-8">
//       <div className="max-w-6xl mx-auto w-full space-y-12">
//         <h1 className="text-4xl font-bold text-center mb-8">Session Summary</h1>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="bg-black/50 p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-semibold mb-4">
//               Exercise Distribution
//             </h2>
//             <div className="h-64">
//               <Pie data={pieChartData} options={chartOptions} />
//             </div>
//           </div>

//           <div className="bg-black/50 p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-semibold mb-4">Form Accuracy</h2>
//             <div className="h-64">
//               <Doughnut data={donutChartData} options={chartOptions} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-black/50 p-6 rounded-lg shadow-lg mt-10">
//           <h2 className="text-xl font-semibold mb-4">Exercises Performed</h2>
//           <ul className="space-y-2 text-sm">
//             {exercises.map((ex, i) => (
//               <li key={i} className="border-b border-gray-700 py-2">
//                 <strong className="capitalize">{ex.name}</strong> — ✅{" "}
//                 {ex.rep_count} &nbsp; ❌ {ex.improper_rep_count}
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CoolSummaryPage;

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "@/context/FirebaseContext";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SessionSummaryProps {
  sessionId: string;
}

const CoolSummaryPage: React.FC<SessionSummaryProps> = ({ sessionId }) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [workoutNames, setWorkoutNames] = useState<string[]>([]);
  const [workoutReps, setWorkoutReps] = useState<number[]>([]);
  const [accuracyData, setAccuracyData] = useState<number[]>([0, 0]);
  const [musclesWorked, setMusclesWorked] = useState<Set<string>>(new Set());
  const [sessionDate, setSessionDate] = useState<string>("");

  const { user } = useAuth();
  const email = user?.email || "";

  useEffect(() => {
    if (!email || !sessionId) return;

    const fetchExercises = async () => {
      const exercisesRef = collection(
        db,
        "user_exercise_data",
        email,
        "sessions",
        sessionId,
        "exercises"
      );
      const snapshot = await getDocs(exercisesRef);
      const allExercises = snapshot.docs.map((doc) => doc.data().content);
      setExercises(allExercises);

      const nameCount: Record<string, number> = {};
      let correct = 0;
      let incorrect = 0;
      const muscleSet = new Set<string>();

      allExercises.forEach((ex) => {
        nameCount[ex.name] =
          (nameCount[ex.name] || 0) + ex.rep_count + ex.improper_rep_count;
        correct += ex.rep_count;
        incorrect += ex.improper_rep_count;

        (exerciseToMuscleMap[ex.name] || []).forEach((m) => muscleSet.add(m));
      });

      setWorkoutNames(Object.keys(nameCount));
      setWorkoutReps(Object.values(nameCount));
      setAccuracyData([correct, incorrect]);
      setMusclesWorked(muscleSet);
    };

    const fetchSessionMeta = async () => {
      const metaRef = doc(
        db,
        "user_exercise_data",
        email,
        "sessions",
        sessionId
      );
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        const meta = metaSnap.data();
        setSessionDate(
          new Date(
            meta.started_at.split("-").slice(0, 3).join("-")
          ).toDateString()
        );
      }
    };

    fetchExercises();
    fetchSessionMeta();
  }, [email, sessionId]);

  const pieChartData = {
    labels: workoutNames,
    datasets: [
      {
        data: workoutReps,
        backgroundColor: [
          "#4ADE80",
          "#60A5FA",
          "#FACC15",
          "#F472B6",
          "#34D399",
          "#A78BFA",
          "#FB923C",
        ],
        borderWidth: 1,
      },
    ],
  };

  const donutChartData = {
    labels: ["Correct Form", "Incorrect Form"],
    datasets: [
      {
        data: accuracyData,
        backgroundColor: ["#10B981", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Workout Session Summary</h1>
          {sessionDate && (
            <p className="text-sm text-gray-400">{`Date: ${sessionDate}`}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Exercise Distribution
            </h2>
            <div className="h-64">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-black/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Form Accuracy</h2>
            <div className="h-64">
              <Doughnut data={donutChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-black/50 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Exercises Performed</h2>
          <ul className="space-y-2 text-sm">
            {exercises.map((ex, i) => (
              <li key={i} className="border-b border-gray-700 py-2">
                <strong className="capitalize">{ex.name}</strong> — ✅{" "}
                {ex.rep_count} reps &nbsp; ❌ {ex.improper_rep_count}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-black/50 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Muscles Worked</h2>
          {musclesWorked.size > 0 ? (
            <div className="flex flex-wrap gap-2">
              {[...musclesWorked].map((muscle) => (
                <span
                  key={muscle}
                  className="px-4 py-1 bg-blue-800/60 text-blue-300 rounded-full text-sm font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No muscles mapped for these exercises.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoolSummaryPage;
