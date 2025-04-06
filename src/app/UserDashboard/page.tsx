"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import ChatbotInterface from "../chatBot/chatbot";
import UserDashboardMenu from "./sideBar";
import FloatingNav from "@/components/FloatingNav";
import UserAnayltics from "./mainPage.tsx/Dashboard";
import UserSettings from "./mainPage.tsx/userSettings";
import UserGoals from "./mainPage.tsx/Goals";
import PersonalizedWorkoutPlan from "./mainPage.tsx/workoutPlan";
import PersonalizedDietPlan from "./mainPage.tsx/dietPlan";
import { useAuth } from "@/context/FirebaseContext";
import WorkoutProgress from "../workoutprogress/page";
// import { firebaseConfig } from '@/lib/firebase';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const email = user?.email || ""; // Use optional chaining
  const [selectedPage, setSelectedPage] = useState("Analytics");

  const router = useRouter();
  useEffect(() => {
    if (!user) {
      console.log("USER NOT FOUND");
      // router.push("/")
    }
  }, []);

  // console.log(firebaseConfig)
  const renderPage = () => {
    // console.log(renderPage)
    switch (selectedPage) {
      case "Analytics":
        return <UserAnayltics email={email} />;
      case "Settings":
        return <UserSettings email={email} />;
      case "Goals":
        return <UserGoals email={email} />;
      case "StartWorkout":
        return <WorkoutProgress />;

      case "UploadFood":
        router.push("/FoodTracking");
        return;
      case "workoutplan-page":
        return <PersonalizedWorkoutPlan email={email} />;
      case "diet-page":
        return <PersonalizedDietPlan email={email} />;
      default:
        return <UserAnayltics email={email} />;
    }
  };

  return (
    <div className="flex flex-row w-full">
      <FloatingNav />
      <div className=" w-full flex flow-row relative top-19 pt-16  bg-gray-800 ">
        <UserDashboardMenu setSelectedPage={setSelectedPage} />
        <div className=" w-full">{renderPage()}</div>
      </div>
      <ChatbotInterface />
    </div>
  );
};

export default UserDashboard;

// "use client";

// import React from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Legend,
//   LineChart,
//   Line,
// } from "recharts";

// const pieColors = ["#22c55e", "#ef4444", "#94a3b8"];
// const setColors = ["#60a5fa", "#f472b6", "#facc15"];

// const BeautifulDashboardPage = () => {
//   const caloriesData = [
//     { name: "Within Limit", value: 1800 },
//     { name: "Remaining Calories", value: 700 },
//   ];

//   const formAccuracy = [
//     { name: "Correct Form", value: 75 },
//     { name: "Incorrect Form", value: 25 },
//   ];

//   const setDistribution = [
//     { name: "Push-ups", value: 25 },
//     { name: "Squats", value: 40 },
//     { name: "Planks", value: 15 },
//   ];

//   const barData = [
//     { day: "Mon", value: 10 },
//     { day: "Tue", value: 20 },
//     { day: "Wed", value: 30 },
//     { day: "Thu", value: 25 },
//     { day: "Fri", value: 5 },
//     { day: "Sat", value: 15 },
//     { day: "Sun", value: 8 },
//   ];

//   const weightData = [
//     { date: "Apr 1", weight: 72 },
//     { date: "Apr 3", weight: 73 },
//     { date: "Apr 5", weight: 74 },
//   ];

//   return (
//     <div className="min-h-screen bg-[#0f172a] px-6 py-10 text-white font-sans">
//       <div className="max-w-7xl mx-auto space-y-12">
//         <h1 className="text-4xl font-bold text-center">
//           Your Weekly Fitness Dashboard
//         </h1>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Calorie Donut Chart */}
//           <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//             <h2 className="text-lg font-semibold mb-4">
//               Daily Calorie Tracking
//             </h2>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie
//                   data={caloriesData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {caloriesData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={pieColors[index % pieColors.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{ background: "#1e293b", border: "none" }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//             <p className="mt-4 text-center text-sm text-gray-400">
//               Goal: 2500 kcal
//             </p>
//           </div>

