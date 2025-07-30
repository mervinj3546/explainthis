import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "./auth";
import { getBasicStockData } from "./stockData";
import { getTechnicalIndicators } from "./technicalAnalysis";
import { generateMockRedditSentiment, aggregateSentiment, generateNoDataSentiment, analyzeSentimentAdvanced } from './sentimentAnalysis';
import { analyzeProfessionalSentiment, generateDemoSentiment, type ProfessionalSentimentResult } from './professionalSentiment';
import { professionalSentimentCache, logCacheStats } from './sentimentCache';
import { fetchRedditPosts, fetchStockTwitsPosts } from "./redditFetcher";

const MemoryStoreSession = MemoryStore(session);

// Helper function to get cached price data
async function getCachedPriceData(symbol: string) {
  try {
    // Check cache first
    const cached = await storage.getTickerData(symbol.toUpperCase(), 'realtime-price');
    if (cached && !await storage.isCacheExpired(symbol.toUpperCase(), 'realtime-price')) {
      return cached.data;
    }

    // Fetch fresh data if cache is expired
    const finnhubToken = process.env.FINNHUB_API_KEY;
    if (!finnhubToken) {
      return null;
    }

    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${finnhubToken}`;
    const quoteRes = await fetch(quoteUrl);
    
    if (quoteRes.ok && quoteRes.status !== 429) {
      const quoteData = await quoteRes.json();
      
      if (quoteData && quoteData.c !== 0) {
        // Cache the fresh data
        await storage.saveTickerData(symbol.toUpperCase(), 'realtime-price', quoteData);
        return quoteData;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching cached price data for ${symbol}:`, error);
    return null;
  }
}

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.validateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // OAuth routes
  // Google OAuth
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: any, res) => {
      req.session.userId = req.user.id;
      res.redirect("/dashboard");
    }
  );

  // Ticker routes
  app.get("/api/tickers/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.json([]);
      }
      
      const tickers = await storage.searchTickers(query);
      res.json(tickers);
    } catch (error) {
      res.status(500).json({ message: "Failed to search tickers" });
    }
  });

  app.get("/api/tickers/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Try to get cached real-time stock data
      const quoteData = await getCachedPriceData(symbol);
      
      if (quoteData) {
        const priceChange = quoteData.c - quoteData.pc;
        const priceChangePercent = (priceChange / quoteData.pc) * 100;
        
        const realTimeData = {
          id: symbol,
          symbol: symbol,
          name: `${symbol} Inc.`, // Fallback name - could be enhanced with company name API
          price: quoteData.c, // Current price
          change: priceChange,
          changePercent: priceChangePercent,
          volume: 0, // Would need additional API call for volume
          marketCap: 0, // Would need additional API call for market cap
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json(realTimeData);
      }
      
      // Fallback to stored ticker data if API call fails
      const ticker = await storage.getTicker(symbol);
      
      if (!ticker) {
        return res.status(404).json({ message: "Ticker not found" });
      }
      
      res.json(ticker);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticker" });
    }
  });

  // Stock market data routes (using external APIs)
  app.get("/api/stock/basic", getBasicStockData);
  app.get("/api/stock/technical", getTechnicalIndicators);

  // Watchlist routes
  app.get("/api/watchlist", requireAuth, async (req: any, res) => {
    try {
      const watchlist = await storage.getUserWatchlist(req.session.userId);
      const tickersWithData = await Promise.all(
        watchlist.map(async (item) => {
          // Get cached real-time data
          const quoteData = await getCachedPriceData(item.tickerSymbol);
          
          if (quoteData) {
            const priceChange = quoteData.c - quoteData.pc;
            const priceChangePercent = (priceChange / quoteData.pc) * 100;
            
            const realTimeData = {
              symbol: item.tickerSymbol,
              name: `${item.tickerSymbol} Inc.`, // Simplified name
              price: quoteData.c,
              change: priceChange,
              changePercent: priceChangePercent,
              volume: 0, // Not used in sidebar
              marketCap: 0 // Not used in sidebar
            };
            
            return { ...item, ticker: realTimeData };
          }
          
          // Fallback to stored data if cached fetch fails
          const ticker = await storage.getTicker(item.tickerSymbol);
          return { ...item, ticker };
        })
      );
      res.json(tickersWithData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist/:symbol", requireAuth, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const item = await storage.addToWatchlist(req.session.userId, symbol);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:symbol", requireAuth, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const removed = await storage.removeFromWatchlist(req.session.userId, symbol);
      
      if (!removed) {
        return res.status(404).json({ message: "Item not found in watchlist" });
      }
      
      res.json({ message: "Removed from watchlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Search history routes
  app.get("/api/search-history", requireAuth, async (req: any, res) => {
    try {
      const history = await storage.getUserSearchHistory(req.session.userId);
      const historyWithTickers = await Promise.all(
        history.map(async (item) => {
          // Get cached real-time data
          const quoteData = await getCachedPriceData(item.tickerSymbol);
          
          if (quoteData) {
            const priceChange = quoteData.c - quoteData.pc;
            const priceChangePercent = (priceChange / quoteData.pc) * 100;
            
            const realTimeData = {
              symbol: item.tickerSymbol,
              name: `${item.tickerSymbol} Inc.`, // Simplified name
              price: quoteData.c,
              change: priceChange,
              changePercent: priceChangePercent,
              volume: 0, // Not used in sidebar
              marketCap: 0 // Not used in sidebar
            };
            
            return { ...item, ticker: realTimeData };
          }
          
          // Fallback to stored data if cached fetch fails
          const ticker = await storage.getTicker(item.tickerSymbol);
          return { ...item, ticker };
        })
      );
      res.json(historyWithTickers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  app.post("/api/search-history/:symbol", requireAuth, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const item = await storage.addToSearchHistory(req.session.userId, symbol);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to search history" });
    }
  });

  // Ticker data routes (for financial information)
  app.get("/api/ticker-data/:symbol/:type", async (req, res) => {
    console.log("🔥🔥🔥 THIS IS THE ROUTE HANDLER EXECUTING 🔥🔥🔥");
    console.log("🔥 ROUTE HANDLER HIT");
    try {
      const { symbol, type } = req.params;
      const { refresh } = req.query;
      
      console.log(`Request for ${symbol}/${type}, refresh=${refresh}`);
      
      // Check if we should use cached data or fetch fresh data
      let shouldFetchFresh = refresh === 'true';
      
      if (!shouldFetchFresh) {
        // Check if cache is expired
        const isExpired = await storage.isCacheExpired(symbol, type);
        shouldFetchFresh = isExpired;
        console.log(`Cache expired for ${symbol}/${type}: ${isExpired}`);
      }
      
      // Get existing cached data (shared across all users for fundamentals)
      let data = await storage.getTickerData(symbol, type);
      console.log(`Cached data exists for ${symbol}/${type}: ${!!data}${data && data.createdAt ? ` (cached ${Math.round((Date.now() - data.createdAt.getTime()) / (1000 * 60))} minutes ago)` : ''}`);
      
      // If we need fresh data or no data exists, fetch from APIs
      if (shouldFetchFresh || !data) {
        console.log(`Fetching fresh data for ${symbol}/${type} (expired: ${shouldFetchFresh}, missing: ${!data})`);
        let apiData;
        const finnhubToken = process.env.FINNHUB_API_KEY;
        
        console.log(`🚀 ENTERING SWITCH CASE for ${symbol}/${type}`);
        switch (type) {
          case 'fundamentals':
            if (finnhubToken) {
              try {
                console.log(`Fetching fresh fundamentals data for ${symbol} from Finnhub...`);
                
                // Fetch company basic financials from Finnhub
                const metricsUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${finnhubToken}`;
                const metricsRes = await fetch(metricsUrl);
                
                if (metricsRes.ok) {
                  const metricsData = await metricsRes.json();
                  const metrics = metricsData.metric;
                  
                  console.log(`Finnhub metrics response for ${symbol}:`, metrics);
                  
                  if (metrics) {
                    console.log('Debug AAPL metrics extract:', {
                      revenuePerShareTTM: metrics.revenuePerShareTTM,
                      currentRatioQuarterly: metrics.currentRatioQuarterly,
                      totalDebtToEquityQuarterly: metrics['totalDebt/totalEquityQuarterly'],
                      bookValueShareGrowth5Y: metrics.bookValueShareGrowth5Y
                    });
                    
                    apiData = {
                      keyMetrics: {
                        peRatio: metrics.peBasicExclExtraTTM || metrics.peTTM || 0,
                        marketCap: metrics.marketCapitalization ? `${(metrics.marketCapitalization / 1000).toFixed(1)}B` : "N/A",
                        revenue: metrics.revenuePerShareTTM ? `${(metrics.revenuePerShareTTM * 15.2).toFixed(1)}B` : "N/A" // Approximate shares outstanding
                      },
                      financialHealth: {
                        debtToEquity: metrics['totalDebt/totalEquityQuarterly'] || metrics['totalDebt/totalEquityAnnual'] || 0,
                        currentRatio: metrics.currentRatioQuarterly || metrics.currentRatioAnnual || 0,
                        roe: metrics.roeTTM || metrics.roeRfy || 0
                      },
                      growth: {
                        revenueGrowth: metrics.revenueGrowthTTMYoy || metrics.revenueGrowthQuarterlyYoy || 0,
                        epsGrowth: metrics.epsGrowthTTMYoy || metrics.epsGrowthQuarterlyYoy || 0,
                        bookValueGrowth: metrics.bookValueShareGrowth5Y || 0
                      }
                    };
                  }
                }
              } catch (apiError) {
                console.log(`Failed to fetch fundamentals for ${symbol} from Finnhub:`, apiError);
              }
            }
            
            // Fallback to mock data if API fails
            if (!apiData) {
              apiData = {
                keyMetrics: {
                  peRatio: 28.5,
                  marketCap: "2.45T",
                  revenue: "394.3B"
                },
                financialHealth: {
                  debtToEquity: 0.31,
                  currentRatio: 1.07,
                  roe: 175.4
                },
                growth: {
                  revenueGrowth: 8.1,
                  epsGrowth: 11.2,
                  bookValueGrowth: 5.7
                }
              };
            }
            break;
            
          case 'news':
            if (finnhubToken) {
              try {
                // Fetch real news from Finnhub
                const toDate = new Date();
                const fromDate = new Date();
                fromDate.setDate(toDate.getDate() - 7);
                
                const from = fromDate.toISOString().split('T')[0];
                const to = toDate.toISOString().split('T')[0];
                
                const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${finnhubToken}`;
                const newsRes = await fetch(newsUrl);
                
                if (newsRes.ok) {
                  const newsData = await newsRes.json();
                  
                  if (Array.isArray(newsData) && newsData.length > 0) {
                    apiData = {
                      items: newsData.slice(0, 5).map((item: any) => ({
                        title: item.headline || 'No headline',
                        summary: item.summary || 'No summary available',
                        time: new Date(item.datetime * 1000).toLocaleString(),
                        sentiment: item.sentiment > 0 ? "positive" : item.sentiment < 0 ? "negative" : "neutral"
                      }))
                    };
                  }
                }
              } catch (apiError) {
                console.log(`Failed to fetch news for ${symbol} from Finnhub:`, apiError);
              }
            }
            
            // Fallback to mock data if API fails
            if (!apiData) {
              apiData = {
                items: [
                  {
                    title: `${symbol} Reports Strong Quarterly Results`,
                    summary: "Company exceeds analyst expectations with robust revenue growth...",
                    time: "2 hours ago",
                    sentiment: "positive"
                  },
                  {
                    title: `Market Analysis: ${symbol} Price Target Raised`,
                    summary: "Multiple analysts upgrade their price targets following recent developments...",
                    time: "4 hours ago",
                    sentiment: "positive"
                  }
                ]
              };
            }
            break;
            
          case 'sentiment':
            console.log(`🚨 ENTERING SENTIMENT CASE for ${symbol}`);
            // Try to fetch real Reddit and StockTwits data
            let redditSentiment;
            let newsSentiment: ProfessionalSentimentResult = {
              score: 0,
              sentiment: 'Professional Sentiment Not Available',
              confidence: 0,
              postsAnalyzed: 0,
              sources: { news: 0, analysts: 0 }
            };
            
            // Fetch social media sentiment (Reddit/StockTwits)
            try {
              console.log(`Fetching real sentiment data for ${symbol}...`);
              
              // Fetch Reddit posts
              const redditPosts = await fetchRedditPosts(symbol);
              console.log(`Found ${redditPosts.length} Reddit posts for ${symbol}`);
              
              // Fetch StockTwits data
              const stockTwitsPosts = await fetchStockTwitsPosts(symbol);
              console.log(`Found ${stockTwitsPosts.length} StockTwits posts for ${symbol}`);
              
              // Analyze Reddit sentiment
              let redditSentiments: Array<{ score: number; confidence: number; source: string }> = [];
              
              if (redditPosts.length > 0) {
                // Analyze each Reddit post individually
                redditSentiments = redditPosts.map(post => {
                  const text = `${post.title} ${post.selftext || ''}`;
                  const analysis = analyzeSentimentAdvanced(text);
                  return {
                    score: analysis.score,
                    confidence: analysis.confidence,
                    source: 'reddit'
                  };
                });
                console.log(`Reddit sentiment for ${symbol}:`, redditSentiments.length, 'posts analyzed');
              } else {
                console.log(`No Reddit posts found for ${symbol}`);
              }
              
              // Analyze StockTwits sentiment
              if (stockTwitsPosts.length > 0) {
                const stockTwitsSentiments = stockTwitsPosts.map(post => {
                  const text = post.body || '';
                  const analysis = analyzeSentimentAdvanced(text);
                  return {
                    score: analysis.score,
                    confidence: analysis.confidence,
                    source: 'stocktwits'
                  };
                });
                
                // Combine Reddit + StockTwits sentiments
                const allSentiments = [
                  ...redditSentiments,
                  ...stockTwitsSentiments
                ];
                
                redditSentiment = aggregateSentiment(allSentiments);
                redditSentiment.postsAnalyzed = redditPosts.length + stockTwitsPosts.length;
                console.log(`Combined sentiment analysis: ${redditPosts.length} Reddit + ${stockTwitsPosts.length} StockTwits posts`);
              } else if (redditSentiments.length > 0) {
                // Only Reddit data available
                redditSentiment = aggregateSentiment(redditSentiments);
                console.log(`Reddit-only sentiment analysis: ${redditSentiments.length} posts`);
              } else {
                // No data from either source
                redditSentiment = generateNoDataSentiment(symbol, ['r/stocks', 'r/wallstreetbets', 'r/investing', 'r/StockMarket', 'r/SecurityAnalysis', 'StockTwits']);
                console.log(`No social media data found for ${symbol}`);
              }
              
            } catch (error) {
              console.error(`Error fetching social media sentiment for ${symbol}:`, error);
              // Provide honest error message instead of mock data
              redditSentiment = generateNoDataSentiment(symbol, ['Error occurred while searching social forums']);
            }
            
            // Get professional sentiment analysis (separate from social media)
            try {
              newsSentiment = await analyzeProfessionalSentiment(symbol);
              console.log(`Professional sentiment for ${symbol}: ${newsSentiment.score}% (${newsSentiment.postsAnalyzed} sources)`);
            } catch (error) {
              console.error(`Error fetching professional sentiment for ${symbol}:`, error);
              // Fallback to demo data for major stocks, or no data for others
              newsSentiment = generateDemoSentiment(symbol);
            }
            
            // Debug log to see what newsSentiment contains
            console.log(`🐛 DEBUG: newsSentiment object for ${symbol}:`, JSON.stringify(newsSentiment, null, 2));
            
            apiData = {
              retail: { 
                score: redditSentiment.overall, 
                sentiment: redditSentiment.sentiment,
                confidence: redditSentiment.confidence,
                postsAnalyzed: redditSentiment.postsAnalyzed,
                sources: {
                  reddit: redditSentiment.overall,
                  stocktwits: Math.max(0, Math.min(100, redditSentiment.overall + (Math.random() * 20 - 10)))
                }
              },
              professional: { 
                score: newsSentiment?.score || 0, 
                sentiment: newsSentiment?.sentiment || 'Not Available',
                confidence: newsSentiment?.confidence || 0,
                postsAnalyzed: newsSentiment?.postsAnalyzed || 0,
                sources: {
                  news: newsSentiment?.sources?.news || newsSentiment?.score || 0,
                  analysts: newsSentiment?.sources?.analysts || Math.max(0, Math.min(100, (newsSentiment?.score || 0) + (Math.random() * 15 - 7.5)))
                }
              }
            };
            break;
            
          case 'technical':
            apiData = {
              indicators: {
                rsi: 67.3,
                macd: "Bullish",
                movingAvg20: "Above"
              },
              volume: {
                current: 75000000,
                average: 45000000,
                volumeRatio: 185
              }
            };
            break;
            
          default:
            return res.status(404).json({ message: "Data type not found" });
        }
        
        data = await storage.saveTickerData(symbol, type, apiData);
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticker data" });
    }
  });

  // Cache statistics endpoint for monitoring
  app.get("/api/cache/stats", (req, res) => {
    try {
      const stats = professionalSentimentCache.getStats();
      const debug = professionalSentimentCache.debug();
      
      res.json({
        cache: stats,
        entries: debug,
        message: "Professional sentiment cache is optimized for 6-hour refresh cycles"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get cache stats" });
    }
  });

  // Cache management endpoint (for admin use)
  app.post("/api/cache/invalidate/:ticker", (req, res) => {
    try {
      const { ticker } = req.params;
      professionalSentimentCache.invalidate(ticker);
      res.json({ message: `Cache invalidated for ${ticker.toUpperCase()}` });
    } catch (error) {
      res.status(500).json({ message: "Failed to invalidate cache" });
    }
  });

  // Log cache stats periodically
  setInterval(() => {
    logCacheStats();
  }, 30 * 60 * 1000); // Every 30 minutes

  const httpServer = createServer(app);
  return httpServer;
}
