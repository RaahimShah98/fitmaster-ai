"use client";

import UserDashboard from "./UserDashboard/page";
import LandingPage from "./Landing Page/Landingpage";
import Router from "next/router";
import WorkoutProgress from '@/components/workoutprogress/workoutprogress';

export default function Home() {
  return (
    <div>
      <LandingPage></LandingPage>
      {/* <WorkoutProgress /> */}
      {/* <UserDashboard /> */}
    </div>
  );
}
