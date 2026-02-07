import { useMemo } from 'react';
import { WeatherData } from './useWeather';

export interface WellnessAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
}

export function useWellnessAnalysis(weather: WeatherData | null) {
  const alerts = useMemo<WellnessAlert[]>(() => {
    if (!weather) return [];

    const alerts: WellnessAlert[] = [];
    const { current, astronomy } = weather;

    // Проверка давления
    if (current.pressure_mb < 1000) {
      alerts.push({
        id: 'low-pressure',
        title: 'Низкое атмосферное давление',
        description: 'Сегодня возможна головная боль, усталость и сонливость. Рекомендуется больше отдыхать.',
        severity: 'high',
        icon: '🤕',
      });
    } else if (current.pressure_mb > 1025) {
      alerts.push({
        id: 'high-pressure',
        title: 'Высокое атмосферное давление',
        description: 'Возможно повышение артериального давления. Будьте внимательны к своему самочувствию.',
        severity: 'medium',
        icon: '⚠️',
      });
    }

    // Проверка перепада температуры
    const tempDiff = Math.abs(current.temp_c - current.feelslike_c);
    if (tempDiff > 5) {
      alerts.push({
        id: 'temp-change',
        title: 'Резкий перепад температуры',
        description: 'Ощущаемая температура значительно отличается от фактической. Возможны слабость и утомляемость.',
        severity: 'medium',
        icon: '🌡️',
      });
    }

    // Проверка фазы луны
    const moonPhase = astronomy.moon_phase.toLowerCase();
    if (moonPhase.includes('full') || moonPhase.includes('new')) {
      alerts.push({
        id: 'moon-phase',
        title: `Фаза луны: ${astronomy.moon_phase}`,
        description: 'В эту фазу луны возможны перепады настроения и проблемы со сном. Старайтесь соблюдать режим.',
        severity: 'low',
        icon: '🌙',
      });
    }

    // Проверка влажности и температуры
    if (current.humidity > 70 && current.temp_c > 25) {
      alerts.push({
        id: 'humidity-heat',
        title: 'Высокая влажность и жара',
        description: 'Возможны раздражительность и усталость. Пейте больше воды и избегайте физических нагрузок.',
        severity: 'high',
        icon: '💧',
      });
    }

    // Проверка ветра
    if (current.wind_kph > 40) {
      alerts.push({
        id: 'strong-wind',
        title: 'Сильный ветер',
        description: 'Ветреная погода может вызывать дискомфорт и головную боль у метеочувствительных людей.',
        severity: 'medium',
        icon: '💨',
      });
    }

    // Если нет предупреждений
    if (alerts.length === 0) {
      alerts.push({
        id: 'good-weather',
        title: 'Отличная погода!',
        description: 'Погодные условия благоприятны для вашего самочувствия. Наслаждайтесь днём!',
        severity: 'low',
        icon: '✨',
      });
    }

    return alerts;
  }, [weather]);

  return { alerts };
}
