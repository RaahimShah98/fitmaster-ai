import React, { useState, useEffect } from 'react';
import UserDashboardHeader from './header';

import UserDashboardMenu from './sideBar';

import UserAnayltics from './mainPage.tsx/Analytics';
import UserSettings from './mainPage.tsx/userSettings';
import UserGoals from './mainPage.tsx/Goals';
import LoginForm from '@/LoginForm';
import SignupForm from '@/SignUp';
// import { firebaseConfig } from '@/lib/firebase';

const UserDashboard: React.FC = () => {

    // console.log(firebaseConfig)

    const renderPage = () => {
        // console.log(renderPage)
        switch (selectedPage) {
            case "Analytics":
                return <UserAnayltics />;
            case "Settings":
                return <UserSettings />;
            case "Goals":
                return <UserGoals />;
            case "Login":
                return <LoginForm />;
            case "SignUp":
                return <SignupForm />;
            default:
                return <UserAnayltics />;
        }
    };

    const [selectedPage, setSelectedPage] = useState("Analytics");

    return (
        <div>
            <UserDashboardHeader />
            <div className='flex flex-row w-full'>
                <UserDashboardMenu setSelectedPage={setSelectedPage} />
                <div className="flex w-full">{renderPage()}</div>
            </div>

        </div>
    );
};

export default UserDashboard;