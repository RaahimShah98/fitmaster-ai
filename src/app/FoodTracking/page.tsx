// app/food-tracker/page.tsx
'use client';
import React from 'react';
import FloatingNav from '@/components/FloatingNav';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import fetchPredictions from './getPrediction';
import NutritionalDetailsModal from './nutritionDisplay';
import getFoodItems from './FoodDatabase';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/FirebaseContext';

type DetectedFood = {
  id: string;
  name: string;
  confidence: number;
  calories?: number;
  timestamp: string;
};


export default function FoodTracker() {
  const { user } = useAuth();
  const email = user?.email || ""; // Use optional chaining
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);

  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);  // Selected Food

  const [foodNutrients, setFoodNutrients] = useState<any[]>([]);
  const [calories, setCalories] = useState<number>(0);
  const [proteins, setProteins] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);

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

    } catch (err: any) {
      console.error('Error processing image:', err);
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };


  //Clear Food List
  const clearAll = () => {
    setDetectedFoods([]);
    setImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  //get Predictions for food
  const getPrediction = async () => {
    const predictions = await fetchPredictions(image);
    setDetectedFoods([...predictions.detections])
    console.log(predictions.detections);

  }

  // Fetch Food Nutrient data
  const fetchFoodData = async () => {
    try {
      const foodItems = await getFoodItems(detectedFoods);
      console.log("ITEMS DATA: ", foodItems); // Properly logs resolved data
      setFoodNutrients(foodItems)
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  useEffect(() => {
    console.log("detected: ", detectedFoods)
    fetchFoodData()
  }, [detectedFoods])

  // Calculate total calories , Macros
  const calculateCalories = () => {
    const totalCalories = foodNutrients.reduce((acc, item) => acc + item.calories, 0);
    setCalories(totalCalories)
    console.log("TOTAL : ", totalCalories)

  }

  const calculateProtein = () => {
    const totalProtein = foodNutrients.reduce((acc, item) => acc + item.macros.protein, 0);
    setProteins(totalProtein)
  }

  const calculateCarbs = () => {
    const totalCarbs = foodNutrients.reduce((acc, item) => acc + item.macros.carbohydrates, 0);
    setCarbs(totalCarbs)
  }

  const calculateFats = () => {
    const totalFats = foodNutrients.reduce((acc, item) => acc + item.macros.fat, 0);
    setFats(totalFats)
  }

  useEffect(() => {
    console.log(foodNutrients)
    calculateCalories()
    calculateProtein()
    calculateCarbs()
    calculateFats()
  }, [foodNutrients])

  //Log Meal
  const getFormattedDateTime = (): string => {
    const now = new Date();

    // Get day, month, and year
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = now.getFullYear();

    // Get total minutes passed since midnight
    const totalMinutes = now.getHours() * 60 + now.getMinutes();

    return `${day}-${month}-${year}`;
  };

  const logMeal = async () => {
    console.log(foodNutrients)
    // if(foodNutrients.length ==0){
    //   alert("No foods detected")
    //   return;
    // }
    try {
      // Reference the subcollection (users/{userId}/posts)
      const postsRef = collection(db, "food_logs", email, getFormattedDateTime());
      console.log(postsRef)
      // Add a new document to the subcollection
      foodNutrients.map(async (food ,index) => {
        console.log("LOGGING FOOD: ", food.name , index);

        const docRef = await addDoc(postsRef, {
          content: food,
        });

        console.log("Food added successfullly:", docRef.id , food.name);
        alert("Post added successfully!");
      })

    } catch (error) {
      console.error("Error adding post:", error);
    }


  }

  //Close Food ITEM
  const closeModal = () => {
    setSelectedFood(null);
  };

  return (
    <div className="relative min-h-screen bg-[#0f0d1a] py-6 text-white">
      <div className="absolute  inset-0 bg-[#0f0d1a]"></div>
      <FloatingNav floating={true} />

      <div className="max-w-6xl mx-auto px-6 relative flex-grow pt-20">
        <h1 className="text-3xl font-bold mb-8 text-purple-400">Food Tracking</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1725] rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span>◼</span>
              <span>Calories in your Meal</span>
            </div>
            <div className="text-2xl font-bold">{calories}</div>
          </div>

          <div className="bg-[#1a1725] rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span>◼</span>
              <span>Protein</span>
            </div>
            <div className="text-2xl font-bold">{proteins}/{detectedFoods.length * 100}g</div>
            <div className="h-1.5 bg-white/10 rounded-full mt-3">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${(detectedFoods.length > 0 ? (proteins / (detectedFoods.length * 100)) * 100 : 0)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[#1a1725] rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span>◼</span>
              <span>Carbs</span>
            </div>
            <div className="text-2xl font-bold">{carbs}/{detectedFoods.length * 100}g</div>
            <div className="h-1.5 bg-white/10 rounded-full mt-3">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${(detectedFoods.length > 0 ? (carbs / (detectedFoods.length * 100)) * 100 : 0)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-[#1a1725] rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <span>◼</span>
              <span>Fats</span>
            </div>
            <div className="text-2xl font-bold">{fats}/{detectedFoods.length * 100}g</div>
            <div className="h-1.5 bg-white/10 rounded-full mt-3">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${(detectedFoods.length > 0 ? (fats / (detectedFoods.length * 100)) * 100 : 0)}%` }}
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

              {image && (
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
                  <div className='pt-4'>
                    <button
                      onClick={getPrediction}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition-colors"
                    >
                      Track my Food
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Side Panel */}
          <div className="space-y-6">
            {/* Food Details Panel */}
            <div className="bg-[#1a1725] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Food Items</h2>

              {detectedFoods.length > 0 ? (
                <div className="grid grid-cols-[75%_25%] w-full ">
                  {/* Table Header */}
                  <div className="p-2 font-bold border-b border-gray-300" >Food</div>
                  <div className="p-2 font-bold border-b border-gray-300">Quantity</div>
                  {/* Table Rows (Example) */}
                  {detectedFoods.map((food, index) => (
                    <React.Fragment key={index}>
                      <div className="p-2 border-b border-gray-200" onClick={() => setSelectedFood(food.label)}>{food.label}</div>
                      <div className="p-2 border-b border-gray-200">1</div>
                    </ React.Fragment>
                  ))}

                </div>
              ) : (
                <div className="text-gray-400 italic">No food detected yet</div>
              )}
            </div>

            {selectedFood && (
              <NutritionalDetailsModal food={selectedFood} foodNutrients={foodNutrients} onClose={closeModal} />
            )}
            <div className='pt-4 w-full'>
              <button
                onClick={logMeal}
                className=" flex items-center justify-center w-full center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition-colors"
              >
                Log My Meal
              </button>
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