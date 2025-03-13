import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/firebase';
import { collection , onSnapshot } from 'firebase/firestore';

interface weightTrackingProps {
  email: string;
}

// Define the type for the weight tracking data
const WeightTracker: React.FC<weightTrackingProps> = ({ email }) => {
  const [data, setWeightData] = useState<object[]>([])

  const getUserWeight = (email:string) => {
    if(!email) return;
    
    try {
      const postsRef = collection(db, "user_weight_tracking", email , "weights");
  
      // Listen for real-time updates
      return onSnapshot(postsRef, (querySnapshot) => {
        const today = new Date();
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(today.getDate() - 10);
  
        // Process weight data in real time
        const weightData = querySnapshot.docs
          .map((item) => ({
            date: item.id,
            weight: item.data().weight,
          }))
          .filter((item) => {
            const [day, month, year] = item.date.split("-").map(Number);
            const entryDate = new Date(year, month - 1, day);
            return entryDate >= tenDaysAgo;
          })
          .sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split("-").map(Number);
            const [dayB, monthB, yearB] = b.date.split("-").map(Number);
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
          });
  
        // Update state with real-time data
        setWeightData(weightData);
      });
    } catch (e) {
      console.error("Error fetching real-time weight data:", e);
    }
  };


  useEffect(() => {
    // getUserWeight()
    const unsubscribe = getUserWeight(email);
    // return () => unsubscribe(); // Cleanup on component unmount
  }, [email])

  useEffect(() => {
    // console.log("DATA: ", data)
  }, [data])

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split("-").map(Number);

    // Create Date object (Note: month is zero-based in JS)
    const date = new Date(year, month - 1, day);

    // Format as "Mar 7"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const tooltipformatDate = (dateStr: string): string => {
    // Split "07-03-2025" into [day, month, year]
    const [day, month, year] = dateStr.split("-").map(Number);

    // Create a valid Date object (month is zero-based in JS)
    const date = new Date(year, month - 1, day);

    // Format as "Mar 7, 2025"
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <Card className="min-w-full max-w-2xl h-full bg-black/20 text-white border-none shadow-none">
      <CardHeader>
        <CardTitle>Weight Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%" className={"border-none"}>
            <LineChart
              data={data}
              // margin={{bottom:3}}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(253, 253, 253, 0.48)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                padding={{ left: 20, right: 20 }}
                tick={{ fill: "white" }}
              />
              <YAxis
                domain={['dataMin ', 'dataMax']}
                tickFormatter={(value: number) => `${value} kgs`}
                tick={{ fill: "white" }}
              />
              <Tooltip
                labelFormatter={tooltipformatDate}
                formatter={(value: number) => [`${value} kgs`, 'Weight']}
                contentStyle={{color:"black"}}
                

              />
              <Line
                type="monotone"
                dataKey="weight"
                strokeWidth={2}
                dot={{ fill: '#AEE012', strokeWidth: 2 }}
                activeDot={{ r: 4 }}
                
              />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightTracker;
