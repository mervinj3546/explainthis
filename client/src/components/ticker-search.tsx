import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Ticker } from "@shared/schema";

interface SearchHistoryItem {
  id: string;
  tickerSymbol: string;
  ticker?: Ticker;
}

interface TickerSearchProps {
  onTickerSelect: (symbol: string) => void;
  currentTicker?: string;
}

export function TickerSearch({ onTickerSelect, currentTicker }: TickerSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const queryClient = useQueryClient();

  const { data: searchResults = [], isLoading } = useQuery<Ticker[]>({
    queryKey: ["/api/tickers/search", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/tickers/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length > 0,
  });

  const { data: searchHistory = [] } = useQuery<SearchHistoryItem[]>({
    queryKey: ["/api/search-history"],
  });

  const addToSearchHistoryMutation = useMutation({
    mutationFn: async (symbol: string) => {
      await apiRequest("POST", `/api/search-history/${symbol}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-history"] });
    },
  });

  const handleTickerSelect = (symbol: string) => {
    setSearchQuery(symbol);
    setShowResults(false);
    setShowHistory(false);
    onTickerSelect(symbol);
    addToSearchHistoryMutation.mutate(symbol);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchResults.length > 0) {
        handleTickerSelect(searchResults[0].symbol);
      } else {
        // Try to search directly with the entered ticker
        handleTickerSelect(searchQuery.trim().toUpperCase());
      }
    }
  };

  useEffect(() => {
    if (currentTicker) {
      setSearchQuery(currentTicker);
    }
  }, [currentTicker]);

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="text"
          placeholder="Search ticker (e.g., AAPL)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(e.target.value.length > 0);
            setShowHistory(false);
          }}
          onBlur={() => {
            // Delay hiding results to allow for clicking
            setTimeout(() => {
              setShowResults(false);
              setShowHistory(false);
            }, 150);
          }}
          onFocus={() => {
            if (searchQuery.length > 0) {
              setShowResults(true);
            } else {
              setShowHistory(true);
            }
          }}
          className="w-full pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
        />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white h-8 w-8 p-0"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-slate-400 text-sm">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-3 text-slate-400 text-sm">No results found</div>
          ) : (
            searchResults.map((ticker) => (
              <button
                key={ticker.symbol}
                className="w-full text-left p-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                onClick={() => handleTickerSelect(ticker.symbol)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{ticker.symbol}</div>
                    <div className="text-sm text-slate-400 truncate">{ticker.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">
                      ${ticker.price.toFixed(2)}
                    </div>
                    <div className={`text-xs ${ticker.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {ticker.change >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Previously Searched Dropdown */}
      {showHistory && searchQuery.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchHistory.length === 0 ? (
            <div className="p-3 text-slate-400 text-sm">No recent searches</div>
          ) : (
            <>
              <div className="p-2 border-b border-slate-700">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Previously Searched</div>
              </div>
              {searchHistory.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left p-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                  onClick={() => handleTickerSelect(item.tickerSymbol)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-white">{item.tickerSymbol}</div>
                      {item.ticker && item.ticker.name && (
                        <div className="text-sm text-slate-400 truncate">{item.ticker.name}</div>
                      )}
                    </div>
                    {item.ticker ? (
                      <div className="text-right">
                        <div className="text-sm text-white">
                          ${item.ticker.price.toFixed(2)}
                        </div>
                        <div className={`text-xs ${item.ticker.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.ticker.change >= 0 ? '+' : ''}{item.ticker.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">No data</div>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
