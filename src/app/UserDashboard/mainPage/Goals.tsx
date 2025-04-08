import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WeightTracker from '../charts/WeightTrackingLineChart';
import AddWeight from '../charts/addWeight';
interface goalsProps {
    email: string;
}
const UserGoals: React.FC<goalsProps> = ({ email }) => {

    const [addWeight, setAddWeight] = useState<boolean>(false);

    useEffect(() => {
        if (addWeight) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [addWeight]);

    return (
        <div className='flex flex-col w-full items-center justify-center min-h-screen'>
            <h1>Track Your weight</h1>
            <div className='flex justify-start flex-row'>
                {addWeight && <AddWeight email={email} close={setAddWeight} />}
                <button
                    onClick={() => setAddWeight(true)}
                    className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition mb-6 min-w-screen"
                >
                    Add Weight
                </button>
            </div>
            <div className="bg-black/50 p-4 rounded-lg shadow-md w-full md:w-[100%] mb-[20px] overflow-hidden">

                <WeightTracker email={email} />
            </div>
        </div>
    );
};

export default UserGoals;