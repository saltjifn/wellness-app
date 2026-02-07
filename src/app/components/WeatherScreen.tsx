import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Thermometer, Droplets, Wind, Gauge, Moon, Search } from "lucide-react";
import { useWeather } from "@/app/hooks/useWeather";

export function WeatherScreen() {
  const { weather, loading, error, location, setLocation } = useWeather();
  const [cityInput, setCityInput] = useState(location ?? "");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <p className="text-red-500 mb-2">Ошибка загрузки данных</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error || 'Попробуйте позже'}
          </p>
        </div>
      </div>
    );
  }

  const { location: weatherLocation, current, astronomy } = weather;

  const weatherParams = [
    {
      icon: Thermometer,
      label: 'Ощущается как',
      value: `${Math.round(current.feelslike_c)}°C`,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      icon: Droplets,
      label: 'Влажность',
      value: `${current.humidity}%`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Wind,
      label: 'Ветер',
      value: `${Math.round(current.wind_kph)} км/ч`,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
    },
    {
      icon: Gauge,
      label: 'Давление',
      value: `${Math.round(current.pressure_mb)} мбар`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: Moon,
      label: 'Фаза луны',
      value: astronomy.moon_phase,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Поиск города + Локация */}
      <div className="space-y-3">
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white/70 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl px-3 py-2 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = cityInput.trim();
            if (!trimmed) return;
            setLocation(trimmed);
          }}
        >
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Выберите город (например, Moscow, London)"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-60"
            disabled={!cityInput.trim()}
          >
            Показать
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">
              {weatherLocation.name}, {weatherLocation.country}
            </span>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-600 dark:text-red-400 text-center"
          >
            Не удалось загрузить погоду: {error}
          </motion.div>
        )}
      </div>

      {/* Основная температура */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-7xl font-light text-purple-600 dark:text-purple-400 mb-2"
          >
            {Math.round(current.temp_c)}°
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400 capitalize">
            {current.condition.text}
          </p>
        </div>
      </motion.div>

      {/* Параметры погоды */}
      <div className="grid grid-cols-2 gap-3">
        {weatherParams.map((param, index) => (
          <motion.div
            key={param.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20"
          >
            <div className={`w-10 h-10 ${param.bgColor} rounded-full flex items-center justify-center mb-3`}>
              <param.icon className={`w-5 h-5 ${param.color}`} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {param.label}
            </p>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {param.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
