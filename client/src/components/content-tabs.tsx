import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TickerData } from "@shared/schema";

interface ContentTabsProps {
  tickerSymbol: string;
}

export function ContentTabs({ tickerSymbol }: ContentTabsProps) {
  const { data: newsData, isLoading: newsLoading } = useQuery<TickerData>({
    queryKey: ["/api/ticker-data", tickerSymbol, "news"],
    enabled: !!tickerSymbol,
  });

  const { data: sentimentData, isLoading: sentimentLoading } = useQuery<TickerData>({
    queryKey: ["/api/ticker-data", tickerSymbol, "sentiment"],
    enabled: !!tickerSymbol,
  });

  const { data: fundamentalsData, isLoading: fundamentalsLoading } = useQuery<TickerData>({
    queryKey: ["/api/ticker-data", tickerSymbol, "fundamentals"],
    enabled: !!tickerSymbol,
  });

  const { data: technicalData, isLoading: technicalLoading } = useQuery<TickerData>({
    queryKey: ["/api/ticker-data", tickerSymbol, "technical"],
    enabled: !!tickerSymbol,
  });

  return (
    <Tabs defaultValue="moving" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
        <TabsTrigger
          value="moving"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Why It's Moving Today
        </TabsTrigger>
        <TabsTrigger
          value="sentiment"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Retail vs Pro Sentiment
        </TabsTrigger>
        <TabsTrigger
          value="fundamentals"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Contextual Fundamentals
        </TabsTrigger>
        <TabsTrigger
          value="technical"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Technical Analysis
        </TabsTrigger>
      </TabsList>

      <TabsContent value="moving" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* News & Events Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Latest News & Events</CardTitle>
            </CardHeader>
            <CardContent>
              {newsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-3/4 bg-slate-700" />
                  <Skeleton className="h-4 w-1/2 bg-slate-700" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(newsData?.data as any)?.items?.map((item: any, index: number) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium text-white mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm mb-2">{item.summary}</p>
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </div>
                  )) || (
                    <p className="text-slate-400">No recent news available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Context Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Market Context</CardTitle>
            </CardHeader>
            <CardContent>
              {technicalLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Volume vs Average</span>
                    <span className="text-green-500 font-medium">
                      +{(technicalData?.data as any)?.volume?.volumeRatio || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Current Volume</span>
                    <span className="text-blue-500 font-medium">
                      {((technicalData?.data as any)?.volume?.current || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Options Activity</span>
                    <span className="text-yellow-500 font-medium">Elevated</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="sentiment" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Retail Sentiment */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Retail Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentLoading ? (
                <div className="text-center">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4 bg-slate-700" />
                  <Skeleton className="h-4 w-32 mx-auto bg-slate-700" />
                </div>
              ) : (
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {(sentimentData?.data as any)?.retail?.score || 0}%
                  </div>
                  <div className="text-slate-400">{(sentimentData?.data as any)?.retail?.sentiment || "Neutral"}</div>
                  <div className="h-32 bg-slate-700 rounded-lg flex items-center justify-center mt-4">
                    <span className="text-slate-400">Sentiment Chart Placeholder</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Sentiment */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Professional Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentLoading ? (
                <div className="text-center">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4 bg-slate-700" />
                  <Skeleton className="h-4 w-32 mx-auto bg-slate-700" />
                </div>
              ) : (
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {(sentimentData?.data as any)?.professional?.score || 0}%
                  </div>
                  <div className="text-slate-400">{(sentimentData?.data as any)?.professional?.sentiment || "Neutral"}</div>
                  <div className="h-32 bg-slate-700 rounded-lg flex items-center justify-center mt-4">
                    <span className="text-slate-400">Pro Sentiment Chart Placeholder</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="fundamentals" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {fundamentalsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">P/E Ratio</span>
                    <span className="text-white font-medium">
                      {(fundamentalsData?.data as any)?.keyMetrics?.peRatio || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Cap</span>
                    <span className="text-white font-medium">
                      ${(fundamentalsData?.data as any)?.keyMetrics?.marketCap || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue (TTM)</span>
                    <span className="text-white font-medium">
                      ${(fundamentalsData?.data as any)?.keyMetrics?.revenue || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Health */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Financial Health</CardTitle>
            </CardHeader>
            <CardContent>
              {fundamentalsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Debt/Equity</span>
                    <span className="text-green-500 font-medium">
                      {(fundamentalsData?.data as any)?.financialHealth?.debtToEquity || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Ratio</span>
                    <span className="text-green-500 font-medium">
                      {(fundamentalsData?.data as any)?.financialHealth?.currentRatio || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROE</span>
                    <span className="text-green-500 font-medium">
                      {(fundamentalsData?.data as any)?.financialHealth?.roe || 'N/A'}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Growth Metrics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Growth</CardTitle>
            </CardHeader>
            <CardContent>
              {fundamentalsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue Growth</span>
                    <span className="text-blue-500 font-medium">
                      {(fundamentalsData?.data as any)?.growth?.revenueGrowth || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">EPS Growth</span>
                    <span className="text-green-500 font-medium">
                      {(fundamentalsData?.data as any)?.growth?.epsGrowth || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Book Value Growth</span>
                    <span className="text-blue-500 font-medium">
                      {(fundamentalsData?.data as any)?.growth?.bookValueGrowth || 'N/A'}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="technical" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Price Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-slate-400">Interactive Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>

          {/* Technical Indicators */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              {technicalLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full bg-slate-700" />
                  <Skeleton className="h-6 w-full bg-slate-700" />
                  <Skeleton className="h-6 w-full bg-slate-700" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">RSI (14)</span>
                      <span className="text-yellow-500">
                        {(technicalData?.data as any)?.indicators?.rsi || 'N/A'}
                      </span>
                    </div>
                    {(technicalData?.data as any)?.indicators?.rsi && (
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${Math.min((technicalData.data as any).indicators.rsi, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">MACD</span>
                      <span className="text-green-500">
                        {(technicalData?.data as any)?.indicators?.macd || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Moving Avg (20)</span>
                      <span className="text-green-500">
                        {(technicalData?.data as any)?.indicators?.movingAvg20 || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
