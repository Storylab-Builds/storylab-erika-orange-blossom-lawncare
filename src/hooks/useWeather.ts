import { useQuery } from '@tanstack/react-query';
import { weatherData } from '@/data/mockData';
import type { WeatherData } from '@/types';

/**
 * Simulates fetching weather data from an API.
 * Returns mock WeatherData with React Query caching.
 */
async function fetchWeather(): Promise<WeatherData> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 400));
  return weatherData;
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // auto-refresh every 10 min
  });
}
