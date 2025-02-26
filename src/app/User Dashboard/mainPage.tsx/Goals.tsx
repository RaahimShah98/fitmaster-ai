import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WeightTracker from '../charts/WeightTrackingLineChart';

const UserGoals: React.FC = () => {
    return (
        <div className='flex flex-col w-full items-center justify-center min-h-screen'>
            <WeightTracker />
            <div className='mt-[10px] w-full flex justify-center'>
                <Card className="w-full max-w-2xl p-[5px] pt-[10px] pl-[10[x]">
                    <CardTitle>Weight Goals</CardTitle>
                    John Doe
                    <CardContent>
                        <p>Last Weight Recorded: 80kgs</p>
                        <div className="mt-4">
                            <label htmlFor="currentWeight" className="block text-sm font-medium text-gray-700">
                                Current Weight(KG)
                            </label>
                            <input
                                type="number"
                                id="currentWeight"
                                name="currentWeight"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter your current weight"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="weightGoal" className="block text-sm font-medium text-gray-700">
                                Weight Goal(KG)
                            </label>
                            <input
                                type="number"
                                id="weightGoal"
                                name="weightGoal"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter your weight goal"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserGoals;