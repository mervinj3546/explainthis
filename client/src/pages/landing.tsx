import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, User, Star, Clock, TrendingUp } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { getInitials } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TickerSearch } from "@/components/ticker-search";
import type { Ticker } from "@shared/schema";

interface WatchlistItem {
  id: string;
  tickerSymbol: string;
  ticker: Ticker;
}

interface SearchHistoryItem {
  id: string;
  tickerSymbol: string;
  ticker: Ticker;
  searchedAt: string;
}

// Common popular tickers for fallback
const POPULAR_TICKERS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc." }
];

interface LandingPageProps {
  onTickerSelect: (symbol: string) => void;
}

export default function LandingPage({ onTickerSelect }: LandingPageProps) {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  // Fetch watchlist
  const { data: watchlist = [] } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });

  // Fetch search history
  const { data: searchHistory = [] } = useQuery<SearchHistoryItem[]>({
    queryKey: ["/api/search-history"],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}$${Math.abs(change).toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const handleTickerSelect = (symbol: string) => {
    onTickerSelect(symbol.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <ChartLine className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Should I buy this stock</h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-transparent text-white">
                      {user ? getInitials(user) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700" align="end">
                <DropdownMenuItem className="text-white hover:bg-slate-700">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-red-400 hover:bg-slate-700 hover:text-red-300"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user?.firstName || 'Investor'}
          </h2>
          <p className="text-xl text-slate-400">
            Search for any stock to get comprehensive analysis and insights
          </p>
        </div>

        {/* Centered Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <TickerSearch onTickerSelect={handleTickerSelect} />
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favorites Section */}
          {watchlist.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Your Favorites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchlist.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleTickerSelect(item.tickerSymbol)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">
                        {item.tickerSymbol}
                      </div>
                      <div className="text-slate-200 text-sm">
                        {item.ticker?.name || `${item.tickerSymbol} Inc.`}
                      </div>
                    </div>
                    {item.ticker && (
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatPrice(item.ticker.price)}
                        </div>
                        <div className={`text-sm ${getChangeColor(item.ticker.change)}`}>
                          {formatChange(item.ticker.change, item.ticker.changePercent)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recently Searched Section */}
          {searchHistory.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Recently Searched
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleTickerSelect(item.tickerSymbol)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">
                        {item.tickerSymbol}
                      </div>
                      <div className="text-slate-200 text-sm">
                        {item.ticker?.name || `${item.tickerSymbol} Inc.`}
                      </div>
                    </div>
                    {item.ticker && (
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatPrice(item.ticker.price)}
                        </div>
                        <div className={`text-sm ${getChangeColor(item.ticker.change)}`}>
                          {formatChange(item.ticker.change, item.ticker.changePercent)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Popular Tickers Fallback - Show ONLY when no favorites AND no recent searches */}
        {watchlist.length === 0 && searchHistory.length === 0 && (
          <Card className="bg-slate-800 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Popular Stocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {POPULAR_TICKERS.map((ticker) => (
                  <div
                    key={ticker.symbol}
                    className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors text-center"
                    onClick={() => handleTickerSelect(ticker.symbol)}
                  >
                    <div className="text-white font-semibold text-lg mb-1">
                      {ticker.symbol}
                    </div>
                    <div className="text-slate-200 text-sm">
                      {ticker.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 px-6 py-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Explain This Ticker</h3>
              <p className="text-slate-500 text-sm">Financial intelligence platform for smart investors.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">About</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-500 text-sm">&copy; 2024 Explain This Ticker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
