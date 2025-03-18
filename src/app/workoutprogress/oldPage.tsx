"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import LiveStream from "./liveStream";

// Type definitions
type WorkoutState = {
  exerciseName: string;
  totalSets: number;
  completedSets: number;
  totalReps: number;
  completedReps: number;
  targetMuscle: string;
  intensity: number;
  formQuality: number;
  isActive: boolean;
  elapsedTime: number;
};

const WorkoutProgress = () => {
  // Initialize workout state
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    exerciseName: "Bicep Curls",
    totalSets: 5,
    completedSets: 3,
    totalReps: 40,
    completedReps: 24,
    targetMuscle: "Biceps",
    intensity: 65,
    formQuality: 4,
    isActive: false,
    elapsedTime: 0, // in seconds (12:45)
  });

  // Refs
  const cameraFeedRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Start camera function
  const startCamera = () => {
    if (cameraFeedRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((mediaStream: MediaStream) => {
          streamRef.current = mediaStream;
          if (cameraFeedRef.current) {
            cameraFeedRef.current.srcObject = mediaStream;
          }
          setWorkoutState((prev) => ({ ...prev, isActive: true }));
        })
        .catch((error: Error) => {
          console.error("Could not access the camera: ", error);
          alert(
            "Error accessing the camera. Please check your camera permissions."
          );
          setWorkoutState((prev) => ({ ...prev, isActive: false }));
        });
    }
  };

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      if (cameraFeedRef.current) {
        cameraFeedRef.current.srcObject = null;
      }
      streamRef.current = null;
    }
  };

  // Timer functions
  const startTimer = () => {
    if (timerIntervalRef.current !== null) return;

    timerIntervalRef.current = window.setInterval(() => {
      setWorkoutState((prev) => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Workout control functions
  const startWorkout = () => {
    setWorkoutState((prev) => ({ ...prev, isActive: true }));
    startCamera();
    startTimer();
  };

  const stopWorkout = () => {
    setWorkoutState((prev) => ({ ...prev, isActive: false }));
    stopCamera();
    stopTimer();
  };

  // Create star background effect
  useEffect(() => {
    const createStarBackground = () => {
      const body = document.body;
      for (let i = 0; i < 50; i++) {
        const star = document.createElement("div");
        star.classList.add(
          "absolute",
          "rounded-full",
          "bg-white",
          "opacity-50",
          "z-0"
        );
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.opacity = `${Math.random() * 0.7 + 0.3}`;
        body.appendChild(star);
      }
    };

    createStarBackground();

    // Clean up function
    return () => {
      document
        .querySelectorAll(".absolute.rounded-full.bg-white.opacity-50.z-0")
        .forEach((el) => {
          el.remove();
        });
    };
  }, []);

  // Initialize camera and timer
  useEffect(() => {
    stopCamera();
    if (workoutState.isActive) {
      stopTimer();
    }

    // Clean up function
    return () => {
      stopCamera();
      stopTimer();
    };
  }, []);

  // End exercise session
  const endExerciseSession = () => {
    console.log("hellp");
  };

  // Render stars for 1-5 rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isFilled ? "#9333EA" : "none"}
          stroke="#9333EA"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="bg-[#141429] text-white font-sans min-h-screen">
      {/* Header with Logo and Navigation */}
      {/* <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
              <path d="M12 22v-5"></path>
              <path d="M9 7V2"></path>
              <path d="M15 7V2"></path>
              <path d="M6 13V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z"></path>
              <path d="M9 17v5"></path>
            </svg>
            <span className="ml-2 text-xl font-bold">FitMaster AI</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white">Home</a>
            <a href="#" className="text-gray-300 hover:text-white">Dashboard</a>
            <a href="#" className="text-purple-400 font-medium">Workout</a>
            <a href="#" className="text-gray-300 hover:text-white">Progress</a>
          </nav>
          <button className="md:hidden text-white focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header> */}
      <FloatingNav />
      {/* Main Workout Progress Container */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Real-time Pose Correction
        </h1>

        {/* Row 1: Metrics Cards */}

        {/* Row 2: Live View and Controls */}
        <LiveStream />
      </main>
    </div>
  );
};

export default WorkoutProgress;
