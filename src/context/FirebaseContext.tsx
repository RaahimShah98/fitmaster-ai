"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
// Firestore

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // console.log("USER: " , user);
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("CALLED")
    addDataToFireStore()
  }, [user]);

  //Register User
  const signUp = async (email: string, password: string) => {
    try {
      const User = await createUserWithEmailAndPassword(auth, email, password);
      setUser(User.user);
      return true;
    }
    catch (e) {
      console.log(e.message);
      return { bool: false, message: e.message };
    }

  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const User = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = User.user.email
      setUser(User.user);
      return userEmail

    } catch (e) {
      console.log("ERROR: ", e.code);
      return e.code;
    }
  };

  async function addDataToFireStore() {
    console.log(user);
    try {

      if (!user || !user.email) {
        console.error("User is not defined or missing email!");
        return;
      }

      const userRef = doc(db, "user", user?.email); // Set email as document ID
      await setDoc(userRef, {
        fullName: user?.email.split("@")[0], email: user?.email, dob: "", weight: "", height: "",
        weight_goal: "", Role: "user", RegisterDate: new Date().toLocaleDateString()
      });
      console.log("User added successfully!", user?.email);
    } catch (error) {
      console.log(error);
    }
  }

  // Signin with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const User = await signInWithPopup(auth, provider);

    console.log(User.user);
    setUser(User.user);
    
  }

  //Logout User
  const logout = async () => {
    console.log("pressed")
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signIn, signUp, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
