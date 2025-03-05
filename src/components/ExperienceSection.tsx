// components/landing/ExperienceSection.tsx
'use client';
import { Dumbbell, Activity, LineChart } from "lucide-react";


//import { useInView } from 'framer-motion';
//import { useRef } from 'react';

export const ExperienceSection = () => {
  //const ref = useRef(null);
  //const isInView = useInView(ref, { once: true });

  return (
    <section className="py-16 bg-gradient-to-r from-purple-500 to-blue-500  text-transparent text-white"
      style={{
        backgroundImage: "url('/LandingPage/fitmaster-ai(1).png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        
        <div className="absolute inset-0 bg-black opacity-70 "></div>

      <div className="max-w-7xl mx-auto px-4 ">
        <h2 className="text-center text-4xl font-bold mb-12 relative z-10">
          Why Choose FitMaster AI?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Dumbbell className="h-12 w-12 text-purple-400" />,
              title: "AI-Powered Plans",
              description:
                "Tailored workout and nutrition plans crafted by advanced AI.",
            },
            {
              icon: <Activity className="h-12 w-12 text-purple-400" />,
              title: "Real-Time Feedback",
              description:
                "Achieve better form with instant corrections during workouts.",
            },
            {
              icon: <LineChart className="h-12 w-12 text-purple-400" />,
              title: "Track Your Progress",
              description:
                "Measure results, stay consistent, and hit your fitness goals.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;