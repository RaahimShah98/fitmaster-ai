
import React, { useEffect, useState } from 'react';
import WeightTracker from '../charts/WeightTrackingLineChart';

// firestore
import { db } from '../../../lib/firebase';
import { doc, getDoc, getDocs, collection } from "firebase/firestore";

import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import { Pie, Bar, Doughnut } from 'react-chartjs-2';
interface UserAnalyticsProps {
    email: string;
}
// Register ChartJS components
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const UserAnayltics: React.FC<UserAnalyticsProps> = ({ email }) => {

    const [data, setData] = useState<object | null>(null);
    // const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
    const [caloriesConsumed, setCaloriesConsumed] = useState<number>(0);
    console.log("USER: ", email)

    // Fetch user Meal for today
    const getFormattedDateTime = (): string => {
        const now = new Date();

        // Get day, month, and year
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = now.getFullYear();

        // Get total minutes passed since midnight
        const totalMinutes = now.getHours() * 60 + now.getMinutes();

        return `${day}-${month}-${year}`;
    };

    const fetch_user_calories = async () => {
        const getTime = getFormattedDateTime();
        const postsRef = collection(db, "food_logs", email, getFormattedDateTime());
        console.log(postsRef)
        const querySnapshot = await getDocs(postsRef);

        const totalCalories = querySnapshot.docs.reduce((sum, doc) => { return doc.data().content.calories + sum }, 0);
        console.log("CALORIES: ", totalCalories)
        setCaloriesConsumed(totalCalories);

        const documents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("Fetched Documents:", documents);
        // const userRef = doc(db, "food_logs", email);
        // const userSnap = await getDoc(userRef);
        // if (!userSnap.exists()) {
        //     console.log("No such document!");
        // } else {
        //     console.log("Document data:", userSnap.data());
        //     setCaloriesConsumed(userSnap.data().calories);
        // }
    }

    fetch_user_calories()

    const getDocData = async (email: string) => {
        const userRef = doc(db, "user_exercise_data", email);
        // console.log("REF:" , userRef)
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("No such document!");
        } else {
            // console.log("Document data:", userSnap.data());
            console.log("HELLO")
            return userSnap.data();
        }
    }

    useEffect(() => {
        console.log("EMAIL NISIDE: ", email);

    }, []);

    // RUN AFTER EMAIL IS SET
    useEffect(() => {
        console.log("EMAIL: ", email);

        const fetchData = async () => {
            const docData = await getDocData(email); // Wait for the data
            console.log("Fetched Data:", docData);
            setData(docData);
        };

        fetchData();
    }, [email]);

    useEffect(() => {
        // console.log("DATA UPDATED:", data);

        console.log(data?.Date?.excercise.excercise_name, data?.Date?.excercise.exercise_sets)
    }, [data]);

    // Sample data for exercises sets
    const pieChartData = {
        // labels: ['Push-ups', 'Squats', 'Pull-ups', 'Lunges', 'Planks'],
        labels: data?.Date?.excercise.excercise_name,
        datasets: [{
            // data: [30, 25, 15, 20, 10],
            data: data?.Date?.excercise.exercise_sets,
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
        }],
    };

    // Calorie data

    const test = 2700

    const totalCalories = 5050; // Set the total calorie limit
    const exceededCalories = Math.max(0, caloriesConsumed - totalCalories);
    const normalCalories = Math.min(caloriesConsumed, totalCalories);
    const remainingCalories = Math.max(0, totalCalories - caloriesConsumed);

    const donutChartDataCalories = {
        labels: caloriesConsumed > totalCalories? ['Within Limit', 'Exceeded Calories', 'Remaining Calories']:['Within Limit', 'Remaining Calories'],
        datasets: [{
            data: caloriesConsumed > totalCalories
                ? [normalCalories, exceededCalories, remainingCalories]
                : [caloriesConsumed, remainingCalories],
            backgroundColor: caloriesConsumed > totalCalories
                ? ['rgba(35, 143, 102, 0.8)', 'rgb(251, 0, 54 ,0.8)', 'rgba(85, 85, 85, 0.8)']
                : ['rgba(35, 143, 102, 0.8)', 'rgb(85, 85, 85, 0.8)'],
            borderColor: caloriesConsumed > totalCalories? ['rgba(35, 143, 102, 0.8)', 'rgb(251, 0, 54 ,0.8)', 'rgba(42, 42, 42, 0.8)']:
             ['rgba(54, 162, 235, 0.8)', 'rgb(129, 125, 125 , 0.8)',],
            borderWidth: 2,
        }],
    };


    // Sample data for weekly progress
    const barChartData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Number of Exercises',
            data: [4, 5, 3, 6, 4, 2, 3],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    // Sample data for exercise accuracy
    const donutChartData = {
        labels: ['Correct Form', 'Incorrect Form'],
        datasets: [{
            data: [75, 25],
            backgroundColor: [
                'rgba(75, 192, 192, 0.8)',
                'rgba(255, 99, 132, 0.8)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    const donutOptions = {
        ...chartOptions,
        cutout: '60%',
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value} kcal`;
                    }
                }
            }
        }
    };

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Exercise Progress Dashboard</h1>

                <div className="flex flex-row  flex-wrap space-x-8 justify-start">
                    {/* Donut Chart Calories */}
                    <div className="bg-white p-6 rounded-lg shadow-md w-full mb-[20px]">
                        <h2 className="text-xl font-semibold mb-4">Daily Calorie Tracking</h2>
                        <div className="h-64 relative flex items-center justify-center">
                            <Doughnut data={donutChartDataCalories} options={donutOptions} />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <span className="text-3xl font-bold text-gray-800">{caloriesConsumed}</span>
                                <span className="text-sm text-gray-500">of {totalCalories} kcal</span>
                            </div>
                        </div>

                    </div>
                    {/* Weight Tracker */}
                    <div className="p-6  w-full mb-[20px] flex justify-center">
                        <WeightTracker></WeightTracker>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md w-[30%]">
                        <h2 className="text-xl font-semibold mb-4">Weekly Exercise Activity</h2>
                        <div className="h-64">
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md w-[30%]">
                        <h2 className="text-xl font-semibold mb-4">Exercise Sets Distribution</h2>
                        <div className="h-64">
                            <Pie data={pieChartData} options={chartOptions} />
                        </div>
                    </div>



                    {/* Donut Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md w-[30%]">
                        <h2 className="text-xl font-semibold mb-4">Exercise Form Accuracy</h2>
                        <div className="h-64">
                            <Doughnut data={donutChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnayltics;