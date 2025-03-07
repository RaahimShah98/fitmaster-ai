"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import UserDashboardMenu from './sideBar';
import FloatingNav from '@/components/FloatingNav';
import UserAnayltics from './mainPage.tsx/Analytics';
import UserSettings from './mainPage.tsx/userSettings';
import UserGoals from './mainPage.tsx/Goals';
import { useAuth } from '@/context/FirebaseContext';
// import { firebaseConfig } from '@/lib/firebase';

const UserDashboard: React.FC = () => {
    const {user} = useAuth();
    const email = user?.email || ""; // Use optional chaining

    // console.log(firebaseConfig)
const router = useRouter()
    const renderPage = () => {
        // console.log(renderPage)
        switch (selectedPage) {
            case "Analytics":
                return <UserAnayltics email={email}/>;
            case "Settings":
                return <UserSettings email={email}/>;
            case "Goals":
                return <UserGoals />;
            case "StartWorkout":
                router.push("/workoutprogress")
                return
            case "UploadFood":
                router.push("/FoodTracking")
                return
            default:
                return <UserAnayltics email={email}/>;
        }
    };

    const [selectedPage, setSelectedPage] = useState("Analytics");

    return (
        <div className='flex flex-row w-full'>
            <FloatingNav />
            <div className=' w-full flex flow-row relative top-19 pt-16  bg-gray-800 '>
                <UserDashboardMenu setSelectedPage={setSelectedPage} />
                <div className=" w-full">{renderPage()}</div>
            </div>

        </div>
    );
};

export default UserDashboard;