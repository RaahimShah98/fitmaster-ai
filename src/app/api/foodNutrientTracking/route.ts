// app/api/detect-food/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// In a real app, you would use a proper ML model service
// like TensorFlow Serving, a cloud ML API, or edge inference
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    // In a production application, you would:
    // 1. Save the image to a temporary location
    // 2. Pass the image to your YOLO model
    // 3. Process the results
    
    // Simulate YOLO detection with mock data
    // In a real app you would call your ML service here
    const mockDetections = simulateYoloDetection(image.name);
    
    // Optional: Save the image for debugging/training
    // const bytes = await image.arrayBuffer();
    // const buffer = Buffer.from(bytes);
    // const imageName = `${uuidv4()}.jpg`;
    // const imagePath = path.join(process.cwd(), 'public', 'uploads', imageName);
    // await writeFile(imagePath, buffer);
    
    return NextResponse.json({
      success: true,
      detections: mockDetections,
      // imagePath: `/uploads/${imageName}` // If you save the image
    });
    
  } catch (error: any) {
    console.error('Error in food detection:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}

function simulateYoloDetection(imageName: string) {
  // Possible food items to "detect"
  const foodItems = [
    { name: 'apple', calories: 95 },
    { name: 'banana', calories: 105 },
    { name: 'orange', calories: 62 },
    { name: 'pizza', calories: 285 },
    { name: 'burger', calories: 354 },
    { name: 'sandwich', calories: 250 },
    { name: 'salad', calories: 150 },
    { name: 'pasta', calories: 220 },
    { name: 'rice', calories: 130 },
    { name: 'bread', calories: 75 },
    { name: 'donut', calories: 195 },
    { name: 'cake', calories: 350 },
  ];
  
  // Number of items to "detect" (1-3)
  const numDetections = Math.floor(Math.random() * 3) + 1;
  
  // Generate detections
  const detections = [];
  
  for (let i = 0; i < numDetections; i++) {
    // Pick a random food item
    const foodIndex = Math.floor(Math.random() * foodItems.length);
    const food = foodItems[foodIndex];
    
    // Generate a random confidence score (0.65-1.0)
    const confidence = 0.65 + (Math.random() * 0.35);
    
    // Generate random bounding box coordinates
    const x = Math.floor(Math.random() * 300);
    const y = Math.floor(Math.random() * 300);
    const width = Math.floor(Math.random() * 100) + 50;
    const height = Math.floor(Math.random() * 100) + 50;
    
    detections.push({
      name: food.name,
      confidence: confidence,
      calories: food.calories,
      bbox: [x, y, width, height],
    });
  }
  
  return detections;
}