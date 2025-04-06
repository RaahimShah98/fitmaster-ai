"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
} from "recharts";
import { useAuth } from "@/context/FirebaseContext";

import { parseISO, getISOWeek, set, format } from "date-fns";
import {
  getExercisesFromSessions,
  getSessionForDaysAgo,
  fetchCalories,
} from "@/lib/utils";
import Link from "next/link";
import MuscleImageOverlay from "@/app/HumanBody/page";

const exerciseToMuscleMap: Record<string, string[]> = {
  "bicep-curl": ["Biceps"],
  squat: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
  "push-up": ["Chest", "Triceps", "Shoulders"],
};

export function generateDashboardData(exercises: any[], sessions: any[]) {
  const totalReps = exercises.reduce((sum, e) => sum + e.rep_count, 0);
  const totalBad = exercises.reduce((sum, e) => sum + e.improper_rep_count, 0);

  const formAccuracy = [
    { name: "Correct Form", value: totalReps - totalBad },
    { name: "Incorrect Form", value: totalBad },
  ];

  const distributionMap = new Map();
  exercises.forEach((e) => {
    const name = e.name
      .replace("-", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    distributionMap.set(name, (distributionMap.get(name) || 0) + 1);
  });
  const exerciseDistribution = [...distributionMap.entries()].map(
    ([name, value]) => ({ name, value })
  );

  const dayCounts = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  } as any;

  // Step 2: Count how many sessions happened each day
  const uniqueSessions = new Map(); // prevent double-counting sessions
  exercises.forEach((e) => {
    if (!uniqueSessions.has(e.sessionId)) {
      uniqueSessions.set(e.sessionId, true);
      const day = format(parseISO(e.recorded_at), "EEE"); // e.g. "Mon"
      if (dayCounts[day] !== undefined) {
        dayCounts[day]++;
      }
    }
  });

  // Step 3: Map into chart-friendly format
  const weeklyWorkout = Object.entries(dayCounts).map(([day, count]) => ({
    day,
    completed: count,
    goal: day === "Sat" || day === "Sun" ? 1 : 4,
  }));

  const formProgressMap = new Map();
  exercises.forEach((e) => {
    const day = format(parseISO(e.recorded_at), "MMM dd"); // e.g., "Apr 05"
    if (!formProgressMap.has(day)) {
      formProgressMap.set(day, { correct: 0, total: 0 });
    }
    const stats = formProgressMap.get(day);
    stats.correct += e.rep_count - e.improper_rep_count;
    stats.total += e.rep_count;
  });

  const formProgress = Array.from(formProgressMap.entries()).map(
    ([date, stats]) => ({
      date,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    })
  );

  const repQualityData = [];
  for (let i = 0; i < exercises.length; i += 3) {
    const chunk = exercises.slice(i, i + 3);
    let perfect = 0,
      good = 0,
      poor = 0;
    chunk.forEach((e) => {
      perfect += e.rep_count - e.improper_rep_count;
      if (e.improper_rep_count >= e.rep_count / 2) poor++;
      else if (e.improper_rep_count > 0) good++;
    });
    repQualityData.push({ set: `Set ${i / 3 + 1}`, perfect, good, poor });
  }

  const performanceData = [
    { metric: "Strength", value: 80 },
    { metric: "Endurance", value: 76 },
    { metric: "Flexibility", value: 65 },
    { metric: "Speed", value: 66 },
    { metric: "Balance", value: 60 },
    { metric: "Coordination", value: 69 },
  ];

  const strengthData = [
    { exercise: "Bench Press", previous: 80, current: 85 },
    { exercise: "Deadlift", previous: 120, current: 130 },
    { exercise: "Squat", previous: 100, current: 115 },
    { exercise: "Shoulder Press", previous: 50, current: 55 },
    { exercise: "Barbell Row", previous: 70, current: 75 },
  ];

  const seen = new Set();
  const recentWorkouts = exercises
    .filter((e) => {
      if (seen.has(e.sessionId)) return false;
      seen.add(e.sessionId);
      return true;
    })
    .map((e, idx) => {
      const date = new Date(e.recorded_at);
      return {
        id: idx + 1,
        name: `${e.name
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())} Session`,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: `${[30, 45, 50, 60][Math.floor(Math.random() * 4)]} min`,
        intensity: ["High", "Medium", "Very High"][
          Math.floor(Math.random() * 3)
        ],
        progress: Math.floor(Math.random() * 15) + 85,
      };
    });

  const sessionMap = new Map();
  const muscleSet = new Set<string>();

  exercises.forEach((e) => {
    const { sessionId, name, rep_count, improper_rep_count, recorded_at } = e;
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        sessionId,
        date: format(parseISO(recorded_at), "MMM dd, yyyy • h:mm a"),
        raw_date: recorded_at,
        exercises: [],
      });
    }
    (exerciseToMuscleMap[e.name] || []).forEach((m) => muscleSet.add(m));

    sessionMap.get(sessionId).exercises.push({
      name: name.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      rep_count,
      improper_rep_count,
    });
  });

  const sessionSummaries = Array.from(sessionMap.values());

  const ALL_FORM_TIPS = {
    "bicep curl": {
      tips: ["Keep elbows close", "Full range of motion", "Controlled tempo"],
      commonErrors: ["Swinging arms", "Partial reps"],
    },
    squat: {
      tips: ["Keep chest up", "Knees over toes", "Neutral spine"],
      commonErrors: ["Knees caving", "Heels lifting"],
    },
    "push up": {
      tips: ["Tight core", "45° elbow angle", "Full extension"],
      commonErrors: ["Sagging hips", "Half reps"],
    },
  } as any;

  const uniqueExercises = Array.from(
    new Set(exercises.map((e) => e.name.replace("-", " ").toLowerCase()))
  );

  console.log("UNIQUE EXERCISES: ", uniqueExercises);

  const formTips = uniqueExercises
    .map((ex) => {
      const info = ALL_FORM_TIPS[ex];
      if (!info) return null;
      return {
        exercise: ex.replace(/\b\w/g, (c) => c.toUpperCase()),
        tips: info.tips,
        commonErrors: info.commonErrors,
      };
    })
    .filter(Boolean);

  const totalWorkouts = new Set(exercises.map((e) => e.sessionId)).size;

  const totalSets = exercises.length;

  const totalImproper = exercises.reduce(
    (sum, e) => sum + e.improper_rep_count,
    0
  );
  const formScore = Math.round(((totalReps - totalImproper) / totalReps) * 100); // %

  const oneRepMaxIncrease = 8.5; // You can replace this with real logic if tracking historical 1RM

  const activeMinutes = totalSets * 9; // Roughly estimate ~9 mins per set
  return {
    formAccuracy,
    exerciseDistribution,
    weeklyWorkout,
    formProgress,
    repQualityData,
    performanceData,
    strengthData,
    recentWorkouts,
    formTips,
    sessionSummaries,
    totalWorkouts,
    totalSets,
    totalImproper,
    formScore,
    oneRepMaxIncrease,
    activeMinutes,
    musclesWorked: muscleSet,
  };
}

