import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type Props = {
  value: number;
  color: string;
  isSuccess?: boolean;
  soundEffectUrl?: string;
};

const BumpNumber = ({ value, color, soundEffectUrl, isSuccess }: Props) => {
  const prevValue = useRef<number>(value);

  useEffect(() => {
    const isIncrease = value > prevValue.current;

    if (isIncrease) {
      // 🎉 Trigger confetti every 10 reps
      if (value % 10 === 0 && isSuccess) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.4 },
        });
      }

      // 🔊 Play sound effect if provided
      if (soundEffectUrl) {
        const audio = new Audio(soundEffectUrl);
        audio.play();
      }
    }

    prevValue.current = value;
  }, [value, soundEffectUrl]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={value}
        initial={{ scale: 1.8, opacity: 0, y: -10 }}
        animate={{
          scale: [1.4, 1],
          opacity: 1,
          y: 0,
          boxShadow: "0 0 12px rgba(255,255,255,0.3)",
        }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`inline-block px-3 py-1 rounded-xl ${color} text-white`}
      >
        <p className="text-3xl font-black tracking-wider">{value}</p>
      </motion.div>
    </AnimatePresence>
  );
};

export default BumpNumber;
