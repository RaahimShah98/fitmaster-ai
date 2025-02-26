'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Move } from 'lucide-react';

const FloatingNav = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Contact', href: '#contact' },
    { name: 'About Us', href: '#about' },
    { name: 'Blog', href: '#blog' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm p-4 border-b border-white/10"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <Move className="h-8 w-8 text-purple-300" />
          <span className="text-white font-semibold text-xl">FitMaster AI</span>
        </div>

        {/* Hamburger Button (Mobile View) */}
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
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isExpanded ? 'block' : 'hidden'
          } absolute md:static right-4 top-16 md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 
          bg-black/30 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none`}
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-300 hover:text-white hover:bg-white/10 md:hover:bg-transparent rounded-lg px-4 py-2 md:px-0 transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Start Training Button */}
        <a
          href="#start-training"
          className="hidden md:block bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-full 
          transition-all duration-300 hover:scale-105"
        >
          Start Training
        </a>
      </div>
    </motion.nav>
  );
};

export default FloatingNav;
