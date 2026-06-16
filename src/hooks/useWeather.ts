import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeatherData } from '@/types';

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: () => api.get<WeatherData>('/weather'),
    staleTime: 5 * 60 * 1000,
  });
}
