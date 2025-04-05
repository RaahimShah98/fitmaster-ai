// "use client";

// import React, { useEffect, useState } from "react";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
// import { useAuth } from "@/context/FirebaseContext";

// const ProgressBar = ({
//   value,
//   className,
// }: {
//   value: number;
//   className: string;
// }) => (
//   <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
//     <div
//       className="h-2 rounded-full bg-green-500 transition-all "
//       style={{ width: `${value}%` }}
//     />
//   </div>
// );

// const exerciseToMuscleMap = {
//   "bicep-curl": ["Biceps"],
//   squat: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
//   "push-up": ["Chest", "Triceps", "Shoulders", "Core"],
// } as Record<string, string[]>;

// type WorkoutEntry = {
//   name: string;
//   rep_count: number;
//   improper_rep_count: number;
// };

// type WorkoutSession = {
//   sessionId: string;
//   exercises: WorkoutEntry[];
// };

// export default function WorkoutSummary() {
//   const db = getFirestore();
//   const { user } = useAuth(); // get the email/user ID from auth
//   const [sessions, setSessions] = useState<WorkoutSession[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchWorkoutData = async () => {
//       if (!user?.email) return;
//       setLoading(true);

//       const userRef = collection(db, "user_exercise_data", user.email);
//       const sessionSnaps = await getDocs(userRef);

//       const fetchedSessions: WorkoutSession[] = [];
//       console.log(sessionSnaps.docs);
//       for (const sessionDoc of sessionSnaps.docs) {
//         const sessionId = sessionDoc.id;
//         const exercisesSnap = await getDocs(collection(userRef, sessionId));
//         const exercises: WorkoutEntry[] = [];

//         exercisesSnap.forEach((doc) => {
//           const data = doc.data().content;
//           exercises.push({
//             name: data.name,
//             rep_count: data.rep_count,
//             improper_rep_count: data.improper_rep_count,
//           });
//         });

//         fetchedSessions.push({ sessionId, exercises });
//       }

//       setSessions(fetchedSessions);
//       setLoading(false);
//     };

//     fetchWorkoutData();
//   }, [db, user]);

//   if (loading)
//     return <div className="text-center py-10">Loading workout summary...</div>;

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Workout Summary</h1>
//       {sessions.map((session) => (
//         <div
//           key={session.sessionId}
//           className="mb-8 p-6 rounded-xl shadow-md border bg-white"
//         >
//           <h2 className="text-xl font-semibold mb-4">
//             Session: {new Date(session.sessionId).toLocaleString()}
//           </h2>
//           <div className="space-y-4">
//             {session.exercises.map((exercise, index) => {
//               const total = exercise.rep_count + exercise.improper_rep_count;
//               const correctPct = (exercise.rep_count / total) * 100;
//               const incorrectPct = (exercise.improper_rep_count / total) * 100;

//               return (
//                 <div key={index} className="p-4 rounded-lg bg-gray-50 border">
//                   <div className="flex justify-between mb-1">
//                     <span className="font-medium">
//                       {exercise.name} (
//                       {exerciseToMuscleMap[exercise.name] || "Unknown Muscle"})
//                     </span>
//                     <span className="text-sm text-gray-500">
//                       {total} reps total
//                     </span>
//                   </div>
//                   <div className="mb-1">
//                     <span className="text-green-600 text-sm">
//                       Correct: {exercise.rep_count}
//                     </span>{" "}
//                     &nbsp;
//                     <span className="text-red-600 text-sm">
//                       Incorrect: {exercise.improper_rep_count}
//                     </span>
//                   </div>
//                   <div className="mb-1">
//                     <ProgressBar
//                       value={correctPct}
//                       className="h-2 bg-green-200"
//                     />
//                     <ProgressBar
//                       value={incorrectPct}
//                       className="h-2 mt-1 bg-red-200"
//                     />
//                   </div>
//                   <div className="text-xs text-gray-600">
//                     {correctPct >= 80
//                       ? "Great form! Keep it up."
//                       : incorrectPct >= 30
//                       ? "Focus on improving form for this exercise."
//                       : "Solid effort, some room to improve."}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Summary by muscle */}
//           <div className="mt-6 pt-4 border-t">
//             <h3 className="font-semibold mb-2 text-lg">Muscles Worked</h3>
//             <div className="flex flex-wrap gap-2">
//               {Array.from(
//                 new Set(
//                   session.exercises.map(
//                     (ex) => exerciseToMuscleMap[ex.name] || "Unknown"
//                   )
//                 )
//               ).map((muscles) => (
//                 <span
//                   key={muscles.toString()}
//                   className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
//                 >
//                   {muscles}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Next Steps */}
//           <div className="mt-4">
//             <h3 className="font-semibold text-lg mb-1">Next Steps</h3>
//             <ul className="list-disc list-inside text-sm text-gray-700">
//               <li>
//                 Try a different variation of the most challenging exercise.
//               </li>
//               <li>Stretch the muscles worked in this session.</li>
//               <li>
//                 Log how you felt today and adjust your next workout intensity.
//               </li>
//             </ul>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
