import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Ticker } from "@shared/schema";

interface SidebarProps {
  onTickerSelect: (symbol: string) => void;
  currentTicker?: string;
}

interface WatchlistItem {
  id: string;
  tickerSymbol: string;
  ticker?: Ticker;
}

interface SearchHistoryItem {
  id: string;
  tickerSymbol: string;
  ticker?: Ticker;
}

export function Sidebar({ onTickerSelect, currentTicker }: SidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: searchHistory = [] } = useQuery<SearchHistoryItem[]>({
    queryKey: ["/api/search-history"],
  });

  const { data: watchlist = [] } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      await apiRequest("POST", `/api/watchlist/${symbol}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Success",
        description: "Added to watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      await apiRequest("DELETE", `/api/watchlist/${symbol}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Success",
        description: "Removed from watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.tickerSymbol === symbol);
  };

  const handleWatchlistToggle = (symbol: string) => {
    if (isInWatchlist(symbol)) {
      removeFromWatchlistMutation.mutate(symbol);
    } else {
      addToWatchlistMutation.mutate(symbol);
    }
  };

  return (
    <div className="w-80 bg-slate-800 min-h-screen border-r border-slate-700 p-6 hidden lg:block">
      {/* Recently Searched */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recently Searched</h3>
        <div className="space-y-2">
          {searchHistory.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent searches</p>
          ) : (
            searchHistory.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer ${
                  currentTicker === item.tickerSymbol ? 'bg-slate-600' : 'bg-slate-700'
                }`}
                onClick={() => onTickerSelect(item.tickerSymbol)}
              >
                <div>
                  <span className="font-medium text-white">{item.tickerSymbol}</span>
                  {item.ticker && (
                    <span className={`text-sm ml-2 ${getChangeColor(item.ticker.change)}`}>
                      {formatChange(item.ticker.change, item.ticker.changePercent)}
                    </span>
                  )}
                </div>
                {item.ticker && (
                  <span className="text-slate-400 text-sm">
                    {formatPrice(item.ticker.price)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Favorites */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Favorites</h3>
        <div className="space-y-2">
          {watchlist.length === 0 ? (
            <p className="text-slate-400 text-sm">No favorites yet</p>
          ) : (
            watchlist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer ${
                  currentTicker === item.tickerSymbol ? 'bg-slate-600' : 'bg-slate-700'
                }`}
                onClick={() => onTickerSelect(item.tickerSymbol)}
              >
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2 fill-current" />
                  <span className="font-medium text-white">{item.tickerSymbol}</span>
                </div>
                {item.ticker && (
                  <span className={`text-sm ${getChangeColor(item.ticker.change)}`}>
                    {formatChange(item.ticker.change, item.ticker.changePercent)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add to Watchlist Button */}
      {currentTicker && (
        <Button
          onClick={() => handleWatchlistToggle(currentTicker)}
          disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${
            isInWatchlist(currentTicker)
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white hover:shadow-lg hover:shadow-yellow-500/25'
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
          }`}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isInWatchlist(currentTicker) ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </Button>
      )}
    </div>
  );
}
