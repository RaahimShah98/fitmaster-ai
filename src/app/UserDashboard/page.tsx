"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import ChatbotInterface from "../chatBot/chatbot";
import UserDashboardMenu from "./sideBar";
import FloatingNav from "@/components/FloatingNav";
import UserAnayltics from "./mainPage.tsx/Analytics";
import UserSettings from "./mainPage.tsx/userSettings";
import UserGoals from "./mainPage.tsx/Goals";
import PersonalizedWorkoutPlan from "./mainPage.tsx/workoutPlan";
import PersonalizedDietPlan from "./mainPage.tsx/dietPlan";
import { useAuth } from "@/context/FirebaseContext";
import WorkoutProgress from "../workoutprogress/page";
// import { firebaseConfig } from '@/lib/firebase';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const email = user?.email || ""; // Use optional chaining
  const [selectedPage, setSelectedPage] = useState("Analytics");

  const router = useRouter();
  useEffect(() => {
    if (!user) {
      console.log("USER NOT FOUND");
      // router.push("/")
    }
  }, []);

  // console.log(firebaseConfig)
  const renderPage = () => {
    // console.log(renderPage)
    switch (selectedPage) {
      case "Analytics":
        return <UserAnayltics email={email} />;
      case "Settings":
        return <UserSettings email={email} />;
      case "Goals":
        return <UserGoals email={email} />;
      case "StartWorkout":
        return <WorkoutProgress />;

      case "UploadFood":
        router.push("/FoodTracking");
        return;
      case "workoutplan-page":
        return <PersonalizedWorkoutPlan email={email} />;
      case "diet-page":
        return <PersonalizedDietPlan email={email} />;
      default:
        return <UserAnayltics email={email} />;
    }
  };

  return (
    <div className="flex flex-row w-full">
      <FloatingNav />
      <div className=" w-full flex flow-row relative top-19 pt-16  bg-gray-800 ">
        <UserDashboardMenu setSelectedPage={setSelectedPage} />
        <div className=" w-full">{renderPage()}</div>
      </div>
      <ChatbotInterface />
    </div>
  );
};

export default UserDashboard;
