'use client';

import React, { useEffect, useRef, useState } from 'react';

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
    isActive: true,
    elapsedTime: 765 // in seconds (12:45)
  });

  // Refs
  const cameraFeedRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start camera function
  const startCamera = () => {
    if (cameraFeedRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream: MediaStream) => {
          streamRef.current = mediaStream;
          if (cameraFeedRef.current) {
            cameraFeedRef.current.srcObject = mediaStream;
          }
          setWorkoutState(prev => ({ ...prev, isActive: true }));
        })
        .catch((error: Error) => {
          console.error("Could not access the camera: ", error);
          alert("Error accessing the camera. Please check your camera permissions.");
          setWorkoutState(prev => ({ ...prev, isActive: false }));
        });
    }
  };

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
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
      setWorkoutState(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1
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
    setWorkoutState(prev => ({ ...prev, isActive: true }));
    startCamera();
    startTimer();
  };

  const stopWorkout = () => {
    setWorkoutState(prev => ({ ...prev, isActive: false }));
    stopCamera();
    stopTimer();
  };

  // Create star background effect
  useEffect(() => {
    const createStarBackground = () => {
      const body = document.body;
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.classList.add('absolute', 'rounded-full', 'bg-white', 'opacity-50', 'z-0');
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
      document.querySelectorAll('.absolute.rounded-full.bg-white.opacity-50.z-0').forEach(el => {
        el.remove();
      });
    };
  }, []);

  // Initialize camera and timer
  useEffect(() => {
    startCamera();
    if (workoutState.isActive) {
      startTimer();
    }

    // Clean up function
    return () => {
      stopCamera();
      stopTimer();
    };
  }, []);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md">
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
      </header>

      {/* Main Workout Progress Container */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Workout Progress</h1>
        
        {/* Row 1: Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Sets Card */}
          <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-4 flex items-center">
            <div className="bg-purple-900/50 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <path d="M20 14V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7"></path>
                <path d="M12 12v8"></path>
                <path d="M18 17v.8a2 2 0 0 1-2 2.2H8a2 2 0 0 1-2-2.2V17"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Total Sets</h3>
              <p className="text-2xl font-bold">{workoutState.completedSets}/{workoutState.totalSets}</p>
            </div>
          </div>
          
          {/* Total Reps Card */}
          <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-4 flex items-center">
            <div className="bg-indigo-900/50 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Total Reps</h3>
              <p className="text-2xl font-bold">{workoutState.completedReps}/{workoutState.totalReps}</p>
            </div>
          </div>
          
          {/* Current Exercise Card */}
          <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-4 flex items-center">
            <div className="bg-blue-900/50 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M6 8h-1a4 4 0 0 0 0 8h1"></path>
                <path d="M8 6v12"></path>
                <path d="M16 6v12"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Current Exercise</h3>
              <p className="text-xl font-bold">{workoutState.exerciseName}</p>
            </div>
          </div>
        </div>
        
        {/* Row 2: Live View and Controls */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Live Camera View */}
          <div className="flex-1 bg-[#1E1E3F] rounded-2xl shadow-lg overflow-hidden">
            <div className="relative overflow-hidden rounded-2xl bg-[#0c0c1d] h-96 md:h-auto">
              {/* Video element for camera feed */}
              <video ref={cameraFeedRef} autoPlay playsInline className="w-full h-full object-cover" />
              
              {/* AI Feedback Overlay */}
              <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 font-medium">AI Coach Active</span>
                </div>
                
                <div className="bg-black/60 p-3 rounded-lg mb-2 max-w-xs">
                  <p className="text-green-400">Good form! Keep your back straight and focus on the full range of motion.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exercise Controls and Stats */}
          <div className="w-full md:w-80 space-y-4">
            {/* Exercise Details Card */}
            <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-5">
              <h3 className="text-xl font-bold mb-4">Exercise Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Target Muscle</p>
                  <p className="font-medium">{workoutState.targetMuscle}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Intensity</p>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${workoutState.intensity}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Form Quality</p>
                  <div className="flex items-center">
                    {renderStars(workoutState.formQuality)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Exercise Controls Card */}
            <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-5">
              <h3 className="text-xl font-bold mb-4">Controls</h3>
              
              <div className="space-y-4">
                {!workoutState.isActive && (
                  <button 
                    onClick={startWorkout} 
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition hover:opacity-90"
                  >
                    Start Exercise
                  </button>
                )}
                
                {workoutState.isActive && (
                  <button 
                    onClick={stopWorkout} 
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium transition hover:opacity-90"
                  >
                    Stop Exercise
                  </button>
                )}
                
                <button className="w-full py-3 rounded-lg border border-purple-500 text-purple-400 font-medium transition hover:bg-purple-900/30">
                  Switch Exercise
                </button>
              </div>
            </div>
            
            {/* Timer Card */}
            <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-5 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Workout Time</p>
                <p className="text-2xl font-bold">{formatTime(workoutState.elapsedTime)}</p>
              </div>
              
              <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 9v6l5-3-5-3Z"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkoutProgress;