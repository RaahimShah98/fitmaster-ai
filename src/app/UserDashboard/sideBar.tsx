import React, { useState } from "react";
import {
  XMarkIcon,
  ChartBarIcon,
  CogIcon,
  CameraIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { Move, Dumbbell } from "lucide-react";
interface UserDashboardMenuProps {
  setSelectedPage: (page: string) => void;
}

const UserDashboardMenu: React.FC<UserDashboardMenuProps> = ({
  setSelectedPage,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sideBarItems = [
    {
      name: "Home",
      icon: <ChartBarIcon className="h-5 w-5 mr-3" />,
      page: "Analytics",
    },

    {
      name: "Start Workout",
      icon: <Dumbbell className="mr-3" width={"20px"} />,
      page: "StartWorkout",
    },
    {
      name: "Track Food",
      icon: <CameraIcon className="h-5 w-5 mr-3" />,
      page: "UploadFood",
    },
    {
      name: "Personalized Diet",
      icon: <CameraIcon className="h-5 w-5 mr-3" />,
      page: "diet-page",
    },
    {
      name: "Personalized Workout Plan",
      icon: <CameraIcon className="h-5 w-5 mr-3" />,
      page: "workoutplan-page",
    },
    {
      name: "Settings",
      icon: <CogIcon className="h-5 w-5 mr-3" />,
      page: "Settings",
    },
    {
      name: "Workouts Performed",
      icon: <CameraIcon className="h-5 w-5 mr-3" />,
      page: "workoutdisplay-page",
    },
    {
      name: "Meals Tracked",
      icon: <CameraIcon className="h-5 w-5 mr-3" />,
      page: "mealdisplay-page",
    },

    {
      /* >>>>>>> Stashed changes */
    },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } fixed inset-0 z-40 lg:hidden`}
      >
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-gray-900 border-r border-gray-700 text-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <span className="text-xl font-semibold">
              <Move className="h-8 w-8 text-purple-300" />
              FitMaster AI
            </span>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {sideBarItems.map((item, i) => (
              <button
                key={item.page || i}
                onClick={() => setSelectedPage(item.page)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-700 bg-gray-900 text-white">
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            <span className="text-xl font-semibold">FitMaster AI</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {sideBarItems.map((item, i) => (
              <button
                key={item.page || i}
                onClick={() => setSelectedPage(item.page)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default UserDashboardMenu;
