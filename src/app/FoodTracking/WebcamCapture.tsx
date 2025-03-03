// app/food-tracker/components/WebcamCapture.tsx
import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string, detections: any[]) => void;
}

// For simplicity, we'll do basic detection
// In a real app, you would use a proper YOLO model loaded via TensorFlow.js
export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        setIsModelLoading(true);
        setModelError(null);
        
        // Initialize TensorFlow
        await tf.ready();
        
        // In a real implementation, you would load the YOLO model here
        // Example:
        // const loadedModel = await tf.loadGraphModel('your-model-url/model.json');
        
        // For this code, we'll simulate the model loading
        setTimeout(() => {
          setIsModelLoading(false);
          // Pretend we have a model
          setModel({} as tf.GraphModel);
        }, 2000);
        
      } catch (error: any) {
        console.error('Failed to load model', error);
        setModelError(error.message || 'Failed to load detection model');
        setIsModelLoading(false);
      }
    }
    
    loadModel();
    
    // Cleanup
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, []);

  // Start real-time detection when camera and model are ready
  useEffect(() => {
    if (model && isCameraReady && !detectionInterval) {
      const interval = setInterval(() => {
        detectFood();
      }, 1000); // Detect every second
      
      setDetectionInterval(interval);
      
      return () => {
        clearInterval(interval);
        setDetectionInterval(null);
      };
    }
  }, [model, isCameraReady]);

  const detectFood = async () => {
    if (!webcamRef.current || !webcamRef.current.video || !model) return;

    try {
      const video = webcamRef.current.video;
      
      // In a real implementation, you would:
      // 1. Convert the video frame to a tensor
      // 2. Run it through the YOLO model
      // 3. Process the detections
      
      // For demonstration, we'll generate random "detections"
      const mockFoodItems = ['apple', 'banana', 'pizza', 'burger', 'salad'];
      const mockDetections = [];
      
      // Randomly "detect" 0-2 food items
      const numDetections = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numDetections; i++) {
        const randomFood = mockFoodItems[Math.floor(Math.random() * mockFoodItems.length)];
        mockDetections.push({
          class: randomFood,
          score: 0.7 + (Math.random() * 0.3), // Random confidence between 0.7 and 1.0
          bbox: [Math.random() * 300, Math.random() * 300, 100, 100] // Random bounding box
        });
      }
      
      // Only trigger capture if we detect food
      if (mockDetections.length > 0) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          onCapture(imageSrc, mockDetections);
        }
      }
    } catch (error) {
      console.error('Error during detection:', error);
    }
  };

  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  return (
    <div className="relative">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "environment"
          }}
          onUserMedia={handleUserMedia}
          className="w-full h-64 object-cover"
        />
      </div>
      
      {isModelLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-2">Loading detection model...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      )}
      
      {modelError && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-center text-white bg-red-500 bg-opacity-80 p-4 rounded-lg max-w-sm">
            <div className="text-lg font-bold mb-2">Error</div>
            <div>{modelError}</div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-80 text-white rounded-lg p-2 text-sm">
        <div className="flex justify-between items-center">
          <div>
            {model ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
                Model loaded - looking for food items...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block mr-2"></span>
                Initializing food detection...
              </span>
            )}
          </div>
          <button
            onClick={() => {
              const imageSrc = webcamRef.current?.getScreenshot();
              if (imageSrc) {
                // Generate random detections for manual capture
                const mockDetections = [{
                  class: 'food item',
                  score: 0.95,
                }];
                onCapture(imageSrc, mockDetections);
              }
            }}
            className="bg-white text-gray-900 px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-200"
          >
            Capture Now
          </button>
        </div>
      </div>
    </div>
  );
}