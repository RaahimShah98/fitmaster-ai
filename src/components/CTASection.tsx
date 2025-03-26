// components/landing/CTASection.tsx
'use client';

import { motion } from 'framer-motion';
// import PricingCards from './PricingCards';
export const CTASection = () => {

  const plans = [
    {
      "Basic": {
        "Realtime feedback": "✅",
        "Food Nutrition Tracking": "✅",
        "Workout Tracking": "✅",
        "Workout tracking limit: 10": "✅",
        "Personalized diet plans": " ❌",
        "Personalized workout plan": " ❌",
        "Weekly report": " ❌",
        "One on one chat": " ❌",
        "Price": "$40"
      }
    },

    {
      "Premium": {
        "Realtime feedback": "✅",
        "Food Nutrition Tracking": "✅",
        "Workout Tracking": "✅",
        "Workout tracking limit: 50": "✅",
        "Personalized diet plans": "✅",
        "Personalized workout plan": "✅",
        "Weekly report": " ❌",
        "One on one chat": " ❌",
        "Price": "$50"
      }
    },

    {
      "Premium+": {
        "Realtime feedback": "✅",
        "Food Nutrition Tracking": "✅",
        "Workout Tracking": "✅",
        "Workout tracking limit: unlimited": "✅",
        "Personalized diet plans": "✅",
        "Personalized workout plan": "✅",
        "Weekly report": "✅",
        "One on one chat": "✅",
        "Price": "$65"
      }
    }];
  return (
    <section id="cta" className="py-20 relative w-full">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-[75%] mx-auto px-4 text-center"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
          Start Your Fitness
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-1"
        >
          {/* Pricing Cards */}
          {plans.map((planObj, index) => {
            // Extract plan name and details
            const [planName, planDetails] = Object.entries(planObj)[0];
            const price = planDetails["Price"]; // Extract price

            // Dynamic gradient selection
            const getCardGradient = (planName: string) => {
              switch (planName) {
                case 'Basic':
                  return 'from-gray-600/50 to-gray-800/50';
                case 'Premium':
                  return 'from-blue-600/50 to-blue-800/50';
                case 'Premium+':
                  return 'from-purple-600/50 to-purple-800/50';
                default:
                  return 'from-purple-900/50 to-blue-900/50';
              }
            };

            return (
              <motion.div
                key={planName}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`
                  relative p-8 rounded-2xl 
                  bg-gradient-to-br ${getCardGradient(planName)} 
                  backdrop-blur-xl 
                  border border-white/10
                  hover:scale-105 
                  transition-all 
                  duration-300
                `}
              >
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  <strong>{planName}</strong>
                </h3>

                {/* Plan Details */}
                <div className="space-y-4">
                  {Object.entries(planDetails).map(([feature, status], i) => (
                    feature !== "Price" && (
                      <div key={i} className="flex items-center space-x-4">
                        {/* Tick or Cross */}
                        <span className="text-2xl">{status}</span>
                        {/* Feature Name */}
                        <span className="text-white">{feature}</span>
                      </div>
                    )
                  ))}
                </div>
                <button className="
                  w-full mt-[20px] px-6 py-3 
                  bg-white/10 
                  text-white 
                  font-semibold 
                  rounded-full 
                  hover:bg-white/20 
                  transition-all 
                  duration-300
                  text-xl
                ">
                  {price}<span>/month</span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );


};

export default CTASection