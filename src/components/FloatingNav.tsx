'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Move } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/FirebaseContext';

interface FloatingNavProps {
  setLoginPage: (page: string) => void;
}


const FloatingNav: React.FC<FloatingNavProps> = ({ setLoginPage , floating =true }) => {

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter()
  const email = user?.email || ""; // Use optional chaining

  // console.log("EMAIL: ", email);


  const DropDownItems = [{ name: "Profile", action: () => reDirect() }, { name: "Start Workout", action: () => startWorkout() }, { name: "Track Food", action: () => trackFood() }, { name: "Logout", action: () => handleSignOut() }];

  const handleSignOut = async () => {
    try {
      await logout()
      router.replace('/');

    }
    catch (e) {
      console.log(e)
    }
  }

  const reDirect = () => {
    router.push('/UserDashboard')

  }

  const startWorkout = () => {
    router.push('/workoutprogress')

  }

  const trackFood = () => {
    router.push('/FoodTracking')

  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${floating ? "fixed top-0 w-full" : "relative "} left-0 right-0 z-50 bg-black/20 backdrop-blur-sm p-4 border-b border-white/10`}

    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className='flex items-center space-x-2'>
            <Move className="h-8 w-8 text-purple-300" />
            <span className="text-white font-semibold text-xl">FitMaster AI</span>
          </Link>
        </div>

        {/* Hamburger Button (Mobile View)
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden w-10 h-10 flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
        >
          <span className="sr-only">Toggle Navigation</span>
          <div className="relative">
            {isExpanded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="block w-6 h-[2px] bg-white rotate-45 transform"></span>
                <span className="block w-6 h-[2px] bg-white -rotate-45 transform absolute"></span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="block w-6 h-[2px] bg-white"></span>
                <span className="block w-6 h-[2px] bg-white"></span>
                <span className="block w-6 h-[2px] bg-white"></span>
              </div>
            )}
          </div>
        </button> */}

       
        {/* {email == "" && <Link
          href={"/LoginForm"}
          onClick={() => setLoginPage('logIn')}
          className="md:hidden bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-full 
          transition-all duration-300 hover:scale-105"
        >
          Sign in
        </Link>
        } */}

        {email == "" && <Link
          href={"/LoginForm"}
          onClick={() => setLoginPage('logIn')}
          className=" block bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-full 
          transition-all duration-300 hover:scale-105"
        >
          Sign in
        </Link>
        }

        {email != "" && <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:flex bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-full 
          transition-all duration-300 hover:scale-105 w-32 overflow-hidden relative"
          >
            <img
              src="data:image/png;base64,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"
              className="hidden md:block w-6 h-6 rounded-full mr-[10px]" alt="User"
            />
            <span className="truncate w-full block">{user?.email?.split("@")[0]}</span>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
              <ul className="py-2 text-sm text-gray-700">
                {DropDownItems.map((item) => (
                  <li key={item.name} className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={item.action}>
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        }
      </div>
    </motion.nav>
  );
};

export default FloatingNav;
