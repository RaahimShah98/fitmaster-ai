import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/firebase';
import { getDocs, collection } from 'firebase/firestore';

interface weightTrackingProps {
  email: string;
  date: string;
}

// Define the type for the weight tracking data
interface WeightData {
  date: [];
  weight: number;
}

const WeightTracker: React.FC<weightTrackingProps> = ({ email }) => {
  const [data, setWeightData] = useState<object[]>([])

  // Sample data - each entry has a date and weight
  // const data: WeightData[] = [
  //   { date: '2024-01-01', weight: 180 },
  //   { date: '2024-01-15', weight: 178 },
  //   { date: '2024-02-01', weight: 176 },
  //   { date: '2024-02-15', weight: 175 },
  //   { date: '2024-03-01', weight: 173 },
  //   { date: '2024-03-15', weight: 172 },
  //   { date: '2024-04-01', weight: 170 },
  //   { date: '2025-01-01', weight: 180 },
  //   { date: '2025-01-15', weight: 178 },
  //   { date: '2025-02-01', weight: 176 },
  //   { date: '2025-02-15', weight: 175 },
  //   { date: '2025-03-01', weight: 173 },
  //   { date: '2025-03-15', weight: 172 },
  //   { date: '2025-04-01', weight: 170 }
  // ];

  // const getUserWeight = async () => {
  //   if (!email) {
  //     console.error("Email is undefined");
  //     return;
  //   }
  //   console.log("HELLO")
  //   const postsRef = collection(db, "user_weight_tracking", email, "weights")

  //   const querySnapshot = await getDocs(postsRef);

  //   const weightData = querySnapshot.docs.map(item => {

  //     return { date: item.id, weight: item.data().weight }
  //   })
  //   console.log(weightData)
  //   setWeightData(weightData)

  // }
  const getUserWeight = async () => {
    if (!email) {
      console.error("Email is undefined");
      return;
    }
  
    console.log("HELLO");
  
    const postsRef = collection(db, "user_weight_tracking", email, "weights");
    const querySnapshot = await getDocs(postsRef);
  
    // Get today's date
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10); // Go back 10 days
  
    // Filter and sort weight data
    const weightData = querySnapshot.docs
      .map((item) => {
        return { date: item.id, weight: item.data().weight };
      })
      .filter((item) => {
        const [day, month, year] = item.date.split("-").map(Number); // Convert "07-03-2025" to numbers
        const entryDate = new Date(year, month - 1, day); // Convert to Date object
        return entryDate >= tenDaysAgo; // Only keep data within the last 10 days
      })
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("-").map(Number);
        const [dayB, monthB, yearB] = b.date.split("-").map(Number);
        return  new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB); // Sort descending
      });
  
    console.log("Filtered and Sorted Weight Data:", weightData);
    setWeightData(weightData);
  };
  
  

  useEffect(() => {
    getUserWeight()

  }, [email])

  useEffect(() => {
    console.log("DATA: ", data)
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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Weight Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value: number) => `${value} kgs`}
              />
              <Tooltip
                labelFormatter={tooltipformatDate}
                formatter={(value: number) => [`${value} kgs`, 'Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightTracker;
