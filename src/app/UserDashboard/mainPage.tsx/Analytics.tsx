
import React, { useEffect, useState } from 'react';
import WeightTracker from '../charts/WeightTrackingLineChart';
import { useAuth } from '@/context/FirebaseContext';

// firestore
import { db } from '../../../lib/firebase';
import { doc, getDoc } from "firebase/firestore";

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

const UserAnayltics = () => {
    const { user } = useAuth();
    const email = user?.email;
    // const [email, setEmail] = useState<string | null>(null);
    const [data, setData] = useState<object | null>(null);
    console.log("USER: ", user?.email)


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
    const totalCalorieGoal = 2000;
    const caloriesConsumed = 1500;
    const remainingCalories = totalCalorieGoal - caloriesConsumed;

    const donutChartDataCalories = {
        labels: ['Calories Consumed', 'Remaining Calories'],
        datasets: [{
            data: [caloriesConsumed, remainingCalories],
            backgroundColor: [
                'rgba(75, 192, 192, 0.8)', // Consumed calories - teal
                'rgba(238, 238, 238, 0.8)', // Remaining calories - light gray
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(238, 238, 238, 1)',
            ],
            borderWidth: 1,
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
        cutout: '70%',
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
                        <div className="h-64 relative">
                            <Doughnut data={donutChartDataCalories} options={donutOptions} />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-bold text-gray-800">{caloriesConsumed}</span>
                                <span className="text-sm text-gray-500">of {totalCalorieGoal} kcal</span>
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