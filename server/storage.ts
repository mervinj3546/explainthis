import { 
  users, 
  tickers, 
  userWatchlists, 
  userSearchHistory, 
  tickerData,
  type User, 
  type InsertUser,
  type OAuthUser,
  type LoginUser,
  type Ticker,
  type InsertTicker,
  type UserWatchlist,
  type UserSearchHistory,
  type TickerData
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, and, desc, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOAuthUser(user: OAuthUser): Promise<User>;
  linkOAuthProvider(userId: string, oauthData: { provider: string; providerId: string; profilePicture?: string }): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;
  
  // Ticker operations
  getTicker(symbol: string): Promise<Ticker | undefined>;
  searchTickers(query: string): Promise<Ticker[]>;
  createOrUpdateTicker(ticker: InsertTicker): Promise<Ticker>;
  
  // Watchlist operations
  getUserWatchlist(userId: string): Promise<UserWatchlist[]>;
  addToWatchlist(userId: string, tickerSymbol: string): Promise<UserWatchlist>;
  removeFromWatchlist(userId: string, tickerSymbol: string): Promise<boolean>;
  
  // Search history operations
  getUserSearchHistory(userId: string): Promise<UserSearchHistory[]>;
  addToSearchHistory(userId: string, tickerSymbol: string): Promise<UserSearchHistory>;
  
  // Ticker data operations
  getTickerData(tickerSymbol: string, dataType: string): Promise<TickerData | undefined>;
  saveTickerData(tickerSymbol: string, dataType: string, data: any): Promise<TickerData>;
  clearTickerData(tickerSymbol: string, dataType: string): Promise<boolean>;
  isCacheExpired(tickerSymbol: string, dataType: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickers: Map<string, Ticker>;
  private watchlists: Map<string, UserWatchlist>;
  private searchHistory: Map<string, UserSearchHistory>;
  private tickerDataStore: Map<string, TickerData>;

  constructor() {
    this.users = new Map();
    this.tickers = new Map();
    this.watchlists = new Map();
    this.searchHistory = new Map();
    this.tickerDataStore = new Map();
    
    // Seed with some sample tickers and demo user
    this.seedTickers();
    this.seedDemoUser();
  }

  private async seedTickers() {
    // Update with more recent realistic stock prices (these are fallback values only)
    const sampleTickers = [
      { symbol: "AAPL", name: "Apple Inc.", price: 213.88, change: 0.12, changePercent: 0.06, volume: 75000000, marketCap: 2450000000000 },
      { symbol: "TSLA", name: "Tesla, Inc.", price: 245.67, change: -3.56, changePercent: -1.45, volume: 45000000, marketCap: 780000000000 },
      { symbol: "MSFT", name: "Microsoft Corporation", price: 513.71, change: 2.83, changePercent: 0.55, volume: 35000000, marketCap: 2800000000000 },
      { symbol: "NVDA", name: "NVIDIA Corporation", price: 418.77, change: 13.44, changePercent: 3.21, volume: 55000000, marketCap: 1030000000000 },
      { symbol: "AMZN", name: "Amazon.com, Inc.", price: 127.45, change: 0.57, changePercent: 0.45, volume: 28000000, marketCap: 1320000000000 },
    ];

    for (const ticker of sampleTickers) {
      await this.createOrUpdateTicker(ticker);
    }
  }

  private async seedDemoUser() {
    // Create demo user: demo@example.com / demo123
    const demoId = "demo-user-id";
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const demoUser: User = {
      id: demoId,
      email: "demo@example.com",
      password: hashedPassword,
      firstName: "Demo",
      lastName: "User",
      profilePicture: null,
      provider: null,
      providerId: null,
      emailVerified: null,
      createdAt: new Date(),
    };
    this.users.set(demoId, demoUser);

    // Do not add any sample watchlist items - let user add them organically
    // Do not add any sample search history - let user build it through actual searches
    
    // Clear any existing hardcoded data for demo user (in case server has been restarted)
    this.clearDemoUserData(demoId);
  }

  private clearDemoUserData(demoUserId: string) {
    // Remove all existing watchlist items for demo user
    Array.from(this.watchlists.entries()).forEach(([id, item]) => {
      if (item.userId === demoUserId) {
        this.watchlists.delete(id);
      }
    });
    
    // Remove all existing search history for demo user
    Array.from(this.searchHistory.entries()).forEach(([id, item]) => {
      if (item.userId === demoUserId) {
        this.searchHistory.delete(id);
      }
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.provider === provider && user.providerId === providerId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = insertUser.password ? await bcrypt.hash(insertUser.password, 10) : null;
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profilePicture: null,
      provider: 'local',
      providerId: null,
      emailVerified: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createOAuthUser(oauthUser: OAuthUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: oauthUser.email,
      password: null, // OAuth users don't have passwords
      firstName: oauthUser.firstName || null,
      lastName: oauthUser.lastName || null,
      profilePicture: oauthUser.profilePicture || null,
      provider: oauthUser.provider,
      providerId: oauthUser.providerId,
      emailVerified: new Date(), // OAuth emails are pre-verified
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async linkOAuthProvider(userId: string, oauthData: { provider: string; providerId: string; profilePicture?: string }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...user,
      provider: oauthData.provider,
      providerId: oauthData.providerId,
      profilePicture: oauthData.profilePicture || user.profilePicture,
      emailVerified: new Date(),
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) return null; // No password means OAuth user
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getTicker(symbol: string): Promise<Ticker | undefined> {
    return this.tickers.get(symbol.toUpperCase());
  }

  async searchTickers(query: string): Promise<Ticker[]> {
    const searchQuery = query.toLowerCase();
    return Array.from(this.tickers.values()).filter(ticker =>
      ticker.symbol.toLowerCase().includes(searchQuery) ||
      ticker.name.toLowerCase().includes(searchQuery)
    );
  }

  async createOrUpdateTicker(insertTicker: InsertTicker): Promise<Ticker> {
    const ticker: Ticker = {
      id: randomUUID(),
      ...insertTicker,
      symbol: insertTicker.symbol.toUpperCase(),
      volume: insertTicker.volume || null,
      marketCap: insertTicker.marketCap || null,
      updatedAt: new Date(),
    };
    this.tickers.set(ticker.symbol, ticker);
    return ticker;
  }

  async getUserWatchlist(userId: string): Promise<UserWatchlist[]> {
    return Array.from(this.watchlists.values()).filter(item => item.userId === userId);
  }

  async addToWatchlist(userId: string, tickerSymbol: string): Promise<UserWatchlist> {
    const id = randomUUID();
    const watchlistItem: UserWatchlist = {
      id,
      userId,
      tickerSymbol: tickerSymbol.toUpperCase(),
      addedAt: new Date(),
    };
    this.watchlists.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: string, tickerSymbol: string): Promise<boolean> {
    const item = Array.from(this.watchlists.values()).find(
      w => w.userId === userId && w.tickerSymbol === tickerSymbol.toUpperCase()
    );
    if (item) {
      this.watchlists.delete(item.id);
      return true;
    }
    return false;
  }

  async getUserSearchHistory(userId: string): Promise<UserSearchHistory[]> {
    return Array.from(this.searchHistory.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.searchedAt!).getTime() - new Date(a.searchedAt!).getTime())
      .slice(0, 10); // Return last 10 searches
  }

  async addToSearchHistory(userId: string, tickerSymbol: string): Promise<UserSearchHistory> {
    const id = randomUUID();
    const historyItem: UserSearchHistory = {
      id,
      userId,
      tickerSymbol: tickerSymbol.toUpperCase(),
      searchedAt: new Date(),
    };
    this.searchHistory.set(id, historyItem);
    return historyItem;
  }

  async getTickerData(tickerSymbol: string, dataType: string): Promise<TickerData | undefined> {
    const key = `${tickerSymbol.toUpperCase()}_${dataType}`;
    return Array.from(this.tickerDataStore.values()).find(
      data => data.tickerSymbol === tickerSymbol.toUpperCase() && data.dataType === dataType
    );
  }

  async saveTickerData(tickerSymbol: string, dataType: string, data: any): Promise<TickerData> {
    const id = randomUUID();
    const tickerDataItem: TickerData = {
      id,
      tickerSymbol: tickerSymbol.toUpperCase(),
      dataType,
      data,
      createdAt: new Date(),
    };
    this.tickerDataStore.set(id, tickerDataItem);
    return tickerDataItem;
  }

  async clearTickerData(tickerSymbol: string, dataType: string): Promise<boolean> {
    const existingData = Array.from(this.tickerDataStore.entries()).find(
      ([_, data]) => data.tickerSymbol === tickerSymbol.toUpperCase() && data.dataType === dataType
    );
    if (existingData) {
      this.tickerDataStore.delete(existingData[0]);
      return true;
    }
    return false;
  }

  async isCacheExpired(tickerSymbol: string, dataType: string): Promise<boolean> {
    const data = await this.getTickerData(tickerSymbol, dataType);
    if (!data || !data.createdAt) return true;

    const now = new Date();
    const cacheAge = now.getTime() - data.createdAt.getTime();
    
    // Cache expiry rules based on data type
    switch (dataType) {
      case 'fundamentals':
        return cacheAge > 24 * 60 * 60 * 1000; // 24 hours for fundamentals
      case 'news':
        return cacheAge > 30 * 60 * 1000; // 30 minutes for news
      case 'technical':
        return cacheAge > 12 * 60 * 60 * 1000; // 12 hours for technical indicators
      case 'sentiment':
        return cacheAge > 30 * 60 * 1000; // 30 minutes for sentiment analysis
      case 'ytd':
        return cacheAge > 12 * 60 * 60 * 1000; // 12 hours for YTD data
      case 'realtime-price':
        return cacheAge > 1 * 60 * 1000; // 1 minute for real-time price data
      default:
        return cacheAge > 60 * 60 * 1000; // 1 hour default
    }
  }
}

export class DbStorage implements IStorage {
  constructor() {
    // Initialize with demo data
    this.seedDatabase();
  }

  private async seedDatabase() {
    try {
      // Check if demo user already exists
      const existingDemo = await db
        .select()
        .from(users)
        .where(eq(users.email, "demo@example.com"))
        .limit(1);

      if (existingDemo.length === 0) {
        // Create demo user
        const hashedPassword = await bcrypt.hash("demo123", 10);
        const [demoUser] = await db
          .insert(users)
          .values({
            id: "demo-user-id",
            email: "demo@example.com",
            password: hashedPassword,
            firstName: "Demo",
            lastName: "User",
          })
          .returning();

        // Seed sample tickers
        const sampleTickers = [
          { symbol: "AAPL", name: "Apple Inc.", price: 213.88, change: 0.12, changePercent: 0.06, volume: 75000000, marketCap: 2450000000000 },
          { symbol: "TSLA", name: "Tesla, Inc.", price: 245.67, change: -3.56, changePercent: -1.45, volume: 45000000, marketCap: 780000000000 },
          { symbol: "MSFT", name: "Microsoft Corporation", price: 513.71, change: 2.83, changePercent: 0.55, volume: 35000000, marketCap: 2800000000000 },
          { symbol: "NVDA", name: "NVIDIA Corporation", price: 418.77, change: 13.44, changePercent: 3.21, volume: 55000000, marketCap: 1030000000000 },
          { symbol: "AMZN", name: "Amazon.com, Inc.", price: 127.45, change: 0.57, changePercent: 0.45, volume: 28000000, marketCap: 1320000000000 },
        ];

        for (const ticker of sampleTickers) {
          await this.createOrUpdateTicker(ticker);
        }

        // Add sample watchlist for demo user
        const watchlistItems = ["AAPL", "TSLA", "MSFT"];
        for (const symbol of watchlistItems) {
          await db.insert(userWatchlists).values({
            userId: demoUser.id,
            tickerSymbol: symbol,
          });
        }

        // Add sample search history
        const searchItems = ["AAPL", "TSLA", "MSFT", "NVDA"];
        for (const symbol of searchItems) {
          await db.insert(userSearchHistory).values({
            userId: demoUser.id,
            tickerSymbol: symbol,
          });
        }

        // Add sample ticker data
        const sampleData = {
          news: {
            headlines: [
              { title: "Apple Reports Strong Q4 Earnings", source: "Reuters", time: "2 hours ago" },
              { title: "New iPhone Sales Exceed Expectations", source: "Bloomberg", time: "4 hours ago" },
              { title: "Apple Stock Reaches New High", source: "CNBC", time: "6 hours ago" }
            ]
          },
          sentiment: {
            bullish: 65,
            bearish: 35,
            neutral: 45,
            sentiment_score: 0.75
          },
          fundamentals: {
            pe_ratio: 28.5,
            market_cap: 2450000000000,
            revenue: 394000000000,
            profit_margin: 0.25
          },
          technical: {
            sma_20: 145.67,
            sma_50: 142.34,
            rsi: 58.3,
            macd: 2.45
          }
        };

        for (const dataType of ['news', 'sentiment', 'fundamentals', 'technical']) {
          await db.insert(tickerData).values({
            tickerSymbol: 'AAPL',
            dataType,
            data: sampleData[dataType as keyof typeof sampleData],
          });
        }
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async getUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
      .limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : null;
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        password: hashedPassword,
        provider: 'local',
      })
      .returning();
    return newUser;
  }

  async createOAuthUser(oauthUser: OAuthUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        profilePicture: oauthUser.profilePicture,
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
        emailVerified: new Date(),
        password: null, // OAuth users don't have passwords
      })
      .returning();
    return newUser;
  }

  async linkOAuthProvider(userId: string, oauthData: { provider: string; providerId: string; profilePicture?: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        profilePicture: oauthData.profilePicture,
        emailVerified: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) return null; // No password means OAuth user

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getTicker(symbol: string): Promise<Ticker | undefined> {
    const result = await db
      .select()
      .from(tickers)
      .where(eq(tickers.symbol, symbol.toUpperCase()))
      .limit(1);
    return result[0];
  }

  async searchTickers(query: string): Promise<Ticker[]> {
    return await db
      .select()
      .from(tickers)
      .where(ilike(tickers.symbol, `%${query.toUpperCase()}%`))
      .limit(10);
  }

  async createOrUpdateTicker(ticker: InsertTicker): Promise<Ticker> {
    const existing = await this.getTicker(ticker.symbol);
    
    if (existing) {
      const [updated] = await db
        .update(tickers)
        .set({ ...ticker, updatedAt: new Date() })
        .where(eq(tickers.symbol, ticker.symbol))
        .returning();
      return updated;
    } else {
      const [newTicker] = await db
        .insert(tickers)
        .values(ticker)
        .returning();
      return newTicker;
    }
  }

  async getUserWatchlist(userId: string): Promise<UserWatchlist[]> {
    return await db
      .select()
      .from(userWatchlists)
      .where(eq(userWatchlists.userId, userId));
  }

  async addToWatchlist(userId: string, tickerSymbol: string): Promise<UserWatchlist> {
    const [watchlistItem] = await db
      .insert(userWatchlists)
      .values({
        userId,
        tickerSymbol: tickerSymbol.toUpperCase(),
      })
      .returning();
    return watchlistItem;
  }

  async removeFromWatchlist(userId: string, tickerSymbol: string): Promise<boolean> {
    const result = await db
      .delete(userWatchlists)
      .where(
        and(
          eq(userWatchlists.userId, userId),
          eq(userWatchlists.tickerSymbol, tickerSymbol.toUpperCase())
        )
      );
    return true;
  }

  async getUserSearchHistory(userId: string): Promise<UserSearchHistory[]> {
    return await db
      .select()
      .from(userSearchHistory)
      .where(eq(userSearchHistory.userId, userId))
      .orderBy(desc(userSearchHistory.searchedAt))
      .limit(10);
  }

  async addToSearchHistory(userId: string, tickerSymbol: string): Promise<UserSearchHistory> {
    const [historyItem] = await db
      .insert(userSearchHistory)
      .values({
        userId,
        tickerSymbol: tickerSymbol.toUpperCase(),
      })
      .returning();
    return historyItem;
  }

  async getTickerData(tickerSymbol: string, dataType: string): Promise<TickerData | undefined> {
    const result = await db
      .select()
      .from(tickerData)
      .where(
        and(
          eq(tickerData.tickerSymbol, tickerSymbol.toUpperCase()),
          eq(tickerData.dataType, dataType)
        )
      )
      .limit(1);
    return result[0];
  }

  async saveTickerData(tickerSymbol: string, dataType: string, data: any): Promise<TickerData> {
    const [tickerDataItem] = await db
      .insert(tickerData)
      .values({
        tickerSymbol: tickerSymbol.toUpperCase(),
        dataType,
        data,
      })
      .returning();
    return tickerDataItem;
  }

  async clearTickerData(tickerSymbol: string, dataType: string): Promise<boolean> {
    const result = await db
      .delete(tickerData)
      .where(
        and(
          eq(tickerData.tickerSymbol, tickerSymbol.toUpperCase()),
          eq(tickerData.dataType, dataType)
        )
      );
    return true;
  }

  async isCacheExpired(tickerSymbol: string, dataType: string): Promise<boolean> {
    const data = await this.getTickerData(tickerSymbol, dataType);
    if (!data || !data.createdAt) return true;

    const now = new Date();
    const cacheAge = now.getTime() - data.createdAt.getTime();
    
    // Cache expiry rules based on data type
    switch (dataType) {
      case 'fundamentals':
        return cacheAge > 24 * 60 * 60 * 1000; // 24 hours for fundamentals
      case 'news':
        return cacheAge > 30 * 60 * 1000; // 30 minutes for news
      case 'technical':
        return cacheAge > 12 * 60 * 60 * 1000; // 12 hours for technical indicators
      case 'sentiment':
        return cacheAge > 30 * 60 * 1000; // 30 minutes for sentiment analysis
      case 'ytd':
        return cacheAge > 12 * 60 * 60 * 1000; // 12 hours for YTD data
      case 'realtime-price':
        return cacheAge > 1 * 60 * 1000; // 1 minute for real-time price data
      default:
        return cacheAge > 60 * 60 * 1000; // 1 hour default
    }
  }
}

export const storage = new DbStorage();
