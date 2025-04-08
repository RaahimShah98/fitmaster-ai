// import React, { useState } from "react";
// import {
//   XMarkIcon,
//   ChartBarIcon,
//   CogIcon,
//   CameraIcon,
//   HeartIcon,
// } from "@heroicons/react/24/outline";
// import { Move, Dumbbell } from "lucide-react";
// interface UserDashboardMenuProps {
//   setSelectedPage: (page: string) => void;
// }

// const UserDashboardMenu: React.FC<UserDashboardMenuProps> = ({
//   setSelectedPage,
// }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const sideBarItems = [
//     {
//       name: "Home",
//       icon: <ChartBarIcon className="h-5 w-5 mr-3" />,
//       page: "Analytics",
//     },
//     { name: "Start Workout", icon: <Dumbbell className="mr-3" width={"20px"} />, page: "StartWorkout" },
//     { name: "Track Food", icon: <CameraIcon className="h-5 w-5 mr-3" />, page: "UploadFood" },
//     { name: "Personalized Diet", icon: <CameraIcon className="h-5 w-5 mr-3" />, page: "diet-page" },
//     { name: "Personalized Workout Plan", icon: <CameraIcon className="h-5 w-5 mr-3" />, page: "workoutplan-page" },
//     {
//       name: "Settings",
//       icon: <CogIcon className="h-5 w-5 mr-3" />,
//       page: "Settings",
//     },
//     { name: "Workouts Performed", icon: <CameraIcon className="h-5 w-5 mr-3" />, page: "workoutdisplay-page" },
//     { name: "Meals Tracked", icon: <CameraIcon className="h-5 w-5 mr-3" />, page: "mealdisplay-page" },

//     {/* >>>>>>> Stashed changes */ }
//   ];

//   return (
//     <>
//       {/* Mobile Sidebar */}
//       <div
//         className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
//           } transition-transform duration-300 ease-in-out`}
//         aria-hidden={!sidebarOpen}
//       >
//         <div
//           className={`fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//             }`}
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//         <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-gray-900 border-r border-gray-700 text-white transform transition-transform duration-300">
//           <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
//             <span className="text-xl font-semibold">
//               <Move className="h-8 w-8 text-purple-300" />
//               FitMaster AI
//             </span>
//             <button
//               className="text-gray-400 hover:text-white"
//               onClick={() => setSidebarOpen(false)}
//             >
//               <XMarkIcon className="h-6 w-6" />
//             </button>
//           </div>
//           <nav className="flex-1 px-2 py-4 space-y-1">
//             {sideBarItems.map((item) => (
//               <button
//                 key={item.page}
//                 onClick={() => setSelectedPage(item.page)}
//                 className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
//               >
//                 {item.icon}
//                 {item.name}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Desktop Sidebar */}
//       <div className="hidden lg:flex lg:flex-shrink-0">
//         <div className="flex flex-col w-64 border-r border-gray-700 bg-gray-900 text-white">
//           <div className="flex items-center h-16 px-4 border-b border-gray-700">
//             <span className="text-xl font-semibold">FitMaster AI</span>
//           </div>
//           <nav className="flex-1 px-2 py-4 space-y-1">
//             {sideBarItems.map((item) => (
//               <button
//                 key={item.page}
//                 onClick={() => setSelectedPage(item.page)}
//                 className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
//               >
//                 {item.icon}
//                 {item.name}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>
//     </>
//   );
// };

// export default UserDashboardMenu;
"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const UserDashboardMenu = ({ setSelectedPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState("Analytics"); // Default active page

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Function to handle menu item click
  const handleMenuItemClick = (page) => {
    setSelectedPage(page);
    setActivePage(page); // Track the active page
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Function to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && event.target.closest('.sidebar') === null &&
        event.target.closest('.menu-toggle') === null) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && !isMenuOpen && (
        <button
          className="menu-toggle fixed top-20 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg mb-5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {!isMenuOpen && <Menu size={24} />}
        </button>
      )}

      {/* Sidebar Menu */}
      <div
        className={`sidebar fixed md:relative h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out z-40 ${isMobile
            ? isMenuOpen
              ? "left-0 w-64"
              : "-left-64 w-64"
            : "w-64"
          }`}
      >
        <div className="p-4">
          <div className="flex justify-evenly items-center">
            <h2 className="text-xl font-bold mb-8 pt-4">Dashboard</h2>
            {isMobile && <X className="relative bottom-2 left-8" size={24} onClick={() => setIsMenuOpen(!isMenuOpen)}/>}
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