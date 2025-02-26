"use client";

import UserDashboard from "./User Dashboard/userDashboard";
import LandingPage from "./Landing Page/Landingpage";
import Router from "next/router";
export default function Home() {
  return (
    <div>
      <LandingPage></LandingPage>
     {/* <UserDashboard /> */}
    </div>
  );
}
