import { 
  users, 
  tickers, 
  userWatchlists, 
  userSearchHistory, 
  tickerData,
  type User, 
  type InsertUser,
  type LoginUser,
  type Ticker,
  type InsertTicker,
  type UserWatchlist,
  type UserSearchHistory,
  type TickerData
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
    
    // Seed with some sample tickers
    this.seedTickers();
  }

  private async seedTickers() {
    const sampleTickers = [
      { symbol: "AAPL", name: "Apple Inc.", price: 150.23, change: 3.45, changePercent: 2.34, volume: 75000000, marketCap: 2450000000000 },
      { symbol: "TSLA", name: "Tesla, Inc.", price: 245.67, change: -3.56, changePercent: -1.45, volume: 45000000, marketCap: 780000000000 },
      { symbol: "MSFT", name: "Microsoft Corporation", price: 334.12, change: 2.97, changePercent: 0.89, volume: 35000000, marketCap: 2800000000000 },
      { symbol: "NVDA", name: "NVIDIA Corporation", price: 418.77, change: 13.44, changePercent: 3.21, volume: 55000000, marketCap: 1030000000000 },
      { symbol: "AMZN", name: "Amazon.com, Inc.", price: 127.45, change: 0.57, changePercent: 0.45, volume: 28000000, marketCap: 1320000000000 },
    ];

    for (const ticker of sampleTickers) {
      await this.createOrUpdateTicker(ticker);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
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
}

export const storage = new MemStorage();
