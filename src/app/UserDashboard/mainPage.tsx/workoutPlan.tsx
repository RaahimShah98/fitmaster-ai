// app/food-tracker/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


interface personalizedWorkoutProps {
    email: string;
}

const PersonalizedWorkoutPlan: React.FC<personalizedWorkoutProps> = ({ email }) => {

    const [workoutPlan, setWorkoutPlan] = useState([])
    const getWorkoutPlan = async () => {
        const postRef = doc(db, "workout_plan", email)
        const querySnapShot = await getDoc(postRef)
        const data = querySnapShot.data()
        console.log(querySnapShot.data())
        setWorkoutPlan(data["data_base_name"]);
    }

    const [openDay, setOpenDay] = useState<string | null>(null);

    const toggleDay = (day: string) => {
        setOpenDay(openDay === day ? null : day);
    };

    useEffect(() => {
        getWorkoutPlan()
    }, [])

    useEffect(() => {
        console.log(workoutPlan)
    }, [workoutPlan])

    const groupedWorkouts = workoutPlan.reduce((acc, workout) => {
        if (!acc[workout.day]) {
            acc[workout.day] = [];
        }
        acc[workout.day].push(workout);
        return acc;
    }, {});
    return (
        <div className="min-h-screen bg-black/20 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    Weekly Workout Plan
                </h1>

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    {Object.entries(groupedWorkouts).map(([day, exercises]) => (
                        <div key={day} className="border-b border-gray-700">
                            <button
                                className="w-full text-left px-6 py-3 bg-indigo-800 text-xl font-semibold flex justify-between items-center"
                                onClick={() => toggleDay(day)}
                            >
                                {day}
                                <span>{openDay === day ? "▲" : "▼"}</span>
                            </button>
                            {openDay === day && (
                                <div className="px-4 py-2">
                                    {exercises.length === 1 && exercises[0].exercise === "Rest Day" ? (
                                        <div className="p-4 text-center text-gray-300 italic">Rest and Recovery</div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exercise</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Sets</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Reps</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {exercises.map((exercise, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-700 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{exercise.exercise}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{exercise.sets}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{exercise.reps}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-sm text-gray-400">
                    <p>Customize this plan according to your fitness level and goals.</p>
                    <p className="mt-1">Remember to warm up before each workout and stretch afterward.</p>
                </div>
            </div>
        </div>
    );
}

export default PersonalizedWorkoutPlan