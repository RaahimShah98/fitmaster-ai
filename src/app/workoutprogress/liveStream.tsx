"use client";

import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as mediaPose from "@mediapipe/pose";
import * as drawUtils from "@mediapipe/drawing_utils";
import * as camUtils from "@mediapipe/camera_utils";
import { Play, Pause, ArrowRightLeft, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

import useWebSocket from "react-use-websocket";
import { useSpeech } from "@/context/SpeechContext";
import PredAnalyzer from "@/lib/predAnalyzer";
import BumpNumber from "@/components/BumpNumber";

import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/FirebaseContext";
import SuccessAlert from "@/components/SuccessAlert";
import { drawBicepPose, drawPushupPose, drawSquatPose } from "./utils";
// import { useRouter } from "next/router";

// import Whammy from "whammy";

// Save the original methods
const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices?.bind(
  navigator.mediaDevices
);
const originalGetUserMedia = navigator.mediaDevices.getUserMedia?.bind(
  navigator.mediaDevices
);

// Patch enumerateDevices
navigator.mediaDevices.enumerateDevices = async function () {
  const devices = await originalEnumerateDevices();

  const videoDevices = devices.filter((device) => device.kind === "videoinput");

  const realCameras = videoDevices.filter((device) => {
    const name = device.label.toLowerCase();
    return !(
      name.includes("manycam") ||
      name.includes("virtual") ||
      name.includes("obs")
    );
  });

  const uvcCameras = realCameras.filter((device) =>
    device.label.toLowerCase().includes("uvc")
  );

  const orderedVideoDevices = [
    ...uvcCameras,
    ...realCameras.filter(
      (device) => !device.label.toLowerCase().includes("uvc")
    ),
  ];

  const nonVideoDevices = devices.filter(
    (device) => device.kind !== "videoinput"
  );

  return [...nonVideoDevices, ...orderedVideoDevices];
};

// Patch getUserMedia
navigator.mediaDevices.getUserMedia = async function (constraints) {
  if (
    constraints &&
    constraints.video &&
    typeof constraints.video === "object" &&
    !constraints.video.deviceId
  ) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const firstCamera = devices.find((device) => device.kind === "videoinput");

    if (firstCamera) {
      constraints.video.deviceId = { exact: firstCamera.deviceId };
    }
  }
  return originalGetUserMedia(constraints);
};

const messagesMap = {
  landmarks_not_visible:
    "Please make sure your full body is visible in the camera",
  side_view_required:
    "Make sure to face sideways! Side view helps track your form more accurately.",
} as Record<string, string>;

// Format Date time
const getFormattedDateTime = (): string => {
  const now = new Date();

  // Get day, month, and year
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = now.getFullYear();

  // Get total minutes passed since midnight
  const totalMinutes = now.getHours() * 60 + now.getMinutes();

  return `${month}-${day}-${year}` + `-${totalMinutes}`;
};

const getOrCreateSessionId = () => {
  const existing = localStorage.getItem("workout_session_id");
  if (existing) {
    const existingDate = new Date(existing.split("-").slice(0, 3).join("-"));
    // Check if the date part of the existing ID is today

    const currentDate = new Date();

    if (
      existingDate.getDate() === currentDate.getDate() &&
      existingDate.getMonth() === currentDate.getMonth() &&
      existingDate.getFullYear() === currentDate.getFullYear()
    ) {
      return existing;
    } else {
      localStorage.removeItem("workout_session_id");
      console.log("Session ID expired, creating a new one.");
    }
  }

  const newId = getFormattedDateTime(); // or crypto.randomUUID();
  localStorage.setItem("workout_session_id", newId);
  return newId;
};

const predAnalyzer = new PredAnalyzer(1);
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

type ExerciseState = {
  state_seq: any[]; // Assuming it can hold any type of data, or use a more specific type if known
  DISPLAY_TEXT: boolean[];
  COUNT_FRAMES: number[];
  INCORRECT_POSTURE: boolean;
  prev_state: string | null;
  curr_state: string | null;
  REP_COUNT: number;
  IMPROPER_REP_COUNT: number;
  state_seq_2: any[]; // Same as state_seq, refine if possible
  exercise: string;
};

const exerciseToMuscleMap = {
  "bicep-curl": ["Biceps"],
  squat: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
  "push-up": ["Chest", "Triceps", "Shoulders", "Core"],
} as Record<string, string[]>;

