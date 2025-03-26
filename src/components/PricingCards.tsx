'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the type for your plans
interface PlanDetails {
  [planName: string]: {
    [feature: string]: string;
    Price: string;
  };
}

interface PricingCardsProps {
  plans: PlanDetails[];
}

const PricingCards: React.FC<PricingCardsProps> = ({ plans }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCardExpansion = (planName: string) => {
    setExpandedCard(expandedCard === planName ? null : planName);
  };

  const getCardGradient = (planName: string) => {
    switch(planName) {
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
    <section id="cta" className="py-20 relative w-full">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-[85%] mx-auto px-4 text-center"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-12">
          Choose Your Fitness Evolution Plan
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {plans.map((planObj, index) => {
              const [planName, planDetails] = Object.entries(planObj)[0];
              const price = planDetails["Price"];
              const isExpanded = expandedCard === planName;

              return (
                <motion.div
                  key={planName}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div 
                    className={`
                      p-8 rounded-3xl 
                      bg-gradient-to-br ${getCardGradient(planName)}
                      backdrop-blur-xl 
                      cursor-pointer 
                      transition-all duration-300
                      border border-white/10
                      ${isExpanded ? 'shadow-2xl scale-105' : 'hover:scale-105'}
                    `}
                    onClick={() => toggleCardExpansion(planName)}
                  >
                    {/* Plan Name */}
                    <h3 className="text-3xl font-bold text-white mb-6 text-center">
                      {planName}
                    </h3>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-white">
                        {price}
                        <span className="text-xl text-gray-300">/month</span>
                      </span>
                    </div>

                    {/* Basic Card Content */}
                    <div className="space-y-4">
                      <button 
                        className="
                          w-full mt-4 px-6 py-3 
                          bg-white/10 
                          text-white 
                          font-semibold 
                          rounded-full 
                          hover:bg-white/20 
                          transition-all 
                          duration-300
                        "
                      >
                        Select Plan
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute z-10 w-full bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl rounded-2xl mt-2 p-6 shadow-2xl"
                      >
                        <div className="space-y-3">
                          {Object.entries(planDetails).map(([feature, status], i) => (
                            feature !== "Price" && (
                              <div 
                                key={i} 
                                className="flex items-center space-x-4 text-white"
                              >
                                {/* Tick or Cross */}
                                <span className="text-xl">
                                  {status === "✅" ? "✅" : "❌"}
                                </span>
                                {/* Feature Name */}
                                <span>{feature}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PricingCards;