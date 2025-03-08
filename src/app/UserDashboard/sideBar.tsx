import React, { useState } from "react";
import { XMarkIcon, ChartBarIcon, CogIcon, CameraIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Move } from "lucide-react";
interface UserDashboardMenuProps {
  setSelectedPage: (page: string) => void;
}

const UserDashboardMenu: React.FC<UserDashboardMenuProps> = ({ setSelectedPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const DumbbellIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5 mr-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h3v4H3v-4zm15 0h3v4h-3v-4zM7 14h10M7 10h10m-7 4v-4m4 4v-4"
      />
    </svg>
  );
  
  const sideBarItems = [
    { name: "Analytics", icon: <ChartBarIcon className="h-5 w-5 mr-3" />, page: "Analytics" },
    { name: "Settings", icon: <CogIcon className="h-5 w-5 mr-3" />, page: "Settings" },
    { name: "Goals", icon: <HeartIcon className="h-5 w-5 mr-3" />, page: "Goals" },
    { name: "Start Workout", icon: DumbbellIcon(), page: "StartWorkout" },
    { name: "Track Food", icon: <CameraIcon className="h-5 w-5 mr-3" />, page: "UploadFood" },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} fixed inset-0 z-40 lg:hidden`}>
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-gray-900 border-r border-gray-700 text-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <span className="text-xl font-semibold"><Move className="h-8 w-8 text-purple-300" />FitMaster AI</span>
            <button className="text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {sideBarItems.map((item) => (
              <button
                key={item.page}
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
            {sideBarItems.map((item) => (
              <button
                key={item.page}
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
