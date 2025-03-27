// app/food-tracker/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


interface PersonalizedDietPlan {
    email: string;
}

const PersonalizedDietPlan: React.FC<PersonalizedDietPlan> = ({ email }) => {

    const [DietPlan, setDietPlan] = useState([])
    const [openDay, setOpenDay] = useState<string | null>(null);

    const toggleDay = (day: string) => {
        setOpenDay(openDay === day ? null : day);
    };

    const getDietPlan = async () => {
        const postRef = doc(db, "diet_plan", email)
        const querySnapShot = await getDoc(postRef)
        const data = querySnapShot.data()
        console.log(querySnapShot.data())
        setDietPlan(data["data_base_name"]);
    }

    useEffect(() => {
        getDietPlan()
    }, [])

    useEffect(() => {
        console.log(DietPlan)
    }, [DietPlan])

    const groupedDiets = DietPlan.reduce((acc, Diet) => {
        if (!acc[Diet.day]) {
            acc[Diet.day] = [];
        }
        acc[Diet.day].push(Diet);
        return acc;
    }, {});

    return (
        // <div className="min-h-screen bg-black/20 py-12 px-4 sm:px-6 lg:px-8 text-white">
        //     <div className="max-w-4xl mx-auto">
        //         <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        //             Weekly Diet Plan
        //         </h1>

        //         <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        //             <div className="grid grid-cols-1 gap-4 sm:gap-0 sm:divide-y divide-gray-700">
        //                 {Object.entries(groupedDiets).map(([day, dietPlan]) => (
        //                     <div key={day} className="p-0">
        //                         <div className="bg-indigo-800 px-6 py-3">
        //                             <h2 className="text-xl font-semibold">{day}</h2>
        //                         </div>

        //                         <div className="px-4 py-2">
        //                             {dietPlan.length === 1 && dietPlan[0].exercise === "Rest Day" ? (
        //                                 <div className="p-4 text-center text-gray-300 italic">Rest and Recovery</div>
        //                             ) : (
        //                                 <table className="min-w-full divide-y divide-gray-700">
        //                                     <thead>
        //                                         <tr>
        //                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[75%]">Food</th>
        //                                             <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[25%]">Calores/100g</th>
        //                                         </tr>
        //                                     </thead>
        //                                     <tbody className="divide-y divide-gray-700">
        //                                         {dietPlan.map((exercise, idx) => (
        //                                             <tr key={idx} className="hover:bg-gray-700 transition-colors">
        //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[75%]">{exercise.food}</td>
        //                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-center w-[25%]">{exercise.calories_per_100g}</td>
        //                                             </tr>
        //                                         ))}
        //                                     </tbody>
        //                                 </table>
        //                             )}
        //                         </div>
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>

        //     </div>
        // </div>
        <div className="min-h-screen bg-black/20 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    Weekly Diet Plan
                </h1>

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    {Object.entries(groupedDiets).map(([day, dietPlan]) => (
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
                                    {dietPlan.length === 1 && dietPlan[0].exercise === "Rest Day" ? (
                                        <div className="p-4 text-center text-gray-300 italic">Rest and Recovery</div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[75%]">Food</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[25%]">Calores/100g</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {dietPlan.map((exercise, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-700 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[75%]">{exercise.food}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center w-[25%]">{exercise.calories_per_100g}</td>
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
            </div>
        </div>
    );
}

export default PersonalizedDietPlan