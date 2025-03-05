'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/FirebaseContext';
import { useRouter } from 'next/navigation';

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
}

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const email = user?.email || "";
  const router = useRouter();

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Create a canvas for particle animation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    container.appendChild(canvas);
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Initialize particles
    const particles: Particle[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 1, // Adjust particle size (1 to 5)
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.velocityX;
        p.y += p.velocityY;

        // Bounce particles off edges
        if (p.x < 0 || p.x > canvas.width) p.velocityX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.velocityY *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on component unmount
    return () => {
      container.removeChild(canvas);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Particles */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
        >
          Transform Your Fitness Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
        >
          Experience the next evolution of fitness with AI-powered guidance and real-time form correction.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          onClick={() => email != "" ? router.push("workoutprogress") : router.push("/LoginForm")}
        >
          Begin Your Evolution
        </motion.button>
      </div>

      {/* Floating Feature Previews */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Add floating elements here */}
      </div>
    </section>
  );
};

export default HeroSection;