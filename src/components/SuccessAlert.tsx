import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

const SuccessAlert = ({ message = "", duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-green-500 text-white px-4 py-2 shadow-lg animate-fade-in-up">
      <CheckCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
};

export default SuccessAlert;
