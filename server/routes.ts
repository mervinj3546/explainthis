import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

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
      const ticker = await storage.getTicker(symbol);
      
      if (!ticker) {
        return res.status(404).json({ message: "Ticker not found" });
      }
      
      res.json(ticker);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticker" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", requireAuth, async (req: any, res) => {
    try {
      const watchlist = await storage.getUserWatchlist(req.session.userId);
      const tickersWithData = await Promise.all(
        watchlist.map(async (item) => {
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
    try {
      const { symbol, type } = req.params;
      let data = await storage.getTickerData(symbol, type);
      
      // If no data exists, create mock data based on type
      if (!data) {
        let mockData;
        switch (type) {
          case 'news':
            mockData = {
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
            break;
          case 'sentiment':
            mockData = {
              retail: { score: 78, sentiment: "Bullish" },
              professional: { score: 65, sentiment: "Neutral-Bullish" }
            };
            break;
          case 'fundamentals':
            mockData = {
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
            break;
          case 'technical':
            mockData = {
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
        
        data = await storage.saveTickerData(symbol, type, mockData);
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticker data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
