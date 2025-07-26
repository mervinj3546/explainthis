import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, User } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { getInitials } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { TickerSearch } from "@/components/ticker-search";
import { ContentTabs } from "@/components/content-tabs";
import type { Ticker } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [currentTicker, setCurrentTicker] = useState<string>("AAPL");

  const { data: tickerData, isLoading: tickerLoading } = useQuery<Ticker>({
    queryKey: ["/api/tickers", currentTicker],
    enabled: !!currentTicker,
  });

  const handleTickerSelect = (symbol: string) => {
    setCurrentTicker(symbol.toUpperCase());
  };

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
            <h1 className="text-xl font-bold text-white">Explain This Ticker</h1>
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

      {/* Centered Search Bar */}
      <div className="bg-slate-800 border-b border-slate-700 py-4">
        <div className="max-w-md mx-auto px-4">
          <TickerSearch onTickerSelect={handleTickerSelect} currentTicker={currentTicker} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar onTickerSelect={handleTickerSelect} currentTicker={currentTicker} />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Current Ticker Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold text-white">{currentTicker}</h2>
                {tickerData && (
                  <span className="text-xl text-slate-400">{tickerData.name}</span>
                )}
              </div>
              <div className="text-right">
                {tickerLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-slate-700 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-20"></div>
                  </div>
                ) : tickerData ? (
                  <>
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(tickerData.price)}
                    </div>
                    <div className={`font-medium ${getChangeColor(tickerData.change)}`}>
                      {formatChange(tickerData.change, tickerData.changePercent)}
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400">No data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          {currentTicker && <ContentTabs tickerSymbol={currentTicker} />}
        </div>
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
