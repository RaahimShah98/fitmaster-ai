// components/landing/FeaturesSection.tsx
'use client';

////import { motion } from 'framer-motion';

/*const features = [
  {
    title: 'Real-time Form Correction',
    description: 'AI-powered feedback for perfect form',
    icon: '🎯',
  },
  // Add more features
];*/

export const FeaturesSection = () => {
  return (
     <><section className="py-16 bg-black/10 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-4xl font-bold mb-12">
          Features That Redefine Fitness
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Dynamic Workout Plans",
              description: "AI adjusts your workouts daily to match your progress.",
            },
            {
              title: "Fitness Goals Tracking",
              description: "Monitor calories, streaks, and weekly achievements.",
            },
            {
              title: "Community Challenges",
              description: "Compete with others and join leaderboards for motivation.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section><section className="py-16 bg-black/10 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-4xl font-bold mb-12">
            Explore Fitness Inspiration
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Placeholder Blog Items */}
            {[
              {
                title: "5 Quick Exercises to Burn Calories in 15 Minutes",
                description: "Discover short yet effective workouts to kickstart your fitness journey.",
              },
              {
                title: "The Role of AI in Modern Fitness",
                description: "Learn how AI is revolutionizing the way we approach health and fitness.",
              },
              {
                title: "Mental Fitness: Why It’s Just as Important",
                description: "Understand the connection between mental and physical well-being.",
              },
            ].map((blog, i) => (
              <div
                key={i}
               className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-2">{blog.title}</h3>
                <p className="text-white/70">{blog.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section></>
    
  );
};

export default FeaturesSection;