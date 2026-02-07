import { RouterProvider } from 'react-router';
import { router } from '@/app/routes';
import { WeatherProvider } from '@/app/hooks/useWeather';

export default function App() {
  return (
    <WeatherProvider>
      <RouterProvider router={router} />
    </WeatherProvider>
  );
}