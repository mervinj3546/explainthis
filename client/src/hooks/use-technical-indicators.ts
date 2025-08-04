import { useQuery } from "@tanstack/react-query";

interface TechnicalData {
  ema8: number[];
  ema21: number[];
  ema34: number[];
  ema50: number[];
  macd: number[];
  signal: number[];
  histogram: number[];
  rsi: number[];
  bollingerUpper: number[];
  bollingerMiddle: number[];
  bollingerLower: number[];
  atr: number[];
  obv: number[];
  donchianUpper: number[];
  donchianLower: number[];
  prices: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

async function fetchTechnicalIndicators(ticker: string): Promise<TechnicalData> {
  const response = await fetch(`/api/stock/technical?ticker=${ticker}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch technical indicators: ${response.statusText}`);
  }
  
  return response.json();
}

export function useTechnicalIndicators(ticker: string) {
  return useQuery<TechnicalData, Error>({
    queryKey: ["/api/stock/technical", ticker],
    queryFn: () => fetchTechnicalIndicators(ticker),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
