'use client';

import React from 'react';

// FORMAT TO ADD FOOD INTO DATABASE
// interface NutritionalData {
//   name: string;
//   calories: number;
//   macros: {
//     carbohydrates: number;
//     protein: number;
//     fat: number;
//     fiber: number;
//   };
//   micros: {
//     vitaminA: number;
//     vitaminC: number;
//     calcium: number;
//     iron: number;
//     sodium: number;
//     potassium: number;
//   };
// }

interface NutritionalDetailsModalProps {
  food: string;
  foodNutrients: [];
  onClose: () => void;
}

const NutritionalDetailsModal: React.FC<NutritionalDetailsModalProps> = ({ food, foodNutrients, onClose }) => {
  console.log(food)
  console.log(foodNutrients)


  const foodData = foodNutrients.length > 0 ? foodNutrients.filter((item)=>item?.name==food)[0] : {
    name: 'Food Not Found',
    calories: 0,
    macros: { carbohydrates: 0, protein: 0, fat: 0, fiber: 0 },
    micros: { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0, sodium: 0, potassium: 0 },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-70" onClick={onClose}></div>

      <div className="relative bg-gray-900 text-white rounded-lg shadow-xl w-96 max-w-md overflow-hidden z-10">
        <div className="bg-purple-700 px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold">Nutritional Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4 text-purple-400">{foodData?.name}</h3>
          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Per 100g</div>
            <div className="text-3xl font-bold mb-4 text-center py-2 bg-purple-900 rounded-md">
              {foodData?.calories} calories
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2 border-b border-purple-600 pb-1">Macronutrients</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(foodData?.macros).map(([key, value]) => (
                <div key={key}>
                  <div className="text-gray-400 capitalize">{key}</div>
                  <div className="font-bold">{value}g</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 border-b border-purple-600 pb-1">Micronutrients</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(foodData?.micros).map(([key, value]) => (
                <div key={key}>
                  <div className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="font-bold">{key === 'sodium' || key === 'potassium' ? `${value}mg` : `${value}% DV`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalDetailsModal;
