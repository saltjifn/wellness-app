import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from 'react';

export interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    condition: {
      text: string;
      code: number;
    };
    humidity: number;
    pressure_mb: number;
    wind_kph: number;
  };
  astronomy: {
    moon_phase: string;
  };
}

const API_KEY = '32c40a85882342bebde160638262801';

interface WeatherContextValue {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  location: string;
  setLocation: (value: string) => void;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(
  undefined
);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocationState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('weatherLocation');
      if (saved) return saved;
    }
    return 'Moscow';
  });

  const setLocation = (value: string) => {
    setLocationState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('weatherLocation', value);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no&alerts=no`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();

        if (cancelled) return;

        setWeather({
          location: {
            name: data.location.name,
            country: data.location.country,
          },
          current: {
            temp_c: data.current.temp_c,
            feelslike_c: data.current.feelslike_c,
            condition: {
              text: data.current.condition.text,
              code: data.current.condition.code,
            },
            humidity: data.current.humidity,
            pressure_mb: data.current.pressure_mb,
            wind_kph: data.current.wind_kph,
          },
          astronomy: {
            moon_phase: data.forecast.forecastday[0].astro.moon_phase,
          },
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 minutes

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [location]);

  const value: WeatherContextValue = {
    weather,
    loading,
    error,
    location,
    setLocation,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return ctx;
}

