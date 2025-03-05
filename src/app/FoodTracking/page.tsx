// app/food-tracker/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import FoodList from './FoodList';
import WebcamCapture from './WebcamCapture';

type DetectedFood = {
  id: string;
  name: string;
  confidence: number;
  calories?: number;
  timestamp: string;
};

export default function FoodTracker() {
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);
      
      // Convert the file to a data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Prepare form data for API
      const formData = new FormData();
      formData.append('image', file);

      // Send to API for food detection
      const response = await fetch('/api/detect-food', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        addDetectedFoods(data.detections);
      } else {
        throw new Error(data.error || 'Failed to detect food items');
      }
    } catch (err: any) {
      console.error('Error processing image:', err);
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const addDetectedFoods = (foods: any[]) => {
    const newFoods = foods.map(food => ({
      id: Math.random().toString(36).substring(2, 9),
      name: food.name || food.class || 'Unknown food',
      confidence: food.confidence || food.score || 0,
      calories: food.calories || calculateEstimatedCalories(food.name || food.class),
      timestamp: new Date().toISOString()
    }));

    setDetectedFoods(prev => [...newFoods, ...prev]);
  };

  const calculateEstimatedCalories = (foodName: string): number => {
    // This would ideally be replaced with a proper food database lookup
    const calorieEstimates: Record<string, number> = {
      'apple': 95,
      'banana': 105,
      'orange': 62,
      'pizza': 285,
      'burger': 354,
      'hot dog': 290,
      'sandwich': 250,
      'salad': 150,
      'broccoli': 55,
      'carrot': 50,
      'donut': 195,
      'cake': 350,
    };

    const key = Object.keys(calorieEstimates).find(
      k => foodName.toLowerCase().includes(k)
    );
    
    return key ? calorieEstimates[key] : 100; // Default to 100 if unknown
  };

  const handleCaptureFromWebcam = (capturedImage: string, detections: any[]) => {
    setImage(capturedImage);
    addDetectedFoods(detections);
  };

  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
    if (image) setImage(null);
  };

  const clearAll = () => {
    setDetectedFoods([]);
    setImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFoodItem = (id: string) => {
    setDetectedFoods(prev => prev.filter(item => item.id !== id));
  };

  // Calculate total calories from all detected foods
  const totalCalories = detectedFoods.reduce((sum, food) => sum + (food.calories || 0), 0);
  const calorieGoal = 2000; // Example goal
  const caloriePercentage = Math.min(100, (totalCalories / calorieGoal) * 100);
  
  // Example protein calculation (would need actual data in real app)
  const totalProtein = Math.round(totalCalories * 0.15 / 4); // Estimating 15% of calories from protein
  const proteinGoal = 120; // Example goal
  const proteinPercentage = Math.min(100, (totalProtein / proteinGoal) * 100);
  
  // Example water intake (would need actual tracking in real app)
  const waterIntake = 1.5; // Example in liters
  const waterGoal = 2.5; // Example goal
  const waterPercentage = Math.min(100, (waterIntake / waterGoal) * 100);

  return (
    <div className="min-h-screen bg-[#0f0d1a] py-6 text-white">
      <header className="max-w-6xl mx-auto px-6 flex justify-between items-center mb-8 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-2xl">◇</span>
          <span className="text-xl font-bold">NutriTrack AI</span>
        </div>
        
        <nav className="hidden md:flex gap-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Dashboard</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
        </nav>
        
        <div className="bg-purple-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
          <span>👤</span>
          <span>username98</span>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8 text-purple-400">Food Tracking</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1725] rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span>◼</span>
              <span>Calories Today</span>
            </div>
            <div className="text-2xl font-bold">{totalCalories}/{calorieGoal}</div>
            <div className="h-1.5 bg-white/10 rounded-full mt-3">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${caloriePercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-[#1a1725] rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span>◼</span>
              <span>Protein</span>
            </div>
            <div className="text-2xl font-bold">{totalProtein}/{proteinGoal}g</div>
            <div className="h-1.5 bg-white/10 rounded-full mt-3">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${proteinPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-[#1a1725] rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span>◼</span>
              <span>Water Intake</span>
            </div>
            <div className="text-2xl font-bold">{waterIntake}/{waterGoal}L</div>
            <div className="h-1.5 bg-white/10 rounded-full mt-3">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${waterPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Food Detection Panel */}
            <div className="bg-[#1a1725] rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Detect Food</h2>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || isWebcamActive}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Upload Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button
                  onClick={toggleWebcam}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path d="M14 6a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V8a2 2 0 00-2-2h-4z" />
                  </svg>
                  {isWebcamActive ? 'Stop Camera' : 'Start Camera'}
                </button>
                
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Clear All
                </button>
              </div>
              
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              {isWebcamActive && (
                <div className="mb-6">
                  <WebcamCapture onCapture={handleCaptureFromWebcam} />
                </div>
              )}
              
              {image && !isWebcamActive && (
                <div className="mb-6">
                  <div className="relative w-full h-64 bg-black/50 rounded-lg overflow-hidden">
                    <Image 
                      src={image} 
                      alt="Food image" 
                      layout="fill" 
                      objectFit="contain"
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Detected Food Items */}
            <div className="bg-[#1a1725] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Detected Food Items</h2>
              <FoodList items={detectedFoods} onRemove={removeFoodItem} />
            </div>
          </div>
          
          {/* Right Side Panel */}
          <div className="space-y-6">
            {/* Food Details Panel */}
            <div className="bg-[#1a1725] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Food Details</h2>
              
              {detectedFoods.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <div className="text-gray-400 mb-1">Latest Food</div>
                    <div className="text-xl font-medium">{detectedFoods[0].name}</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-400 mb-1">Calories</div>
                    <div className="flex justify-between mb-1">
                      <span>Amount</span>
                      <span>{detectedFoods[0].calories} kcal</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-400 mb-1">Confidence</div>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 ${star <= Math.round(detectedFoods[0].confidence * 5) ? 'text-purple-500' : 'text-white/20'}`}
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 italic">No food detected yet</div>
              )}
            </div>
            
            {/* Controls Panel */}
            <div className="bg-[#1a1725] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Controls</h2>
              
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Tracking
              </button>
              
              <button className="w-full border border-purple-600 text-purple-500 py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                End Tracking
              </button>
            </div>
            
            {/* Timer Panel */}
            <div className="bg-[#1a1725] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Tracking Time</h2>
              
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">00:00</div>
                <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* AI Assistant */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>AI Assistant Active</div>
              </div>
              
              <div className="mt-3 bg-green-900/20 border-l-2 border-green-600 p-4 rounded-lg text-green-300">
                Try adding your meal by uploading a photo or using your camera. I'll help identify the food and estimate calories.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}