//           {/* Weight Tracker */}
//           <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//             <h2 className="text-lg font-semibold mb-4">Weight Progress</h2>
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart data={weightData}>
//                 <XAxis dataKey="date" stroke="#cbd5e1" />
//                 <YAxis stroke="#cbd5e1" domain={[70, 76]} />
//                 <Tooltip
//                   contentStyle={{ background: "#1e293b", border: "none" }}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="weight"
//                   stroke="#6366f1"
//                   strokeWidth={3}
//                   dot={{ r: 4 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Weekly Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Weekly Bar Chart */}
//           <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//             <h2 className="text-lg font-semibold mb-4">
//               Weekly Exercise Activity
//             </h2>
//             <ResponsiveContainer width="100%" height={200}>
//               <BarChart data={barData}>
//                 <XAxis dataKey="day" stroke="#cbd5e1" />
//                 <YAxis stroke="#cbd5e1" />
//                 <Tooltip
//                   contentStyle={{ background: "#1e293b", border: "none" }}
//                 />
//                 <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Set Distribution Pie */}
//           <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//             <h2 className="text-lg font-semibold mb-4">
//               Exercise Set Distribution
//             </h2>
//             <ResponsiveContainer width="100%" height={200}>
//               <PieChart>
//                 <Pie
//                   data={setDistribution}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                 >
//                   {setDistribution.map((_, i) => (
//                     <Cell key={i} fill={setColors[i % setColors.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{ background: "#1e293b", border: "none" }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Form Accuracy Donut */}
//           <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//             <h2 className="text-lg font-semibold mb-4">Form Accuracy</h2>
//             <ResponsiveContainer width="100%" height={200}>
//               <PieChart>
//                 <Pie
//                   data={formAccuracy}
//                   innerRadius={50}
//                   outerRadius={80}
//                   paddingAngle={4}
//                   dataKey="value"
//                 >
//                   {formAccuracy.map((_, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={pieColors[index % pieColors.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{ background: "#1e293b", border: "none" }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BeautifulDashboardPage;

// "use client";

// import React from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Legend,
//   LineChart,
//   Line,
//   CartesianGrid,
//   Area,
//   AreaChart,
// } from "recharts";

// const BeautifulDashboardPage = () => {
//   // Enhanced color palette
//   const pieColors = ["#10b981", "#f43f5e", "#94a3b8"];
//   const setColors = ["#3b82f6", "#ec4899", "#eab308"];
//   const gradientColors = {
//     calories: ["#10b981", "#059669"],
//     weight: ["#6366f1", "#4f46e5"],
//     activity: ["#06b6d4", "#0891b2"],
//     cardBg: "#111827",
//   };

//   const caloriesData = [
//     { name: "Within Limit", value: 1800 },
//     { name: "Remaining Calories", value: 700 },
//   ];

//   const formAccuracy = [
//     { name: "Correct Form", value: 75 },
//     { name: "Incorrect Form", value: 25 },
//   ];

//   const setDistribution = [
//     { name: "Push-ups", value: 25 },
//     { name: "Squats", value: 40 },
//     { name: "Planks", value: 15 },
//   ];

//   const barData = [
//     { day: "Mon", value: 10 },
//     { day: "Tue", value: 20 },
//     { day: "Wed", value: 30 },
//     { day: "Thu", value: 25 },
//     { day: "Fri", value: 5 },
//     { day: "Sat", value: 15 },
//     { day: "Sun", value: 8 },
//   ];

//   const weightData = [
//     { date: "Apr 1", weight: 72 },
//     { date: "Apr 3", weight: 72.5 },
//     { date: "Apr 5", weight: 74 },
//     { date: "Apr 7", weight: 73.2 },
//     { date: "Apr 9", weight: 72.8 },
//   ];

//   // Custom tooltips
//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-slate-800 p-3 rounded-md border border-slate-700 shadow-lg">
//           <p className="text-gray-300 text-sm">{`${
//             label || payload[0].name
//           }`}</p>
//           <p className="text-white font-semibold">
//             {`${payload[0].value} ${
//               payload[0].dataKey === "weight" ? "kg" : ""
//             }`}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Calculate calorie percentage
//   const caloriePercentage = Math.round((caloriesData[0].value / 2500) * 100);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 px-6 py-10 text-white font-sans">
//       <div className="max-w-7xl mx-auto space-y-12">
//         <div className="text-center space-y-2">
//           <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
//             Your Fitness Journey
//           </h1>
//           <p className="text-slate-400">
//             Weekly progress dashboard - April 2025
//           </p>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
//             <div className="text-indigo-400 mb-1">Daily Steps</div>
//             <div className="text-3xl font-bold">8,254</div>
//             <div className="text-green-400 text-xs mt-1">
//               +12% from last week
//             </div>
//           </div>
//           <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
//             <div className="text-pink-400 mb-1">Active Minutes</div>
//             <div className="text-3xl font-bold">45</div>
//             <div className="text-green-400 text-xs mt-1">+5 minutes today</div>
//           </div>
//           <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
//             <div className="text-amber-400 mb-1">Workouts</div>
//             <div className="text-3xl font-bold">5</div>
//             <div className="text-slate-400 text-xs mt-1">This week</div>
//           </div>
//           <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 flex flex-col items-center">
//             <div className="text-emerald-400 mb-1">Calories</div>
//             <div className="text-3xl font-bold">1,800</div>
//             <div className="text-blue-400 text-xs mt-1">700 remaining</div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Calorie Donut Chart - Enhanced */}
//           <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Daily Calorie Intake</h2>
//               <div className="bg-slate-700 px-3 py-1 rounded-md text-sm">
//                 <span className="text-green-400 font-medium">
//                   {caloriePercentage}%
//                 </span>{" "}
//                 of goal
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={280}>
//               <PieChart>
//                 <defs>
//                   <linearGradient
//                     id="colorCalories"
//                     x1="0"
//                     y1="0"
//                     x2="0"
//                     y2="1"
//                   >
//                     <stop
//                       offset="0%"
//                       stopColor={gradientColors.calories[0]}
//                       stopOpacity={1}
//                     />
//                     <stop
//                       offset="100%"
//                       stopColor={gradientColors.calories[1]}
//                       stopOpacity={1}
//                     />
//                   </linearGradient>
//                 </defs>
//                 <Pie
//                   data={caloriesData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={80}
//                   outerRadius={110}
//                   paddingAngle={5}
//                   dataKey="value"
//                   strokeWidth={2}
//                 >
//                   {caloriesData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={index === 0 ? "url(#colorCalories)" : pieColors[1]}
//                       stroke="rgba(255, 255, 255, 0.1)"
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="mt-4 flex justify-center items-center space-x-6">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
//                 <span className="text-sm">Consumed</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-rose-500 rounded-full mr-2"></div>
//                 <span className="text-sm">Remaining</span>
//               </div>
//             </div>
//             <p className="mt-3 text-center text-sm text-gray-400">
//               Daily Goal: 2,500 kcal
//             </p>
//           </div>

