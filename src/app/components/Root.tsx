import { Outlet } from "react-router";
import { BottomNavigation } from "@/app/components/BottomNavigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { WeatherBackground } from "@/app/components/WeatherBackground";
import { useTheme } from "@/app/hooks/useTheme";
import { useWeather } from "@/app/hooks/useWeather";

export function Root() {
  const { theme, toggleTheme } = useTheme();
  const { weather } = useWeather();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 transition-colors duration-500">
      <WeatherBackground weather={weather} theme={theme} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-4 flex justify-end">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </header>
        
        <main className="flex-1 pb-20">
          <Outlet />
        </main>
        
        <BottomNavigation />
      </div>
    </div>
  );
}
