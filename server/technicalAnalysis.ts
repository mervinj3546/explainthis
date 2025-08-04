import { Request, Response } from 'express';
import { storage } from './storage';
import { makePolygonRequest } from './polygonRateLimit';

interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicators {
  ema8: number[];
  ema21: number[];
  ema34: number[];
  ema50: number[];
  macd: number[];
  signal: number[];
  histogram: number[];
  rsi: number[];
  prices: HistoricalPrice[];
}

// Calculate Exponential Moving Average
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  if (prices.length === 0) return ema;
  
  // First EMA value is just the first price
  ema[0] = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }
  
  return ema;
}

// Calculate MACD (Moving Average Convergence Divergence)
function calculateMACD(prices: number[]): { macd: number[], signal: number[], histogram: number[] } {
  const ema8 = calculateEMA(prices, 8);
  const ema21 = calculateEMA(prices, 21);
  
  const macd = ema8.map((value, index) => value - ema21[index]);
  const signal = calculateEMA(macd, 9);
  const histogram = macd.map((value, index) => value - signal[index]);
  
  return { macd, signal, histogram };
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  
  if (prices.length < period + 1) return rsi;
  
  for (let i = period; i < prices.length; i++) {
    let gains = 0;
    let losses = 0;
    
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }
  
  return rsi;
}

export async function getTechnicalIndicators(req: Request, res: Response) {
  const { ticker } = req.query;
  
  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const normalizedTicker = ticker.trim().toUpperCase();
  const polygonToken = process.env.POLYGON_API_KEY;

  if (!polygonToken) {
    return res.status(500).json({ error: 'Polygon API key not configured' });
  }

  try {
    console.log(`Fetching technical indicators for ${normalizedTicker}...`);
    
    // Check cache first
    const cachedTechnical = await storage.getTickerData(normalizedTicker, 'technical');
    if (cachedTechnical && !await storage.isCacheExpired(normalizedTicker, 'technical')) {
      console.log(`Using cached technical data for ${normalizedTicker}`);
      return res.json(cachedTechnical.data);
    }
    
    console.log(`Fetching fresh technical data for ${normalizedTicker} from Polygon API...`);
    
    // Get 6 months of daily data for technical analysis
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const fromDate = sixMonthsAgo.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];
    
    // Fetch historical data from Polygon using rate limiter
    const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${normalizedTicker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=200&apikey=${polygonToken}`;
    
    // Use rate limiter for the API call
    const polygonData = await makePolygonRequest(polygonUrl, normalizedTicker, 'technical');
    
    if (polygonData.status !== "OK" && polygonData.status !== "DELAYED") {
      throw new Error(`No data available: ${polygonData.message || 'Unknown error'}`);
    }
    
    if (!polygonData.results || polygonData.results.length === 0) {
      throw new Error('No historical data found');
    }
    
    // Transform Polygon data to our format
    const historicalData: HistoricalPrice[] = polygonData.results.map((item: any) => ({
      date: new Date(item.t).toISOString().split('T')[0],
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v
    }));
    
    // Extract closing prices for calculations
    const closingPrices = historicalData.map(item => item.close);
    
    // Calculate technical indicators
    const ema8 = calculateEMA(closingPrices, 8);
    const ema21 = calculateEMA(closingPrices, 21);
    const ema34 = calculateEMA(closingPrices, 34);
    const ema50 = calculateEMA(closingPrices, 50);
    const macdData = calculateMACD(closingPrices);
    const rsi = calculateRSI(closingPrices, 14);
    
    const response: TechnicalIndicators = {
      ema8,
      ema21,
      ema34,
      ema50,
      macd: macdData.macd,
      signal: macdData.signal,
      histogram: macdData.histogram,
      rsi,
      prices: historicalData
    };
    
    // Cache the technical data for 12 hours
    await storage.saveTickerData(normalizedTicker, 'technical', response);
    console.log(`Technical data cached for ${normalizedTicker}`);
    
    console.log(`Technical indicators calculated for ${normalizedTicker}: ${historicalData.length} data points`);
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching technical indicators:', error);
    res.status(500).json({ 
      error: 'Failed to fetch technical indicators',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
