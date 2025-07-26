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
    <Tabs defaultValue="primary" className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
        <TabsTrigger
          value="primary"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Primary Details
        </TabsTrigger>
        <TabsTrigger
          value="ai"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          AI Analysis
        </TabsTrigger>
        <TabsTrigger
          value="fundamentals"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Fundamentals
        </TabsTrigger>
        <TabsTrigger
          value="technical"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Technical Analysis
        </TabsTrigger>
        <TabsTrigger
          value="sentiment"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Retail vs Pro Sentiment
        </TabsTrigger>
      </TabsList>

      <TabsContent value="primary" className="mt-6">
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
        <div className="space-y-6">
          {/* Top Section: Price Chart and Technical Indicators */}
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
                          {technicalData?.data && (technicalData.data as any)?.indicators?.rsi || 'N/A'}
                        </span>
                      </div>
                      {technicalData?.data && (technicalData.data as any)?.indicators?.rsi && (
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
                          {technicalData?.data && (technicalData.data as any)?.indicators?.macd || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Moving Avg (20)</span>
                        <span className="text-green-500">
                          {technicalData?.data && (technicalData.data as any)?.indicators?.movingAvg20 || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Chart Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Simple Moving Averages Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">SMA Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-slate-400 text-sm">Chart Placeholder</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MACD Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">MACD Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <span className="text-slate-400 text-sm">Chart Placeholder</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RSI Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">RSI Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="text-slate-400 text-sm">Chart Placeholder</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>



      <TabsContent value="ai" className="mt-6">
        <div className="grid grid-cols-1 gap-6">
          {/* AI Analysis Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <span className="mr-2">🤖</span>
                AI-Powered Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-500/20">
                  <h4 className="text-blue-400 font-semibold mb-2">Market Outlook</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Based on technical indicators, fundamental analysis, and market sentiment, the AI model suggests a 
                    <span className="text-green-500 font-medium"> moderately bullish </span> 
                    outlook for this ticker. Recent earnings performance and sector trends support continued growth potential.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-4 rounded-lg border border-green-500/20">
                  <h4 className="text-green-400 font-semibold mb-2">Key Catalysts Identified</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Product launch cycle expected to drive Q4 revenue</li>
                    <li>• Market expansion in emerging regions showing momentum</li>
                    <li>• Cost optimization initiatives improving margins</li>
                    <li>• Strategic partnerships enhancing competitive position</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/20">
                  <h4 className="text-yellow-400 font-semibold mb-2">Risk Assessment</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Primary risks include regulatory changes, supply chain disruptions, and increased competition. 
                    However, the company's strong balance sheet and diversified revenue streams provide 
                    <span className="text-blue-500 font-medium"> solid downside protection</span>.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-500/20">
                  <h4 className="text-purple-400 font-semibold mb-2">Price Target & Timeline</h4>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">3 Month</div>
                      <div className="text-green-500 font-bold">$205</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">6 Month</div>
                      <div className="text-blue-500 font-bold">$218</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">12 Month</div>
                      <div className="text-purple-500 font-bold">$235</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
