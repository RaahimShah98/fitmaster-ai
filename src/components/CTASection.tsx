// components/landing/CTASection.tsx
'use client';

import { motion } from 'framer-motion';

export const CTASection = () => {
  return (
    <section id="cta" className="py-20 relative">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 text-center"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
          Begin Your Evolution Today
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {/* Pricing Cards */}
          {['Starter', 'Pro'].map((plan, index) => (
            <motion.div
              key={plan}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-4">{plan}</h3>
              {/* Add pricing details */}
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Start Free Trial
        </motion.button>
      </motion.div>
    </section>
  );
};

export default CTASection