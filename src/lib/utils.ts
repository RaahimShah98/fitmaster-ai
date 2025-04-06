import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "./firebase";
import { getDocs, collection } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export async function fetchCalories(email: string) {
  const postsRef = collection(db, "food_logs", email, getFormattedDateTime());
  // console.log(postsRef)
  const querySnapshot = await getDocs(postsRef);

  const totalCalories = querySnapshot.docs.reduce((sum, doc) => {
    return doc.data().content.calories + sum;
  }, 0);
  // console.log("CALORIES: ", totalCalories)
  return totalCalories;
}

export async function getSessionForDaysAgo(daysAgo: number, email: string) {
  const sessionsRef = collection(db, "user_exercise_data", email, "sessions");
  const daysAgoDate = new Date();
  daysAgoDate.setDate(daysAgoDate.getDate() - daysAgo);
  const snapshot = await getDocs(sessionsRef);
  const recentSessions: string[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const sessionTime = new Date(
      data.started_at.split("-").slice(0, 3).join("-")
    );
    if (sessionTime >= daysAgoDate) {
      recentSessions.push(docSnap.id); // sessionId
    }
  });

  return recentSessions;
}

export const getExercisesFromSessions = async (
  email: string,
  sessionIds: string[]
) => {
  const allExercises: any[] = [];

  for (const sessionId of sessionIds) {
    const exercisesRef = collection(
      db,
      "user_exercise_data",
      email,
      "sessions",
      sessionId,
      "exercises"
    );

    const snapshot = await getDocs(exercisesRef);
    snapshot.forEach((doc) => {
      const data = doc.data();
      allExercises.push({
        ...data.content,
        sessionId,
        recorded_at: data.recorded_at,
      });
    });
  }

  return allExercises;
};
