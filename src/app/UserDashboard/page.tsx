"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import UserDashboardMenu from './sideBar';
import FloatingNav from '@/components/FloatingNav';
import UserAnayltics from './mainPage.tsx/Analytics';
import UserSettings from './mainPage.tsx/userSettings';
import UserGoals from './mainPage.tsx/Goals';

// import { firebaseConfig } from '@/lib/firebase';

const UserDashboard: React.FC = () => {

    // console.log(firebaseConfig)
const router = useRouter()
    const renderPage = () => {
        // console.log(renderPage)
        switch (selectedPage) {
            case "Analytics":
                return <UserAnayltics />;
            case "Settings":
                return <UserSettings />;
            case "Goals":
                return <UserGoals />;
            case "StartWorkout":
                router.push("/workoutprogress")
                return
            case "UploadFood":
                router.push("/FoodTracking")
                return
            default:
                return <UserAnayltics />;
        }
    };

    const [selectedPage, setSelectedPage] = useState("Analytics");

    return (
        <div>
            {/* <FloatingNav /> */}
            <div className='flex flex-row w-full absolute top-19'>
                <UserDashboardMenu setSelectedPage={setSelectedPage} />
                <div className="flex w-full">{renderPage()}</div>
            </div>

        </div>
    );
};

export default UserDashboard;