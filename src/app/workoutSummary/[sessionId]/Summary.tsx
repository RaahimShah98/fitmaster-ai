"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { db } from "@/lib/firebase";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/FirebaseContext";

const exerciseToMuscleMap: Record<string, string[]> = {
  "bicep-curl": ["Biceps"],
  squat: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
  "push-up": ["Chest", "Triceps", "Shoulders"],
};

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
  const [formTrend, setFormTrend] = useState<any[]>([]);

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

      const trendData: any[] = [];

      allExercises.forEach((ex, i) => {
        nameCount[ex.name] =
          (nameCount[ex.name] || 0) + ex.rep_count + ex.improper_rep_count;
        correct += ex.rep_count;
        incorrect += ex.improper_rep_count;

        trendData.push({
          set: `Set ${i + 1}`,
          accuracy: Math.round(
            (ex.rep_count / (ex.rep_count + ex.improper_rep_count)) * 100
          ),
        });

        (exerciseToMuscleMap[ex.name] || []).forEach((m) => muscleSet.add(m));
      });

      setWorkoutNames(Object.keys(nameCount));
      setWorkoutReps(Object.values(nameCount));
      setAccuracyData([correct, incorrect]);
      setMusclesWorked(muscleSet);
      setFormTrend(trendData);
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
          ).toLocaleString()
        );
      }
    };

    fetchExercises();
    fetchSessionMeta();
  }, [email, sessionId]);

  const pieColors = [
    "#4ADE80",
    "#60A5FA",
    "#FACC15",
    "#F472B6",
    "#34D399",
    "#A78BFA",
    "#FB923C",
  ];
  const donutColors = ["#10B981", "#EF4444"];

  const exercisePieData = workoutNames.map((name, idx) => ({
    name,
    value: workoutReps[idx],
  }));

  const formAccuracyData = [
    { name: "Correct Form", value: accuracyData[0] },
    { name: "Incorrect Form", value: accuracyData[1] },
  ];

  const totalReps = accuracyData[0] + accuracyData[1];
  const accuracyPercent = totalReps
    ? Math.round((accuracyData[0] / totalReps) * 100)
    : 0;

  return (
    <div className="flex min-h-screen w-full bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Workout Session Summary</h1>
          {sessionDate && (
            <p className="text-sm text-gray-400">Date: {sessionDate}</p>
          )}
          <p className="text-slate-400 text-sm mt-1 italic">
            Form Score:{" "}
            <span className="text-white font-semibold">{accuracyPercent}%</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Exercise Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exercisePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                  >
                    {exercisePieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-black/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Form Accuracy</h2>
            <div className="h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formAccuracyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={4}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                  >
                    {formAccuracyData.map((_, index) => (
                      <Cell key={index} fill={donutColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-3xl font-bold text-white">
                  {accuracyData[0]}
                </div>
                <div className="text-sm text-gray-400">of {totalReps} reps</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/50 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Form Accuracy per Set</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="set"
                  stroke="#cbd5e1"
                  tick={{ fill: "#cbd5e1" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#cbd5e1"
                  tick={{ fill: "#cbd5e1" }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10B981"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