const BeautifulDashboardPage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const { user } = useAuth();
  const email = user?.email; // Use optional chaining
  // Enhanced color palette
  const pieColors = ["#10b981", "#f43f5e", "#94a3b8", "#3b82f6", "#f59e0b"];
  const setColors = ["#3b82f6", "#ec4899", "#eab308", "#10b981", "#8b5cf6"];
  const gradientColors = {
    strength: ["#10b981", "#059669"],
    endurance: ["#6366f1", "#4f46e5"],
    activity: ["#06b6d4", "#0891b2"],
    cardBg: "#111827",
    speed: ["#f59e0b", "#d97706"],
    form: ["#8b5cf6", "#7c3aed"],
  };

  useEffect(() => {
    if (!email) return; // Prevent running if email is not available
    console.log("EMAIL INSIDE EFFECT:", email);
    setLoading(true);
    async function fetchData() {
      const sessions = await getSessionForDaysAgo(7, email!);
      console.log("SESSIONS: ", sessions);
      const exercises = await getExercisesFromSessions(email!, sessions);
      console.log("EXERCISES: ", exercises);
      setWorkoutData(generateDashboardData(exercises, sessions));

      setLoading(false);
    }

    fetchData();
  }, [email]);

  useEffect(() => {
    if (!email) return; // Prevent running if email is not available

    const fetchCaloriesFn = async () => {
      const calories = await fetchCalories(email);
      console.log("CALORIES CONSUMED: ", calories);
      setCaloriesConsumed(calories);
    };

    fetchCaloriesFn();
  }, [email]);

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-md border border-slate-700 shadow-lg">
          <p className="text-gray-300 text-sm">{`${
            label || payload[0].name
          }`}</p>
          <p className="text-white font-semibold">
            {`${payload[0].value} ${
              payload[0].dataKey === "weight" ? "kg" : ""
            }`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Multi-value tooltip
  const MultiValueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-md border border-slate-700 shadow-lg">
          <p className="text-gray-300 text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: any) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <p className="text-gray-300 text-xs">{`${entry.name}: ${entry.value}`}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const {
    formAccuracy = [],
    exerciseDistribution = [],
    weeklyWorkout = [],
    formProgress = [],
    repQualityData = [],
    performanceData = [],
    strengthData = [],
    recentWorkouts = [],
    sessionSummaries = [],
    formTips = [],
    totalWorkouts = 0,
    totalSets = 0,
    totalImproper = 0,
    formScore = 0,
    oneRepMaxIncrease = 0,
    activeMinutes = 0,
    musclesWorked = new Set(),
  } = workoutData || {};

  const totalCalories = 2500;
  const remaining = Math.max(totalCalories - caloriesConsumed, 0);

  const donutChartDataCalories = [
    { name: "Calories Eaten", value: caloriesConsumed },
    { name: "Remaining", value: remaining },
  ];

  const donutColors = ["#10b981", "#1e293b"];

  if (loading) {
    return (
      <div className="fixed inset-0  flex flex-col items-center justify-center bg-gray-900 min-h-screen">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-white text-sm">Loading...</span>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 px-6 py-10 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Your Fitness Journey
          </h1>
          <p className="text-slate-400">
            Advanced training analytics - April 2025
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-800/50 p-1 rounded-lg inline-flex mx-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("exercises")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "exercises"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Exercise Sessions
          </button>
          {/* <button
            onClick={() => setActiveTab("form")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "form"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Form Analysis
          </button> */}
          <button
            onClick={() => setActiveTab("progression")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "progression"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Progression
          </button>

          <button
            onClick={() => setActiveTab("muscles")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "muscles"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Body & Form Insights
          </button>
        </div>

        {/* Summary Cards - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
            <div className="text-indigo-400 mb-1">Workouts</div>
            <div className="text-3xl font-bold">{totalWorkouts}</div>
            <div className="text-green-400 text-xs mt-1">+1 from last week</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
            <div className="text-pink-400 mb-1">Total Sets</div>
            <div className="text-3xl font-bold">{totalSets}</div>
            <div className="text-green-400 text-xs mt-1">+4 sets this week</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
            <div className="text-amber-400 mb-1">Form Score</div>
            <div className="text-3xl font-bold">{formScore}%</div>
            <div className="text-green-400 text-xs mt-1">+7% improvement</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
            <div className="text-emerald-400 mb-1">1RM Increase</div>
            <div className="text-3xl font-bold">{oneRepMaxIncrease}%</div>
            <div className="text-blue-400 text-xs mt-1">Since last month</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
            <div className="text-purple-400 mb-1">Active Minutes</div>
            <div className="text-3xl font-bold">{activeMinutes}</div>
            <div className="text-green-400 text-xs mt-1">This week</div>
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Workout Completion */}
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Weekly Completion</h2>
                  <div className="bg-slate-700 px-3 py-1 rounded-md text-sm">
                    <span className="text-emerald-400 font-medium">
                      {totalSets}
                    </span>{" "}
                    of 23 sets
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={weeklyWorkout} barGap={0}>
                    <CartesianGrid
                      stroke="#334155"
                      strokeDasharray="3 3"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                    />
                    <YAxis
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                      domain={[0, 5]}
                    />
                    <Tooltip content={<MultiValueTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="completed"
                      name="Completed"
                      stackId="a"
                      fill={gradientColors.activity[0]}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="goal"
                      name="Goal"
                      stackId="b"
                      fill="#334155"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="goal"
                      name="Target"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Performance Radar Chart */}

              <div className="bg-black/50 p-6 rounded-lg shadow-md w-full md:w-[100%] mb-[20px]">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Daily Calorie Tracking
                </h2>
                <div className="h-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutChartDataCalories}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={2}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={2}
                      >
                        {donutChartDataCalories.map((_, index) => (
                          <Cell
                            key={index}
                            fill={donutColors[index % donutColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                        }}
                        labelStyle={{ color: "#cbd5e1" }}
                        itemStyle={{ color: "#e2e8f0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-3xl font-bold text-white">
                      {caloriesConsumed}
                    </span>
                    <span className="text-sm text-slate-400">
                      of {totalCalories} kcal
                    </span>
                  </div>
                </div>
              </div>
              {/* <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Performance Matrix</h2>
                  <div className="bg-slate-700 px-3 py-1 rounded-md text-sm">
                    <span className="text-indigo-400 font-medium">
                      +5 points
                    </span>{" "}
                    from baseline
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} data={performanceData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "#cbd5e1" }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="value"
                      stroke={gradientColors.form[0]}
                      fill={gradientColors.form[0]}
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Exercise Distribution Pie */}
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Exercise Distribution
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={exerciseDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={2}
                      paddingAngle={3}
                    >
                      {exerciseDistribution.map((_, i) => (
                        <Cell key={i} fill={setColors[i % setColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-gray-300">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Form Accuracy Donut */}
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Form Accuracy</h2>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-md text-sm font-medium">
                    75% Correct
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={formAccuracy}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={2}
                    >
                      {formAccuracy.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? pieColors[0] : pieColors[1]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center items-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                    <span className="text-sm">Correct</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-rose-500 rounded-full mr-2"></div>
                    <span className="text-sm">Incorrect</span>
                  </div>
                </div>
              </div>

              {/* Form Progression */}
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Form Progress</h2>
                  <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-md text-sm font-medium">
                    +13% month
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={formProgress}>
                    <defs>
                      <linearGradient
                        id="colorForm"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={gradientColors.form[0]}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor={gradientColors.form[1]}
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#334155"
                      strokeDasharray="3 3"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                    />
                    <YAxis
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                      domain={[50, 80]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke={gradientColors.form[0]}
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: gradientColors.form[0],
                        strokeWidth: 2,
                        stroke: "#0f172a",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#fff",
                        strokeWidth: 2,
                        stroke: gradientColors.form[0],
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="none"
                      fill="url(#colorForm)"
                      fillOpacity={0.2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === "exercises" && (
          <>
            {/* Recent Workouts */}
            {/* <div className="grid grid-cols-1 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50">
                <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Workout
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Intensity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Completion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {recentWorkouts.map((workout) => (
                        <tr
                          key={workout.id}
                          className="hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-white">
                            {workout.name}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-300">
                            {workout.date}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-300">
                            {workout.duration}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                workout.intensity === "Very High"
                                  ? "bg-rose-500/20 text-rose-400"
                                  : workout.intensity === "High"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-emerald-500/20 text-emerald-400"
                              }`}
                            >
                              {workout.intensity}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="w-full h-2 bg-slate-700 rounded overflow-hidden mr-2">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  style={{ width: `${workout.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-300">
                                {workout.progress}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div> */}

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">
                Recent Sessions
              </h2>

              {sessionSummaries
                .sort((a, b) => {
                  const dateA = new Date(a.raw_date);
                  const dateB = new Date(b.raw_date);
                  console.log("DATE A: ", dateA, a);
                  console.log("DATE B: ", dateB, b);
                  return dateB.getTime() - dateA.getTime();
                })

                .map((session) => (
                  <div
                    key={session.sessionId}
                    className="bg-slate-800 p-6 rounded-xl shadow-md border border-slate-700/50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-slate-400">Session Date</p>
                        <p className="text-white font-semibold">
                          {session.date}
                        </p>
                      </div>
                      <Link
                        href={`/workoutSummary/${session.sessionId}`}
                        className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
                      >
                        View Session Summary
                      </Link>
                    </div>

                    <div>
                      <h3 className="text-sm text-slate-400 mb-2 font-medium">
                        Exercises Performed
                      </h3>
                      <table className="min-w-full text-left text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="py-1 pr-4 font-medium text-slate-400">
                              Exercise
                            </th>
                            <th className="py-1 pr-4 font-medium text-slate-400">
                              Reps
                            </th>
                            <th className="py-1 font-medium text-slate-400">
                              Improper
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {session.exercises.map((ex, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/30">
                              <td className="py-1 pr-4">{ex.name}</td>
                              <td className="py-1 pr-4">{ex.rep_count}</td>
                              <td className="py-1">{ex.improper_rep_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rep Quality By Set */}
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Rep Quality</h2>
                  <div className="bg-slate-700 px-3 py-1 rounded-md text-sm">
                    Last workout
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={repQualityData} barGap={0} barSize={20}>
                    <CartesianGrid
                      stroke="#334155"
                      strokeDasharray="3 3"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="set"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                    />
                    <YAxis
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                      domain={[0, 10]}
                    />
                    <Tooltip content={<MultiValueTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="perfect"
                      name="Perfect"
                      stackId="a"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="good"
                      name="Good"
                      stackId="a"
                      fill="#f59e0b"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="poor"
                      name="Poor"
                      stackId="a"
                      fill="#f43f5e"
                      radius={[0, 0, 4, 4]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Strength Progress */}
              <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Strength Progress</h2>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-md text-sm font-medium">
                    +8.5% avg
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={strengthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={20}
                    layout="vertical"
                  >
                    <CartesianGrid
                      stroke="#334155"
                      strokeDasharray="3 3"
                      opacity={0.3}
                    />
                    <XAxis
                      type="number"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="exercise"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1" }}
                      width={100}
                    />
                    <Tooltip content={<MultiValueTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="previous"
                      name="Previous"
                      fill="#4f46e5"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="current"
                      name="Current"
                      fill="#10b981"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
        {activeTab === "muscles" && (
          <>
            <div className="flex justify-center">
              <div className="bg-black/50 p-4 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-3 text-center">
                  Muscles Activated this Week
                </h2>
                <MuscleImageOverlay workedMuscles={[...musclesWorked]} />

                {musclesWorked.size > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formTips.map((entry, i) => (
                <div
                  key={i}
                  className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {entry.exercise}
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm text-emerald-400 font-medium mb-1">
                      Tips
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                      {entry.tips.map((tip, j) => (
                        <li key={j}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-rose-400 font-medium mb-1">
                      Common Errors
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                      {entry.commonErrors.map((error, k) => (
                        <li key={k}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* {activeTab === "form" && (
       
        )} */}
        {activeTab === "progression" && (
          <>
            <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">
                Form Accuracy Over Time
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={formProgress}>
                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="3 3"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#cbd5e1"
                    tick={{ fill: "#cbd5e1" }}
                  />
                  <YAxis
                    domain={[50, 80]}
                    stroke="#cbd5e1"
                    tick={{ fill: "#cbd5e1" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#8b5cf6",
                      strokeWidth: 2,
                      stroke: "#0f172a",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#fff",
                      strokeWidth: 2,
                      stroke: "#8b5cf6",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="none"
                    fill="url(#colorForm)"
                    fillOpacity={0.2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BeautifulDashboardPage;
