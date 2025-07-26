import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { useStockData, type StockData } from "@/hooks/use-stock-data";

interface StockPrimaryDetailsProps {
  tickerSymbol: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatPercent(percent: number | null): string {
  if (percent === null) return 'N/A';
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function StockPrimaryDetails({ tickerSymbol }: StockPrimaryDetailsProps) {
  const { data: stockData, isLoading, error } = useStockData(tickerSymbol);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 bg-slate-700 mb-2" />
                <Skeleton className="h-4 w-20 bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-slate-700" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-full bg-slate-700" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-900/20 border-red-800">
        <AlertDescription className="text-red-300">
          Failed to load stock data: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stockData) {
    return (
      <Alert className="bg-yellow-900/20 border-yellow-800">
        <AlertDescription className="text-yellow-300">
          No stock data available for {tickerSymbol}
        </AlertDescription>
      </Alert>
    );
  }

  const { quote, ytd, news } = stockData;
  const priceChange = quote.c - quote.pc;
  const priceChangePercent = (priceChange / quote.pc) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-6">
      {/* Price Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Price */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Current Price</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatPrice(quote.c)}
            </div>
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {formatPrice(Math.abs(priceChange))} ({formatPercent(priceChangePercent)})
            </div>
          </CardContent>
        </Card>

        {/* Day Range */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Day Range</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatPrice(quote.l)} - {formatPrice(quote.h)}
            </div>
            <div className="text-sm text-slate-400">
              Open: {formatPrice(quote.o)}
            </div>
          </CardContent>
        </Card>

        {/* YTD Performance */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">YTD Performance</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${ytd.growthPct && ytd.growthPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(ytd.growthPct)}
            </div>
            <div className="text-sm text-slate-400">
              Jan 1: {ytd.priceOnJan1 ? formatPrice(ytd.priceOnJan1) : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year Range */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">52-Week Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-400">52-Week Low</div>
              <div className="text-lg font-semibold text-white">
                {ytd.yearLow ? formatPrice(ytd.yearLow) : 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Current</div>
              <div className="text-lg font-semibold text-white">
                {formatPrice(quote.c)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">52-Week High</div>
              <div className="text-lg font-semibold text-white">
                {ytd.yearHigh ? formatPrice(ytd.yearHigh) : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent News */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent News</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <div className="text-slate-400 text-center py-4">
              No recent news available
            </div>
          ) : (
            <div className="space-y-4">
              {news.slice(0, 5).map((article, index) => (
                <div key={index} className="border-b border-slate-700 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm leading-5 flex-1 mr-4">
                      {article.headline}
                    </h4>
                    <span className="text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(article.datetime)}
                    </span>
                  </div>
                  {article.summary && (
                    <p className="text-slate-400 text-sm leading-5 mb-2">
                      {article.summary.length > 150 
                        ? `${article.summary.substring(0, 150)}...` 
                        : article.summary}
                    </p>
                  )}
                  {article.url && (
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
