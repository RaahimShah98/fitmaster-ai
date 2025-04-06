import React, { useEffect, useState } from "react";
import WeightTracker from "../charts/WeightTrackingLineChart";

// firestore
import { db } from "../../../lib/firebase";
import { getDocs, collection } from "firebase/firestore";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import AddWeight from "../charts/addWeight";

import { Pie, Bar, Doughnut } from "react-chartjs-2";
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
  const [date, setDate] = useState<string>("");
  // const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState<number>(0);
  const [addWeight, setAddWeight] = useState<boolean>(false);

  //workout data
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [workoutNames, setWorkoutName] = useState<any[]>([]);
  const [workoutNumber, setWorkoutNumber] = useState<any[]>([]);

  console.log("USER: ", email);
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
    if (!email) return;
    try {
      const postsRef = collection(
        db,
        "food_logs",
        email,
        getFormattedDateTime()
      );
      // console.log(postsRef)
      const querySnapshot = await getDocs(postsRef);

      const totalCalories = querySnapshot.docs.reduce((sum, doc) => {
        return doc.data().content.calories + sum;
      }, 0);
      // console.log("CALORIES: ", totalCalories)
      setCaloriesConsumed(totalCalories);

      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // console.log("Fetched Documents:", documents);
    } catch (e) {
      return;
    }
  };

  async function getSessionForDaysAgo(daysAgo: number) {
    const sessionsRef = collection(db, "user_exercise_data", email, "sessions");
    const daysAgoDate = new Date();
    daysAgoDate.setDate(daysAgoDate.getDate() - daysAgo);
    const snapshot = await getDocs(sessionsRef);
    const recentSessions: string[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const sessionTime = new Date(
        data.started_at.split("-").slice(0, 3).join("-")
      );
      if (sessionTime >= daysAgoDate) {
        recentSessions.push(docSnap.id); // sessionId
      }
    });

    return recentSessions;
  }

  const getExercisesFromSessions = async (
    email: string,
    sessionIds: string[]
  ) => {
    const allExercises: any[] = [];

    for (const sessionId of sessionIds) {
      const exercisesRef = collection(
        db,
        "user_exercise_data",
        email,
        "sessions",
        sessionId,
        "exercises"
      );

      const snapshot = await getDocs(exercisesRef);
      snapshot.forEach((doc) => {
        const data = doc.data();
        allExercises.push({
          ...data.content,
          sessionId,
          recorded_at: data.recorded_at,
        });
      });
    }

    return allExercises;
  };
  //GET USER WORKOUT DATA
  const getWorkoutData = async () => {
    if (!email) return;
    console.log("EAMIL: ", email);
    try {
      const sessions = await getSessionForDaysAgo(7);
      console.log("SESSIONS: ", sessions);
      const exercises = await getExercisesFromSessions(email, sessions);
      console.log("EXERCISES: ", exercises);
      setWorkoutData(exercises);
      // const userRef = collection(db, "user_exercise_data", email, date);
      //   const userRef = collection(db, "user_exercise_data", email, "25-03-2025");
      //   // console.log("REF:" , userRef)
      //   const userSnap = await getDocs(userRef);
      //   // console.log("SNAP: ", userSnap.docs)
      //   const workouts = userSnap.docs.map((doc) => ({
      //     id: doc.id,
      //     ...doc.data(),
      //   }));
      //   const workouts = snapshot.docs.map((doc) => ({
      //     id: doc.id,
      //     ...doc.data(),
      //   }));
      //   console.log("WORKOUTS: ", workouts);
      //   setWorkoutData(workouts);
      //   console.log(workouts);
    } catch (e) {
      console.log("FAILED TO FETCH", e.message);
      return;
    }
  };

  // Set Excercise Sets Distribution Data
  const setDistributionData = () => {
    const exerciseCount = workoutData
      .filter((item) => {
        // only include items from last 24 hours
        const recordedDate = new Date(item.recorded_at);
        const currentDate = new Date();
        const diff = currentDate.getTime() - recordedDate.getTime();
        const diffHours = diff / (1000 * 60 * 60);
        return diffHours <= 24; // filter items from the last 24 hours
      })
      .reduce((acc, item) => {
        const name = item.name;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    setWorkoutName(Object.keys(exerciseCount));
    setWorkoutNumber(Object.values(exerciseCount));
    console.log(exerciseCount);
  };

  useEffect(() => {
    console.log("EMAIL NISIDE: ", email);
    setDate(getFormattedDateTime());
  }, []);

  useEffect(() => {
    if (!email) return; // Prevent running if email is not available
    console.log("EMAIL INSIDE EFFECT:", email);
    fetch_user_calories();
    getWorkoutData();
  }, [date, email]);

  useEffect(() => {
    console.log("DATA: ", workoutData);
    setDistributionData();
  }, [workoutData]);

  useEffect(() => {}, [workoutNames, workoutNumber]);

  // RUN AFTER EMAIL IS SET
  // useEffect(() => {
  //     console.log("EMAIL: ", email);

  //     const fetchData = async () => {
  //         const docData = await getWorkoutData(email); // Wait for the data
  //         // console.log("Fetched Data:", docData);
  //         setData(docData);
  //     };

  //     fetchData();
  // }, [email]);

  useEffect(() => {
    // console.log("DATA UPDATED:", data);

    console.log(
      data?.Date?.excercise.excercise_name,
      data?.Date?.excercise.exercise_sets
    );
  }, [data]);

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

  // Sample data for exercises sets
  const pieChartData = {
    // labels: ['Push-ups', 'Squats', 'Pull-ups', 'Lunges', 'Planks'],
    labels: workoutNames,
    datasets: [
      {
        // data: [30, 25, 15, 20, 10],
        data: workoutNumber,
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calorie data
  const totalCalories = 2500; // Set the total calorie limit
  const exceededCalories = Math.max(0, caloriesConsumed - totalCalories);
  const normalCalories = Math.min(caloriesConsumed, totalCalories);
  const remainingCalories = Math.max(0, totalCalories - caloriesConsumed);

  const donutChartDataCalories = {
    labels:
      caloriesConsumed > totalCalories
        ? ["Within Limit", "Exceeded Calories", "Remaining Calories"]
        : ["Within Limit", "Remaining Calories"],
    datasets: [
      {
        data:
          caloriesConsumed > totalCalories
            ? [normalCalories, exceededCalories, remainingCalories]
            : [caloriesConsumed, remainingCalories],
        backgroundColor:
          caloriesConsumed > totalCalories
            ? [
                "rgba(35, 143, 102, 0.8)",
                "rgb(251, 0, 54 ,0.8)",
                "rgba(85, 85, 85, 0.8)",
              ]
            : ["rgba(35, 143, 102, 0.8)", "rgb(85, 85, 85, 0.8)"],
        borderColor:
          caloriesConsumed > totalCalories
            ? [
                "rgba(35, 143, 102, 0.8)",
                "rgb(251, 0, 54 ,0.8)",
                "rgba(42, 42, 42, 0.8)",
              ]
            : ["rgba(54, 162, 235, 0.8)", "rgb(129, 125, 125 , 0.8)"],
        borderWidth: 2,
      },
    ],
  };

  // Sample data for weekly progress
  //   const barChartData = {
  //     labels: [
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //       "Sunday",
  //     ],
  //     datasets: [
  //       {
  //         label: "Number of Exercises",
  //         data: [4, 5, 3, 6, 4, 2, 3],
  //         backgroundColor: "rgba(54, 162, 235, 0.8)",
  //         borderColor: "rgba(54, 162, 235, 1)",
  //         borderWidth: 1,
  //       },
  //     ],
  //   };

  // Sample data for exercise accuracy

  function generateDonutChartData(workoutData: any) {
    let totalCorrect = 0;
    let totalIncorrect = 0;

    workoutData.forEach(({ rep_count, improper_rep_count }: any) => {
      const correct = rep_count - improper_rep_count;
      totalCorrect += correct;
      totalIncorrect += improper_rep_count;
    });

    return {
      labels: ["Correct Form", "Incorrect Form"],
      datasets: [
        {
          data: [totalCorrect, totalIncorrect],
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 99, 132, 0.8)",
          ],
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const donutOptions = {
    ...chartOptions,
    cutout: "60%",
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} kcal`;
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  function generateDayExerciseStackedData(workoutData: any) {
    const dayMap = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    const exerciseDayMap = {} as any; // { 'Bicep Curl|Monday': { correct: X, incorrect: Y } }
    const daysSet = new Set() as any;
    const exercisesSet = new Set() as any;

    workoutData.forEach(
      ({ name, rep_count, improper_rep_count, recorded_at }: any) => {
        const date = new Date(recorded_at);
        const day = dayMap[date.getDay()];

        const key = `${name}|${day}`;
        if (!exerciseDayMap[key]) {
          exerciseDayMap[key] = { correct: 0, incorrect: 0 };
        }

        const correctReps = rep_count - improper_rep_count;
        exerciseDayMap[key].correct += correctReps;
        exerciseDayMap[key].incorrect += improper_rep_count;

        daysSet.add(day);
        exercisesSet.add(name);
      }
    );

    const sortedDays = Array.from(daysSet).sort(
      (a, b) =>
        Object.entries(dayMap).find(([_, v]) => v === a)[0] -
        Object.entries(dayMap).find(([_, v]) => v === b)[0]
    );

    const datasets = [];

    exercisesSet.forEach((exercise) => {
      const correctData = [];
      const incorrectData = [];

      sortedDays.forEach((day) => {
        const key = `${exercise}|${day}`;
        const entry = exerciseDayMap[key] || { correct: 0, incorrect: 0 };
        correctData.push(entry.correct);
        incorrectData.push(entry.incorrect);
      });

      datasets.push({
        label: `${exercise} - Correct`,
        data: correctData,
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        stack: exercise,
      });

      datasets.push({
        label: `${exercise} - Incorrect`,
        data: incorrectData,
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        stack: exercise,
      });
    });

    return {
      labels: sortedDays,
      datasets,
    };
  }

  const barChartData = generateDayExerciseStackedData(workoutData);
  const donutChartData = generateDonutChartData(workoutData);
  return (
    <div className="flex min-w-screen min-h-screen pb-10 bg-gray-900 text-white ">
      {addWeight && <AddWeight email={email} close={setAddWeight} />}

      <div className="min-w-screen max-w-6xl mx-auto space-y-8 w-[100%]">
        <h1 className="text-3xl font-bold  mb-8 mt-4">
          Exercise Progress Dashboard
        </h1>

        <div className="flex flex-col flex-wrap ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Calorie Tracking */}
            <div className="bg-black/50 p-6 rounded-lg shadow-md w-full md:w-[100%] mb-[20px]">
              <h2 className="text-xl font-semibold mb-4">
                Daily Calorie Tracking
              </h2>
              <div className="h-64 relative flex items-center justify-center">
                <Doughnut
                  data={donutChartDataCalories}
                  options={donutOptions}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-3xl font-bold ">
                    {caloriesConsumed}
                  </span>
                  <span className="text-sm ">of {totalCalories} kcal</span>
                </div>
              </div>
            </div>

            {/* Weight Tracker */}

            <div className="bg-black/50 p-6 rounded-lg shadow-md w-full md:w-[100%] mb-[20px] overflow-hidden">
              <button
                onClick={() => setAddWeight(true)}
                className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition mb-2"
              >
                Add Weight
              </button>
              <WeightTracker email={email} />
            </div>
          </div>

          {/* Lower Chart */}
          <div className="min-w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bar Chart */}
            <div className="w-full bg-black/50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Weekly Exercise Activity
              </h2>
              <div className="h-64">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="w-full bg-black/50 p-6 rounded-lg shadow-md ">
              <h2 className="text-xl font-semibold mb-4">
                Daily Exercise Sets Distribution
              </h2>
              <div className="h-64">
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>

            {/* Donut Chart */}
            <div className="w-full bg-black/50 p-6 rounded-lg shadow-md ">
              <h2 className="text-xl font-semibold mb-4">
                Exercise Form Accuracy
              </h2>
              <div className="h-64">
                <Doughnut data={donutChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnayltics;
