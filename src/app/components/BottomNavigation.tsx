import { Link, useLocation } from "react-router";
import { Cloud, Heart } from "lucide-react";
import { motion } from "motion/react";

export function BottomNavigation() {
  const location = useLocation();
  const isWeather = location.pathname === '/';
  const isWellness = location.pathname === '/wellness';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-purple-200/30 dark:border-purple-800/30">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-around items-center">
        <Link to="/" className="relative flex flex-col items-center gap-1 flex-1">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full transition-colors ${
              isWeather 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Cloud className="w-6 h-6" />
          </motion.div>
          <span className={`text-xs font-medium ${
            isWeather 
              ? 'text-purple-600 dark:text-purple-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            Погода
          </span>
          {isWeather && (
            <motion.div
              layoutId="indicator"
              className="absolute -top-1 w-12 h-1 bg-purple-500 rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>

        <Link to="/wellness" className="relative flex flex-col items-center gap-1 flex-1">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full transition-colors ${
              isWellness 
                ? 'bg-pink-500 text-white' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Heart className="w-6 h-6" />
          </motion.div>
          <span className={`text-xs font-medium ${
            isWellness 
              ? 'text-pink-600 dark:text-pink-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            Самочувствие
          </span>
          {isWellness && (
            <motion.div
              layoutId="indicator"
              className="absolute -top-1 w-12 h-1 bg-pink-500 rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
