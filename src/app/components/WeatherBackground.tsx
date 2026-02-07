import { motion } from "motion/react";
import { WeatherData } from "@/app/hooks/useWeather";

interface WeatherBackgroundProps {
  weather: WeatherData | null;
  theme: 'light' | 'dark';
}

export function WeatherBackground({ weather, theme }: WeatherBackgroundProps) {
  if (!weather) return null;

  const weatherCode = weather.current.condition.code;
  const isNight = theme === 'dark';

  // Определяем тип погоды
  const isCloudy = [1006, 1009].includes(weatherCode);
  const isRainy = [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(weatherCode);
  const isSnowy = [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(weatherCode);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Облака */}
      {(isCloudy || isRainy || isSnowy) && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute"
              style={{
                top: `${Math.random() * 50}%`,
                left: `-10%`,
                width: `${80 + Math.random() * 80}px`,
                height: `${40 + Math.random() * 40}px`,
              }}
              animate={{
                x: ['0vw', '110vw'],
              }}
              transition={{
                duration: 30 + Math.random() * 20,
                repeat: Infinity,
                delay: i * 5,
                ease: 'linear',
              }}
            >
              <div className={`w-full h-full rounded-full ${isNight ? 'bg-gray-700/20' : 'bg-white/40'} blur-xl`} />
            </motion.div>
          ))}
        </>
      )}

      {/* Дождь */}
      {isRainy && (
        <>
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute w-0.5 bg-blue-400/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                height: `${20 + Math.random() * 30}px`,
              }}
              animate={{
                y: ['0vh', '110vh'],
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </>
      )}

      {/* Снег */}
      {isSnowy && (
        <>
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute w-2 h-2 bg-white rounded-full opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
              }}
              animate={{
                y: ['0vh', '110vh'],
                x: [0, Math.random() * 50 - 25, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
