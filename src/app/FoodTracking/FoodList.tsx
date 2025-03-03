// app/food-tracker/components/FoodList.tsx
import { useState } from 'react';

type DetectedFood = {
  id: string;
  name: string;
  confidence: number;
  calories?: number;
  timestamp: string;
};

interface FoodListProps {
  items: DetectedFood[];
  onRemove: (id: string) => void;
}

export default function FoodList({ items, onRemove }: FoodListProps) {
  const [sortBy, setSortBy] = useState<'timestamp' | 'confidence'>('timestamp');
  
  const getSortedItems = () => {
    return [...items].sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return b.confidence - a.confidence;
      }
    });
  };
  
  const getTotalCalories = () => {
    return items.reduce((sum, item) => sum + (item.calories || 0), 0);
  };
  
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-md">
        No food items detected yet. Upload an image or use the camera to detect food.
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'confidence')}
            className="text-sm border rounded-md px-2 py-1"
          >
            <option value="timestamp">Most Recent</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
        
        <div className="text-right">
          <span className="text-sm font-medium text-gray-600">Total Items: {items.length}</span>
          <div className="text-lg font-bold">Total Calories: {getTotalCalories()}</div>
        </div>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg border">
        <ul className="divide-y divide-gray-200">
          {getSortedItems().map((item) => (
            <li key={item.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>{item.calories} calories</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}