"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Firestore
interface AuthContextType {
  user: User;
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
    if (user && user.email) {  // Only call if user exists
      console.log("CALLED");
      addDataToFireStore();
    }
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

  //add user detail to firebase
  async function addDataToFireStore() {
    try {
      if (!user || !user.email) {
        console.error("User is not defined or missing email!");
        return;
      }
      const userRef = doc(db, "user", user?.email);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const userSetDoc = doc(db, "user", user?.email); // Set email as document ID

        await setDoc(userSetDoc, {
          fullName: user?.email.split("@")[0], email: user?.email, dob: "", weight: 0, height: 0,
          weight_goal: "", Role: "user" ,status:"Active",subscription:"free" , TC:true , RegisterDate: new Date().toLocaleDateString() , lastUpdate : new Date().toLocaleDateString()
        });
        console.log("User added successfully!", user?.email);
      }
      else{
        // console.log("USER ALREADY EXISTS IN DB: " , user?.email)
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Signin with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const User = await signInWithPopup(auth, provider);
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