//           {/* Weight Tracker - Enhanced */}
//           <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Weight Progress</h2>
//               <div className="bg-slate-700 px-3 py-1 rounded-md text-sm">
//                 <span className="text-rose-400 font-medium">+0.8kg</span> this
//                 week
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={280}>
//               <AreaChart data={weightData}>
//                 <defs>
//                   <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
//                     <stop
//                       offset="0%"
//                       stopColor={gradientColors.weight[0]}
//                       stopOpacity={0.4}
//                     />
//                     <stop
//                       offset="100%"
//                       stopColor={gradientColors.weight[1]}
//                       stopOpacity={0.1}
//                     />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid
//                   stroke="#334155"
//                   strokeDasharray="3 3"
//                   opacity={0.3}
//                 />
//                 <XAxis
//                   dataKey="date"
//                   stroke="#cbd5e1"
//                   tick={{ fill: "#cbd5e1" }}
//                 />
//                 <YAxis
//                   stroke="#cbd5e1"
//                   domain={[70, 76]}
//                   tick={{ fill: "#cbd5e1" }}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Area
//                   type="monotone"
//                   dataKey="weight"
//                   stroke={gradientColors.weight[0]}
//                   strokeWidth={3}
//                   fill="url(#colorWeight)"
//                   dot={{
//                     r: 4,
//                     fill: gradientColors.weight[0],
//                     strokeWidth: 2,
//                     stroke: "#0f172a",
//                   }}
//                   activeDot={{
//                     r: 6,
//                     fill: "#fff",
//                     strokeWidth: 2,
//                     stroke: gradientColors.weight[0],
//                   }}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//             <div className="mt-2 flex justify-between">
//               <div className="text-center">
//                 <p className="text-xs text-gray-400">Start</p>
//                 <p className="font-medium">72kg</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-400">Current</p>
//                 <p className="font-medium">72.8kg</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-400">Goal</p>
//                 <p className="font-medium">70kg</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Weekly Stats - Enhanced */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Weekly Bar Chart */}
//           <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Weekly Activity</h2>
//               <div className="text-cyan-400 text-sm font-medium">
//                 +15% from last week
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={240}>
//               <BarChart data={barData} barSize={36}>
//                 <defs>
//                   <linearGradient
//                     id="colorActivity"
//                     x1="0"
//                     y1="0"
//                     x2="0"
//                     y2="1"
//                   >
//                     <stop
//                       offset="0%"
//                       stopColor={gradientColors.activity[0]}
//                       stopOpacity={1}
//                     />
//                     <stop
//                       offset="100%"
//                       stopColor={gradientColors.activity[1]}
//                       stopOpacity={0.6}
//                     />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid
//                   stroke="#334155"
//                   strokeDasharray="3 3"
//                   opacity={0.2}
//                   vertical={false}
//                 />
//                 <XAxis
//                   dataKey="day"
//                   stroke="#cbd5e1"
//                   tick={{ fill: "#cbd5e1" }}
//                   axisLine={false}
//                 />
//                 <YAxis
//                   stroke="#cbd5e1"
//                   tick={{ fill: "#cbd5e1" }}
//                   axisLine={false}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Bar
//                   dataKey="value"
//                   fill="url(#colorActivity)"
//                   radius={[8, 8, 0, 0]}
//                   animationDuration={1500}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Set Distribution Pie */}
//           <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Exercise Distribution</h2>
//             </div>
//             <ResponsiveContainer width="100%" height={240}>
//               <PieChart>
//                 <Pie
//                   data={setDistribution}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={90}
//                   stroke="rgba(255,255,255,0.1)"
//                   strokeWidth={2}
//                 >
//                   {setDistribution.map((_, i) => (
//                     <Cell key={i} fill={setColors[i % setColors.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend
//                   verticalAlign="bottom"
//                   height={36}
//                   formatter={(value) => (
//                     <span className="text-gray-300">{value}</span>
//                   )}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Form Accuracy Donut */}
//           <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Form Accuracy</h2>
//               <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-md text-sm font-medium">
//                 75% Correct
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={240}>
//               <PieChart>
//                 <Pie
//                   data={formAccuracy}
//                   innerRadius={70}
//                   outerRadius={90}
//                   paddingAngle={4}
//                   dataKey="value"
//                   stroke="rgba(255,255,255,0.1)"
//                   strokeWidth={2}
//                 >
//                   {formAccuracy.map((_, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={index === 0 ? pieColors[0] : pieColors[1]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="mt-4 flex justify-center items-center space-x-6">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
//                 <span className="text-sm">Correct</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-rose-500 rounded-full mr-2"></div>
//                 <span className="text-sm">Incorrect</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer with achievements */}
//         <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700/50">
//           <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-3">
//               <div className="bg-amber-500/20 p-3 rounded-full">
//                 <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
//               </div>
//               <div>
//                 <div className="font-medium">5-Day Streak</div>
//                 <div className="text-gray-400 text-sm">Keep it going!</div>
//               </div>
//             </div>
//             <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-3">
//               <div className="bg-indigo-500/20 p-3 rounded-full">
//                 <div className="w-6 h-6 bg-indigo-500 rounded-full"></div>
//               </div>
//               <div>
//                 <div className="font-medium">10K Steps</div>
//                 <div className="text-gray-400 text-sm">
//                   Reached twice this week
//                 </div>
//               </div>
//             </div>
//             <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-3">
//               <div className="bg-emerald-500/20 p-3 rounded-full">
//                 <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
//               </div>
//               <div>
//                 <div className="font-medium">Calories Goal</div>
//                 <div className="text-gray-400 text-sm">Met 4 days in a row</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BeautifulDashboardPage;