const LiveStream = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const poseRef = useRef<mediaPose.Pose | null>(null);
  const cameraRef = useRef<any>(null);
  // const router = useRouter();

  const startTimeRef = useRef<number | null>(null);
  const [prediction, setPrediction] = useState("");
  const [resultImages, setResultImages] = useState([] as string[]);
  const [currentState, setCurrentState] = useState<ExerciseState | null>(null);
  const [allStates, setAllStates] = useState([]);
  const [promptUser, setPromptUser] = useState(true);
  const [predictionConfirmed, setPredictionConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { announceMessage, startVoiceRecognition } = useSpeech();
  const [showManualSelect, setShowManualSelect] = useState(false);

  const [poseResults, setPoseResults] = useState<any>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPoseReady, setIsPoseReady] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmEndWorkout, setConfirmEndWorkout] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }, [isCameraReady]);

  const resetSession = () => {
    localStorage.removeItem("workout_session_id");
    sessionIdRef.current = getFormattedDateTime(); // or UUID
  };
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getWebSocketUrl = () => {
    const hostname = window.location.hostname;

    // If running on localhost, use localhost
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "ws://localhost:8000/ws";
    }

    // Otherwise, use the hostname dynamically (mobile to LAN IP)
    return `ws://${hostname}:8000/ws`;
  };
  // Connect to the FastAPI WebSocket server
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<{
    prediction: {
      label: string;
      confidence: number;
    };
    message: string;
    image: string;
    state: ExerciseState;
  }>(
    getWebSocketUrl(), // FastAPI WebSocket endpoint
    {
      onOpen: () => setStatus("Connected"),
      onClose: () => setStatus("Disconnected"),
      onError: () => setStatus("Error"),
    }
  );

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

  // Update message history when a new message arrives
  useEffect(() => {
    console.log(lastJsonMessage);
    if (!lastJsonMessage) return;
    if (lastJsonMessage.prediction) {
      const lastPrediction = lastJsonMessage.prediction.label;
      const pred = predAnalyzer.analyze(lastPrediction);
      if (predAnalyzer.isStable()) {
        setPrediction(pred);
        announceMessage(
          `Are you performing ${pred}? Say "Yes" to confirm or "No" to try again.`
        );
        startVoiceRecognition((tr) => {
          if (tr.toLowerCase().includes("yes")) {
            handleConfirm(pred);
          } else if (tr.toLowerCase().includes("no")) {
            handleReject();
          }
        });
        setShowConfirmation(true);
        predAnalyzer.reset();
      }
    } else if (lastJsonMessage.image) {
      setResultImages((prev) => [...prev, lastJsonMessage.image]);
    }
    if (lastJsonMessage.state) {
      console.log("State received:", lastJsonMessage.state);
      if (!predictionConfirmed) {
        console.log("Ignoring state update as prediction is not confirmed");
        return;
      }
      const newState = lastJsonMessage.state;
      setCurrentState((prevState) => {
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
          setAllStates((prevStates) => {
            const uniqueStates = new Set(
              prevStates.map((s) => JSON.stringify(s))
            ); // Convert to Set for uniqueness
            uniqueStates.add(JSON.stringify(newState)); // Add only if new

            return Array.from(uniqueStates).map((s) => JSON.parse(s)) as any; // Convert back to objects
          });
          return newState;
        }
        return prevState;
      });
    }

    if (lastJsonMessage.message) {
      setMessage(
        messagesMap[lastJsonMessage.message] || lastJsonMessage.message
      );
      announceMessage(
        messagesMap[lastJsonMessage.message] || lastJsonMessage.message
      );
    }
  }, [lastJsonMessage]);

  const captureAndSendFrame = async (prediction: string) => {
    if (webcamRef.current) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Use video element to get real-time frame
      const video = webcamRef.current.video!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the frame to Base64
      const imageSrc = canvas.toDataURL("image/jpeg", 0.9); // ✅ Higher quality

      if (imageSrc) {
        const compressedImage = await resizeAndCompress(imageSrc, 220, 0.8);
        sendJsonMessage({ image: compressedImage, type: "img", prediction });
      }
    }
  };
  const resizeAndCompress = (
    base64Image: string,
    targetWidth = 320,
    quality = 0.7
  ) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Image;

      img.onload = () => {
        // Create a canvas element
        const canvas = document.createElement("canvas");
        const scaleFactor = targetWidth / img.width;
        canvas.width = targetWidth;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert the resized canvas to a compressed Base64 string
        const resizedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(resizedBase64);
      };
    });
  };
  useEffect(() => {
    console.log("captureAndSendFrame", predictionConfirmed);
    if (!predictionConfirmed) return;
    const interval = setInterval(() => {
      captureAndSendFrame(prediction);
    }, 60);

    return () => clearInterval(interval);
  }, [prediction, predictionConfirmed]);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>(
    [] as MediaDeviceInfo[]
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    console.log({ selectedDeviceId });
  }, [selectedDeviceId]);
  // Get available media devices

  useEffect(() => {
    if (!webcamRef.current || !isStarted) return;

    cameraRef.current = new camUtils.Camera(webcamRef.current.video!, {
      onFrame: async () => {
        if (webcamRef.current && poseRef.current) {
          await poseRef.current.send({ image: webcamRef.current.video! });
        }
      },
    });

    cameraRef.current.start();
    setIsCameraReady(true);

    return () => {
      cameraRef.current.stop();
    };
  }, [isStarted]);

  const predictionRef = useRef("");
  useEffect(() => {
    predictionRef.current = prediction;
  }, [prediction]);
  // useEffect(() => {
  //   if (!webcamRef.current || !isStarted) return;

  //   const setupCamera = async () => {
  //     if (!selectedDeviceId) return;

  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { deviceId: { exact: selectedDeviceId } },
  //     });

  //     webcamRef.current!.video!.srcObject = stream;

  //     await webcamRef.current!.video!.play();

  //     cameraRef.current = new camUtils.Camera(webcamRef.current!.video!, {
  //       onFrame: async () => {
  //         if (webcamRef.current && poseRef.current) {
  //           await poseRef.current.send({ image: webcamRef.current.video! });
  //         }
  //       },
  //       width: 640,
  //       height: 480,
  //     });

  //     cameraRef.current.start();
  //     setIsCameraReady(true);
  //   };

  //   setupCamera();

  //   return () => {
  //     cameraRef.current?.stop();
  //   };
  // }, [isStarted, selectedDeviceId]);
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
      const videoDevices = mediaDevices.filter(
        (device) => device.kind === "videoinput"
      );

      setDevices(videoDevices as any);
      // const uvcDevice = videoDevices.find((device) =>
      //   device.label.toUpperCase().includes("UVC")
      // );
      // if (uvcDevice) {
      //   setSelectedDeviceId(uvcDevice.deviceId as any);
      // } else {
      //   setSelectedDeviceId(videoDevices[0]?.deviceId as any);
      // }
    });
  }, []);

  // ✅ 2️⃣ Pose Model Setup - Runs Once on Mount
  useEffect(() => {
    const pose = new mediaPose.Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      setPoseResults(results); // ✅ Store pose results in state

      const canvasCtx = canvasRef.current?.getContext("2d");
      const canvasElement = canvasRef.current;
      if (!canvasCtx || !canvasElement) return;

      // Clear canvas
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Optional: draw mirrored image for selfie view
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
      const currentPred = predictionRef.current;
      console.log({ currentPred }, { results });
      if (currentPred === "bicep-curl") {
        drawBicepPose(canvasCtx, results.poseLandmarks, mediaPose);
      }
      if (currentPred === "push-up") {
        drawPushupPose(canvasCtx, results.poseLandmarks, mediaPose);
      }
      if (currentPred === "squat") {
        drawSquatPose(canvasCtx, results.poseLandmarks, mediaPose);
      }

      canvasCtx.restore();
    });

    poseRef.current = pose;
    setIsPoseReady(true);
  }, []); // ✅ Runs only once

  // ✅ 3️⃣ Send Landmarks to Backend - Runs When `poseResults` Updates
  useEffect(() => {
    if (
      !poseResults?.poseLandmarks ||
      !isCameraReady ||
      !isPoseReady ||
      prediction ||
      promptUser
    )
      return;

    sendJsonMessage({
      landmarks: poseResults.poseLandmarks,
      type: "landmarks",
    });
    setIsProcessing(true);
  }, [poseResults, isCameraReady, isPoseReady, prediction, promptUser]);

  const handleConfirm = (prediction: string) => {
    setPredictionConfirmed(true);
    const startTime = Date.now();
    startTimeRef.current = startTime;
    announceMessage(`Exercise confirmed: ${prediction}`);
    setShowConfirmation(false);
  };
  const handleReject = () => {
    setShowConfirmation(false);
    setPrediction("");
    setPredictionConfirmed(false);
    predAnalyzer.reset();
    announceMessage("Sorry, please try again");
  };

  const handleRestart = () => {
    // setPrediction("");
    // setPredictionConfirmed(false);
    // setPromptUser(true);
    addToDB2();
    setPrediction("");
    setPredictionConfirmed(false);
    setPromptUser(true);
    setConfirmEndWorkout(false);
    setCurrentState(null);
  };

  const endWorkoutSession = () => {
    setConfirmEndWorkout(true);
  };

  const addToDB2 = async () => {
    if (!currentState || !email) {
      console.log("No current state or email", currentState, email);
      return;
    }

    const { exercise, IMPROPER_REP_COUNT, REP_COUNT } = currentState;
    const workedOutPerformed = {
      name: exercise,
      rep_count: REP_COUNT,
      improper_rep_count: IMPROPER_REP_COUNT,
    };

    const sessionId = sessionIdRef.current;

    // 1. Ensure session metadata exists
    const sessionMetaRef = doc(
      db,
      "user_exercise_data",
      email,
      "sessions",
      sessionId
    );
    await setDoc(
      sessionMetaRef,
      {
        started_at: sessionId, // or you can store Date.now() / new Date().toISOString()
      },
      { merge: true }
    );

    // 2. Store exercise under exercises subcollection
    const exercisesRef = collection(
      db,
      "user_exercise_data",
      email,
      "sessions",
      sessionId,
      "exercises"
    );
    const docRef = await addDoc(exercisesRef, {
      content: workedOutPerformed,
      recorded_at: new Date().toISOString(),
    });

    sendJsonMessage({ type: "reset" });
    console.log("Exercise written with ID:", docRef.id);
  };
  const addToDB = async () => {
    if (!currentState) return;
    const { exercise, IMPROPER_REP_COUNT, REP_COUNT } = currentState;
    const workedOutPerformed = {
      name: exercise,
      rep_count: REP_COUNT,
      improper_rep_count: IMPROPER_REP_COUNT,
    };
    const postsRef = collection(
      db,
      "user_exercise_data",
      email!,
      "sessions",
      sessionIdRef.current,
      "exercises"
    );
    const docRef = await addDoc(postsRef, {
      content: workedOutPerformed,
    });
    sendJsonMessage({ type: "reset" });
    console.log("Document written with ID: ", docRef.id);
  };
  const onEndWorkoutSessionConfirmed = async () => {
    await addToDB2();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    setPrediction("");
    setPredictionConfirmed(false);
    // setPromptUser(true);
    setConfirmEndWorkout(false);
    console.log("Setting current state to null");
    const sessionId = sessionIdRef.current;
    resetSession();
    setCurrentState(null);

    setTimeout(() => {
      window.location.href = `/workoutSummary/${sessionId}`;
    }, 1500);
  };

  // const [videoURL, setVideoURL] = useState<any>(null);
  // const handleGenerateVideo = async () => {
  //   const url = await createVideo(resultImages);
  //   setVideoURL(url);
  // };
  return (
    <>
      {/* {videoURL && <video controls width="400" src={videoURL}></video>}
      <button onClick={handleGenerateVideo}>Generate Video</button> */}
      {showSuccess && (
        <SuccessAlert message="Saved Exercise Succesfully! Redirecting to Summary page..." />
      )}
      {confirmEndWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setConfirmEndWorkout(false)}
        >
          <div
            className="bg-gray-900 w-[35%] flex justify-center p-12 text-white flex-col items-center rounded-2xl shadow-xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-2xl font-bold text-gray-100 mb-6 text-center">
              Do You Want To End Your Workout Session?
            </h1>
            <div className="flex justify-center gap-6">
              <button
                onClick={onEndWorkoutSessionConfirmed}
                className="rounded bg-purple-600 hover:bg-purple-700 px-6 py-3 text-white font-semibold transition-all"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmEndWorkout(false)}
                className="rounded border-2 border-purple px-6 py-3 text-purple font-semibold hover:bg-white hover:text-black transition-all"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-xl bg-yellow-500/20 text-yellow-300 px-4 py-2 text-center font-semibold shadow">
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Sets Card */}
        <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-4 flex items-center">
          <div className="bg-purple-900/50 p-3 rounded-lg mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-400"
            >
              <path d="M20 14V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7"></path>
              <path d="M12 12v8"></path>
              <path d="M18 17v.8a2 2 0 0 1-2 2.2H8a2 2 0 0 1-2-2.2V17"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Total Sets</h3>
            <p className="text-2xl font-bold">
              {Math.floor((currentState?.REP_COUNT || 0) / 10).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Total Reps Card */}
        <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-4 flex items-center">
          <div className="bg-indigo-900/50 p-3 rounded-lg mr-4">
            <Dumbbell />
          </div>
          <div className="flex justify-between items-center gap-8">
            <div className="text-center">
              <h3 className="text-gray-400 text-sm">Correct Reps</h3>
              <BumpNumber
                value={currentState?.REP_COUNT || 0}
                color="text-green-500"
                isSuccess
                soundEffectUrl="/sound-effects/correct.mp3"
              />

              {/* <p className="text-green-500 text-xl font-bold">
                {currentState?.REP_COUNT || 0}
              </p> */}
            </div>

            <div className="text-center">
              <h3 className="text-gray-400 text-sm">Incorrect Reps</h3>
              <BumpNumber
                value={currentState?.IMPROPER_REP_COUNT || 0}
                color="text-red-500"
                soundEffectUrl="/sound-effects/wrong.mp3"
              />
              {/* <p className="text-red-500 text-xl font-bold">
                {currentState?.IMPROPER_REP_COUNT || 0}
              </p> */}
            </div>
          </div>
          {/* <div>
            <h3 className="text-gray-400 text-sm mt-2">Correct Reps</h3>
            <p className="text-green-500 text-xl font-bold">
              {currentState?.REP_COUNT || 0}
            </p>

            <h3 className="text-gray-400 text-sm mt-2">Incorrect Reps</h3>
            <p className="text-red-500 text-xl font-bold">
              {currentState?.IMPROPER_REP_COUNT || 0}
            </p>
          </div> */}
        </div>

        {/* Current Exercise Card */}
        <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-4 flex items-center">
          <div className="bg-blue-900/50 p-3 rounded-lg mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-400"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M6 8h-1a4 4 0 0 0 0 8h1"></path>
              <path d="M8 6v12"></path>
              <path d="M16 6v12"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Current Exercise</h3>
            <p className="text-xl font-bold">
              {prediction || "No exercise detected"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {promptUser && (
            <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black bg-opacity-50">
              <div className="w-[450px] rounded-lg bg-white p-6 text-black shadow-lg">
                <h2 className="text-lg font-bold ">Perform Exercise</h2>
                <p>
                  Move and perform an exercise so we can detect it. Please make
                  sure your full body is visible in the camera. Click on "Start
                  Exercise" when you're ready.
                </p>
                <Button className="mt-2" onClick={() => setPromptUser(false)}>
                  OK
                </Button>
              </div>
            </div>
          )}

          {showConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-[400px] rounded-lg bg-white p-6 text-black shadow-lg">
                <h2 className="text-lg font-bold mb-2">Confirm Exercise</h2>
                <p className="mb-4">
                  Are you performing <strong>{prediction}</strong>?
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleConfirm(prediction)}
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowManualSelect(true)}
                    className="rounded bg-red-500 px-4 py-2 text-white"
                  >
                    No
                  </button>
                </div>

                {showManualSelect && (
                  <div className="mt-6">
                    <label
                      htmlFor="manualExercise"
                      className="block mb-2 font-semibold"
                    >
                      Select Exercise Manually
                    </label>
                    <select
                      id="manualExercise"
                      className="w-full rounded border border-gray-300 p-2"
                      onChange={(e) => {
                        setPrediction(e.target.value);
                        handleConfirm(e.target.value);
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        -- Choose Exercise --
                      </option>
                      {Object.keys(exerciseToMuscleMap).map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* {showConfirmation && (
            <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black bg-opacity-50">
              <div className="w-[400px] rounded-lg bg-white p-6 text-black shadow-lg">
                <h2 className="text-lg font-bold">Confirm Exercise</h2>
                <p>Are you performing {prediction}?</p>

                <button
                  key={prediction}
                  onClick={() => handleConfirm(prediction)}
                  className="m-2 rounded bg-blue-500 p-2 text-white"
                >
                  Yes
                </button>
                <button
                  onClick={handleReject}
                  className="m-2 rounded bg-red-500 p-2 text-white"
                >
                  No
                </button>
              </div>
            </div>
          )} */}
          <div>
            <div
              className="flex justify-between"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p>Connection Status: {status}</p>
                {/* <h2 className="text-lg font-bold">Real-Time Pose Correction</h2> */}
              </div>
            </div>
            <div
              className="relative flex flex-row justify-center"
              style={{
                maxHeight: "600px",
              }}
            >
              {/* <div className="relative"> */}
              <div className="absolute top-0 right-0 z-10">
                <select
                  className="bg-zinc-800 text-white text-sm px-3 py-1 rounded-md shadow-sm border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  value={selectedDeviceId || ""}
                >
                  <option value="" disabled>
                    Select Camera
                  </option>
                  {devices.map((device, index) => (
                    <option value={device.deviceId} key={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded object-cover"
                videoConstraints={{
                  deviceId: selectedDeviceId
                    ? { exact: selectedDeviceId }
                    : undefined,
                }}
                onUserMedia={(stream) => {
                  const videoTrack = stream.getVideoTracks()[0];
                  console.log("Using video device:", videoTrack.label);

                  videoTrack.onended = () => {
                    console.error(
                      "Video track ended — the camera feed was interrupted!"
                    );
                  };
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none rounded object-cover"
              />

              <div
                className={`color absolute left-[${
                  isStarted ? "31%" : "38%"
                }] top-0 z-10 mt-4 text-center`}
              >
                <h1
                  style={{
                    fontWeight: 800,
                    color: "black",
                    fontSize: "1.5rem",
                  }}
                >
                  {!isStarted ? (
                    "Waiting to start..."
                  ) : (
                    <>
                      Prediction: {!prediction ? "Processing..." : prediction}
                      {predAnalyzer.history.length
                        ? ` (${(
                            (predAnalyzer.history.length /
                              predAnalyzer.historySize) *
                            100
                          ).toFixed(0)}%)`
                        : ""}
                    </>
                  )}
                </h1>
              </div>
            </div>
            {/* <div className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">
            Latest Exercise Stats
          </h2>
          {Object.entries(getLatestRepCounts(allStates)).map(
            ([exercise, counts]) => (
              <div key={exercise} className="rounded-lg bg-gray-100 p-4 shadow">
                <h3 className="text-lg font-bold text-black">
                  {exercise.toUpperCase()}
                </h3>
                <p className="text-gray-700">✅ Reps: {counts.REP_COUNT}</p>
                <p className="text-red-500">
                  ❌ Improper Reps: {counts.IMPROPER_REP_COUNT}
                </p>
              </div>
            )
          )}
        </div>
        <div>State: {JSON.stringify(currentState, null, 2)}</div> */}

            {/* <CardFooter>
          results:
          {resultImage && (
            <img src={'data:image/jpeg;base64,' + resultImage} alt="image" />
          )}
        </CardFooter> */}

            {/* <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            padding: "10px",
          }}
        >
          {allStates.length > 0 ? (
            allStates.map((state, index) => (
              <pre key={index}>{JSON.stringify(state, null, 2)}</pre>
            ))
          ) : (
            <p>No states received yet.</p>
          )}
        </div> */}
          </div>
        </div>
        {/* Live Camera View */}
        {/* <LiveStream /> */}
        {/* Exercise Controls and Stats */}
        <div className="w-full md:w-80 space-y-4">
          {/* Exercise Details Card */}
          <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-5">
            <h3 className="text-xl font-bold mb-4">Exercise Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Target Muscles</p>
                <p className="font-medium">
                  {exerciseToMuscleMap[prediction]?.join(", ") || "N/A"}
                </p>
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
              {isStarted ? (
                <button
                  onClick={() => setIsStarted(false)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium transition hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Pause size={20} />
                  Pause
                </button>
              ) : (
                <button
                  onClick={() => setIsStarted(true)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition hover:opacity-90 flex items-center justify-center gap-2"
                >
                  Start Exercise
                </button>
              )}
              {predictionConfirmed && (
                <div>
                  <button
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition hover:opacity-90 flex items-center justify-center gap-2"
                    onClick={handleRestart}
                  >
                    <ArrowRightLeft />
                    Change Exercise
                  </button>
                </div>
              )}

              <button
                onClick={endWorkoutSession}
                //   onClick={endExerciseSession}
                className="w-full py-3 rounded-lg border border-purple-500 text-purple-400 font-medium transition hover:bg-purple-900/30"
              >
                End Workout Session
              </button>
            </div>
          </div>

          {/* Timer Card */}
          <div className="bg-[#1E1E3F] rounded-2xl shadow-lg p-5 flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Workout Time</p>
              <p className="text-2xl font-bold">
                {formatTime(
                  startTimeRef.current
                    ? Math.floor((Date.now() - startTimeRef.current) / 1000)
                    : 0
                )}
              </p>
            </div>

            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 9v6l5-3-5-3Z"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveStream;
