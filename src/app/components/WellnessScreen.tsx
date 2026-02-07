import { motion } from "motion/react";
import { MessageCircle, Sparkles, AlertCircle } from "lucide-react";
import { useWeather } from "@/app/hooks/useWeather";
import { useWellnessAdvice } from "@/app/hooks/useWellnessAdvice";

function getWeatherThought(tempC: number): string {
  if (tempC <= -30) return "ХОЛОДНО ПИПЕЦ";
  if (tempC <= -20) return "На улице так холодно, что мысли выходят погреться обратно в голову.";
  if (tempC <= -10) return "Погода из серии: вроде жив, но без уважения к себе.";
  if (tempC <= -1) return "Температура минусовая, настроение тоже. Зато стабильно.";
  if (tempC <= 4) return "Это не зима и не весна. Это ошибка состояния.";
  if (tempC <= 9) return "Хочется одеться легко, но жить осторожно.";
  if (tempC <= 14) return "Погода говорит: «Можно без шапки», иммунитет говорит: «Попробуй.»";
  if (tempC <= 19) return "Температура идеальная, жизнь всё ещё сомнительная.";
  if (tempC <= 24) return "Погода как будто всё наладила, но доверия нет.";
  if (tempC <= 29) return "Жарко, но пока ещё можно делать вид, что это приятно.";
  if (tempC <= 34) return "Настолько жарко, что даже лень жаловаться.";
  return "Погода официально решила тебя добить.";
}

export function WellnessScreen() {
  const { weather, loading } = useWeather();
  const { advice, loading: adviceLoading, error: adviceError, retry } = useWellnessAdvice(weather);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Самочувствие сегодня
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Анализ влияния погоды на ваше состояние
        </p>
      </motion.div>

      {/* Мысли насчет погоды */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-amber-200/60 dark:border-amber-800/30"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Мысли насчет погоды:
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                «{getWeatherThought(weather.current.temp_c)}»
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Советы по самочувствию (LLM) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/20 dark:border-gray-700/30"
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
            {adviceLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
              />
            ) : (
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Советы по самочувствию
            </h3>
            {adviceLoading && !advice ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Загружаем совет от ИИ… первый раз может до 60 сек (сервер «просыпается»).
                </p>
            ) : (
              <>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {advice ?? "—"}
                </p>
                {adviceError && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Совет по шаблону: {adviceError}
                    </p>
                    <button
                      type="button"
                      onClick={retry}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
                    >
                      Повторить
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Дисклеймер */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20"
      >
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center leading-relaxed">
          ⚠️ Приложение не является медицинским сервисом. Информация носит рекомендательный характер. 
          При серьёзных проблемах со здоровьем обратитесь к врачу.
        </p>
      </motion.div>
    </div>
  );
}
