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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Food Tracker</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detect Food</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || isWebcamActive}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 flex items-center"
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
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                <path d="M14 6a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V8a2 2 0 00-2-2h-4z" />
              </svg>
              {isWebcamActive ? 'Stop Camera' : 'Start Camera'}
            </button>
            
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear All
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
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
              <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
                <Image 
                  src={image} 
                  alt="Food image" 
                  layout="fill" 
                  objectFit="contain"
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Detected Food Items</h2>
          <FoodList items={detectedFoods} onRemove={removeFoodItem} />
        </div>
      </div>
    </div>
  );
}