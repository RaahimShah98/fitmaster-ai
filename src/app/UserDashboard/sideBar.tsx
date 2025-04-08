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
          <nav>
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => handleMenuItemClick("Analytics")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "Analytics" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("Goals")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "Goals" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Goals
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("workoutplan-page")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "workoutplan-page" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Workout Plan
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("diet-page")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "diet-page" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Diet Plan
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("workoutdisplay-page")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "workoutdisplay-page" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Workout Display
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("mealdisplay-page")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "mealdisplay-page" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Meal Display
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("StartWorkout")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "StartWorkout" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Start Workout
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("UploadFood")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "UploadFood" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Upload Food
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuItemClick("Settings")}
                  className={`w-full text-left py-2 px-4 rounded transition ${activePage === "Settings" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                >
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default UserDashboardMenu;