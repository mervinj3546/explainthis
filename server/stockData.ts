import { Request, Response } from 'express';
import { storage } from './storage';

interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  datetime: number;
}

interface QuoteData {
  c: number; // Current price
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price
  pc: number; // Previous close
}

interface YTDData {
  priceOnJan1: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  growthPct: number | null;
}

interface StockDataResponse {
  ticker: string;
  quote: QuoteData;
  news: NewsItem[];
  ytd: YTDData;
  error?: string;
}

export async function getBasicStockData(req: Request, res: Response) {
  const { ticker } = req.query;
  
  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const normalizedTicker = ticker.trim().toUpperCase();
  const finnhubToken = process.env.FINNHUB_API_KEY;
  const polygonToken = process.env.POLYGON_API_KEY;

  if (!finnhubToken) {
    return res.status(500).json({ error: 'Finnhub API key not configured' });
  }

  if (!polygonToken) {
    return res.status(500).json({ error: 'Polygon API key not configured' });
  }

  try {
    // Fetch quote data from Finnhub
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${normalizedTicker}&token=${finnhubToken}`;
    const quoteRes = await fetch(quoteUrl);
    
    if (quoteRes.status === 429) {
      return res.status(429).json({ error: "Finnhub rate limit exceeded" });
    }

    const quoteData: QuoteData = await quoteRes.json();

    if (!quoteData || quoteData.c === 0) {
      return res.status(404).json({ 
        error: `No data found for ticker '${normalizedTicker}'` 
      });
    }

    // Calculate date range for news (last 7 days)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 7);

    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    // Fetch news data from Finnhub
    const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${normalizedTicker}&from=${from}&to=${to}&token=${finnhubToken}`;
    const newsRes = await fetch(newsUrl);
    const newsData = await newsRes.json();

    // Process news data
    const news: NewsItem[] = Array.isArray(newsData) 
      ? newsData.slice(0, 10).map((item: any) => ({
          headline: item.headline || 'No headline',
          summary: item.summary || 'No summary available',
          url: item.url || '',
          datetime: item.datetime || Date.now() / 1000
        }))
      : [];

    // Fetch YTD data using cached Polygon API
    let ytdData: YTDData = {
      priceOnJan1: null,
      yearHigh: null,
      yearLow: null,
      growthPct: null
    };

    try {
      console.log(`Attempting to fetch YTD data for ${normalizedTicker}...`);
      
      // Check cache first
      const cachedYtd = await storage.getTickerData(normalizedTicker, 'ytd');
      if (cachedYtd && !await storage.isCacheExpired(normalizedTicker, 'ytd')) {
        console.log(`Using cached YTD data for ${normalizedTicker}`);
        ytdData = cachedYtd.data as YTDData;
      } else {
        console.log(`Fetching fresh YTD data for ${normalizedTicker} from Polygon API...`);
        
        // Calculate date range for current year
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        // Format dates for Polygon API (YYYY-MM-DD)
        const fromDate = yearStart.toISOString().split('T')[0];
        const toDate = now.toISOString().split('T')[0];
        
        console.log(`Date range: ${fromDate} to ${toDate}`);
        
        // Polygon aggregates endpoint for daily bars
        const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${normalizedTicker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=300&apikey=${polygonToken}`;
        
        const polygonRes = await fetch(polygonUrl);
        
        if (polygonRes.ok) {
          const polygonData = await polygonRes.json();
          console.log(`Polygon response status: ${polygonData.status}, results count: ${polygonData.resultsCount || 0}`);
          
          if ((polygonData.status === "OK" || polygonData.status === "DELAYED") && polygonData.results && polygonData.results.length > 0) {
            const results = polygonData.results;
            
            // Get first trading day closing price as Jan 1st baseline
            ytdData.priceOnJan1 = results[0].c;
            
            // Calculate year high and low from all data points
            const highs = results.map((r: any) => r.h);
            const lows = results.map((r: any) => r.l);
            
            ytdData.yearHigh = Math.max(...highs);
            ytdData.yearLow = Math.min(...lows);
            
            // Calculate YTD growth percentage using current price vs Jan 1st
            if (ytdData.priceOnJan1 && quoteData.c) {
              ytdData.growthPct = ((quoteData.c - ytdData.priceOnJan1) / ytdData.priceOnJan1) * 100;
            }
            
            // Cache the YTD data for 12 hours
            await storage.saveTickerData(normalizedTicker, 'ytd', ytdData);
            console.log(`YTD data cached for ${normalizedTicker}`);
            
            console.log(`YTD data calculated: Jan1=${ytdData.priceOnJan1}, Current=${quoteData.c}, High=${ytdData.yearHigh}, Low=${ytdData.yearLow}, Growth=${ytdData.growthPct?.toFixed(2)}%`);
          } else {
            console.log(`No YTD data available from Polygon: status=${polygonData.status}, message=${polygonData.message || 'Unknown'}`);
          }
        } else {
          console.log(`Polygon API error for ${normalizedTicker}: ${polygonRes.status} ${polygonRes.statusText}`);
          const errorText = await polygonRes.text();
          console.log(`Error details: ${errorText}`);
        }
      }
    } catch (error) {
      console.error(`Error fetching YTD data for ${normalizedTicker}:`, error);
    }

    const response: StockDataResponse = {
      ticker: normalizedTicker,
      quote: quoteData,
      news,
      ytd: ytdData
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
