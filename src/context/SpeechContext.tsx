"use client";

import React, { createContext, useState, useCallback, useRef } from "react";

export const SpeechContext = createContext({
  announceMessage: (message: string) => {},
  startVoiceRecognition: (onResult: (transcript: string) => void) => {},
});

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const SpeechProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastSpokenMessage, setLastSpokenMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const lastSpokenMessageRef = useRef<string | null>(null);
  const lastMessageTimeRef = useRef<number>(0);

  // Function to read a message aloud
  const readMessageAloud = useCallback((message: string) => {
    const speech = new SpeechSynthesisUtterance(message);
    const voices = window.speechSynthesis.getVoices();
    speech.voice =
      voices.find((voice) => voice.name.includes("Google US English")) ||
      voices[0];
    speech.rate = 1.1; // Set speech rate for trainer
    speech.pitch = 1.2; // Set pitch for motivation
    speech.volume = 1;

    speech.onend = () => {
      cooldownRef.current = false;
      // Reset cooldown after speaking
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
    setLastSpokenMessage(message); // Update the last spoken message
  }, []);

  // Filter and announce messages only when not recently spoken
  const cooldownRef = useRef<boolean>(false);

  const announceMessage = useCallback(
    (newMessage: string) => {
      const currentTime = Date.now();

      // If message is the same and less than 10s passed, skip
      if (
        cooldownRef.current ||
        (newMessage === lastSpokenMessageRef.current &&
          currentTime - lastMessageTimeRef.current < 10000)
      ) {
        return;
      }

      // Update cooldown immediately
      cooldownRef.current = true;
      lastMessageTimeRef.current = currentTime;
      lastSpokenMessageRef.current = newMessage;

      setIsSpeaking(true);
      readMessageAloud(newMessage);

      // Reset cooldown after 5 seconds
      setTimeout(() => {
        cooldownRef.current = false;
      }, 5000);
    },
    [readMessageAloud]
  );

  const startVoiceRecognition = useCallback(
    (onResult: (transcript: string) => void) => {
      if (!SpeechRecognition) {
        console.warn("Voice recognition is not supported on this browser.");
        return;
      }

      if (recognitionRef.current) {
        console.log("Voice recognition already running.");
        return; // ✅ Prevent multiple instances
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voice input:", transcript);

        recognition.stop(); // ✅ Stop recognition immediately after getting input
        recognitionRef.current = null; // ✅ Reset reference to allow a new session
        onResult(transcript);
      };

      recognition.onend = () => {
        console.log("Voice recognition ended.");
        recognitionRef.current = null; // ✅ Ensure new calls can restart recognition
      };

      recognition.onerror = (event: any) => {
        console.error("Voice Recognition Error:", event.error);
        recognitionRef.current = null; // ✅ Reset on error
      };

      if (!isSpeaking) {
        recognition.start(); // ✅ Only start if not currently speaking
      }

      // Return function to manually stop recognition when needed
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      };
    },
    [isSpeaking]
  );

  return (
    <SpeechContext.Provider value={{ announceMessage, startVoiceRecognition }}>
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => React.useContext(SpeechContext);
