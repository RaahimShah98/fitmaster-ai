"use client"
import React from "react"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { getDocs, collection, doc, getDoc } from "firebase/firestore"
import DateDropdownMenu from "@/components/mealDisplay/DropDown"
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MealInterface {
    email: string
}

interface FoodItem {
    id: string;
    time: string;
    content: {
        name: string;
        calories: number;
        macros: any;
        micros: any;
    };
}

interface ExpandedMeals {
    [mealType: string]: boolean;
}

const MealDisplay: React.FC<MealInterface> = ({ email }) => {
    const [dates, setDates] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [foods, setFoods] = useState<FoodItem>()
    const [groupedFoods, setGroupedFoods] = useState<Record<string, any[]>>({});
    const [expandedMeals, setExpandedMeals] = useState<ExpandedMeals>({
        breakfast: false,
        lunch: false,
        dinner: false
    });

    const toggleMealExpansion = (mealType: string) => {
        setExpandedMeals(prev => ({
            ...prev,
            [mealType]: !prev[mealType]
        }));
    };



    const sortDatesAscending = (dateStrings: string[]) => {
        return dateStrings.sort((a, b) => {
            const [dayA, monthA, yearA] = a.split("-").map(Number);
            const [dayB, monthB, yearB] = b.split("-").map(Number);

            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);

            return dateB.getTime() - dateA.getTime();
        });
    };

    const getUserFoodLogDates = async () => {
        if (!email) return

        try {
            const postRef = collection(db, "food_logs", email, "foods")
            const userDocSnap = await getDocs(postRef)

            if (userDocSnap.empty) {
                console.log("No such document!");
                return;
            }
            const fetchedDates = sortDatesAscending(userDocSnap.docs.map((doc) => doc.id)); // getFormattedDateTime() values
            console.log("Fetched Dates:", fetchedDates);

            setDates(fetchedDates);

        } catch (e) {
            console.log(e.message)
        }
    }


    // Handle Date Change
    const handleDateChange = (date: string) => {
        console.log('Selected date:', date);
        setSelectedDate(date)
    }

    //Get Food Docs
    const getFoodDocs = async (selectedDate: string) => {
        if (!email) return;

        try {
            const postRef = collection(db, "food_logs", email, "foods", selectedDate, "foods_eaten");
            const userDocSnap = await getDocs(postRef);

            if (userDocSnap.empty) {
                console.log("No such document!");
                setGroupedFoods({});
                return;
            }

            const fetchedFoods = userDocSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const formatted = getFormattedFoods(fetchedFoods);
            setGroupedFoods(formatted);

        } catch (e: any) {
            console.log("Error fetching food docs:", e.message);
        }
    };


    // Format Foods in the right sequence
    const getFormattedFoods = (foods: any[]) => {
        const grouped = foods.reduce((acc: Record<string, any[]>, food) => {
            let hour = parseInt(food.time.split(":")[0]); // Extract hour from "HH:mm"

            let mealTime = "";
            if (hour >= 5 && hour < 12) {
                mealTime = "breakfast";
            } else if (hour >= 12 && hour < 17) {
                mealTime = "lunch";
            } else if (hour >= 17 && hour <= 23) {
                mealTime = "dinner";
            } else {
                mealTime = "late-night"; // Optional: handle 12 AM - 4:59 AM
            }

            if (!acc[mealTime]) acc[mealTime] = [];
            acc[mealTime].push(food);

            return acc;
        }, {});

        console.log(grouped);
        return grouped;
    };



    useEffect(() => {
        getUserFoodLogDates()
    }, [email])

    useEffect(() => {
        console.log(dates)
        setSelectedDate(dates[0])
    }, [dates])

    useEffect(() => {
        getFoodDocs(selectedDate)
    }, [selectedDate])

    const calculateMealCalories = (foods: FoodItem[]): number => {
        return foods.reduce((sum, food) => sum + food.content.calories, 0);
    };

    const calculateTotalCalories = (): number => {
        return Object.values(groupedFoods)
            .flat()
            .reduce((sum, food) => sum + food.content.calories, 0);
    };


    return (
        <div className="min-h-screen bg-black/90 py-12 px-4 sm:px-6 lg:px-8 text-white flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">Food Logs</h1>

                <div className="mb-8 flex justify-center">
                    <DateDropdownMenu
                        dates={dates}
                        placeholder="Select a date"
                        onChange={handleDateChange}
                    />
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full border-collapse bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                        <thead>
                            <tr className="bg-blue-900">
                                <th className="p-4 text-left w-2/4">Food Item</th>
                                <th className="p-4 text-right w-1/4">Calories</th>
                                <th className="p-4 text-right w-1/4">Daily: {calculateTotalCalories()} kcal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedFoods).map(([mealType, foods]) => (
                                <React.Fragment key={mealType}>
                                    <tr
                                        className="border-t border-gray-800 bg-gray-800 cursor-pointer hover:bg-gray-700"
                                        onClick={() => toggleMealExpansion(mealType)}
                                    >
                                        <td className="p-3 font-bold text-blue-300 uppercase flex items-center">
                                            {expandedMeals[mealType] ?
                                                <ChevronUp className="mr-2" size={16} /> :
                                                <ChevronDown className="mr-2" size={16} />
                                            }
                                            {mealType}
                                        </td>
                                        <td className="p-3 text-right">{calculateMealCalories(foods)} kcal</td>
                                        <td className="p-3 text-right">
                                            {Math.round(calculateMealCalories(foods) / calculateTotalCalories() * 100)}%
                                        </td>
                                    </tr>

                                    {expandedMeals[mealType] && (
                                        <>
                                            {foods.map((food) => (
                                                <tr key={food.id} className="border-t border-gray-800 hover:bg-gray-800">
                                                    <td className="p-3 pl-8">{food.content.name}</td>
                                                    <td className="p-3 text-right">{food.content.calories} kcal</td>
                                                    <td className="p-3"></td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MealDisplay