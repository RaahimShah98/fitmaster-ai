# Run this file to start the FastAPI server
from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import base64
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
from pydantic import BaseModel

app = FastAPI(title="YOLOv8 Object Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model = YOLO("./model/best.pt")
print("Model loaded successfully.")

class Base64Image(BaseModel):
    image: str

# New endpoint to detect objects from a base64 image
@app.post("/detect/base64/")
async def detect_objects_base64(data: Base64Image):
    try:
        # Decode base64 image
        image_data = base64.b64decode(data.image.split(',')[1] if ',' in data.image else data.image)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert PIL Image to numpy array for OpenCV
        image_np = np.array(image)
        if len(image_np.shape) == 3 and image_np.shape[2] == 4:  # If RGBA, convert to RGB
            image_np = image_np[:, :, :3]
        
        # Run detection
        results = model(image_np)
        detections = []
        
        # Process results
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = model.names[cls]
                
                detections.append({
                    "label": label,
                    "confidence": round(conf, 3),
                    "box": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    }
                })
        
        return {"detections": detections}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)