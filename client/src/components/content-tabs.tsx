import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TickerData } from "@shared/schema";
import { StockPrimaryDetails } from "@/components/stock/StockPrimaryDetails";
import { TechnicalAnalysisDashboard } from "@/components/TechnicalAnalysisDashboard";
import { BeginnerFundamentals } from "@/components/BeginnerFundamentals";

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
          Sentiment Analysis
        </TabsTrigger>
      </TabsList>

      <TabsContent value="primary" className="mt-6">
        <StockPrimaryDetails tickerSymbol={tickerSymbol} />
      </TabsContent>

      <TabsContent value="sentiment" className="mt-6">
        {/* Overall Sentiment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Professional Sentiment - Keep as is */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">🏦</span>
                Professional Sentiment
                <span className="text-sm text-slate-400 font-normal">(News, Analysts)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentLoading ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse flex items-center justify-center">
                        <span className="text-2xl">🏦</span>
                      </div>
                      <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">
                      Analyzing Professional Sentiment
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      Fetching news articles and analyst reports...
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Processing financial news and analyst data...
                      </div>
                    </div>
                  </div>
                </div>
              ) : (sentimentData?.data as any)?.professional?.sentiment?.includes('Not Available') || 
                   (sentimentData?.data as any)?.professional?.sentiment?.includes('Unavailable') ||
                   (sentimentData?.data as any)?.professional?.score === 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">�</div>
                    <div className="text-xl font-semibold text-slate-300 mb-2">
                      Professional Analysis Coming Soon
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      News sentiment and analyst ratings integration in development
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Future Data Sources:</h4>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>• Financial news sentiment analysis</div>
                        <div>• Analyst price target aggregation</div>
                        <div>• Earnings call transcripts</div>
                        <div>• SEC filing sentiment</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div 
                      className="text-4xl font-bold mb-2"
                      style={{
                        color: 
                          ((sentimentData?.data as any)?.professional?.score || 0) >= 60 ? '#10B981' :  // Green
                          ((sentimentData?.data as any)?.professional?.score || 0) >= 40 ? '#F59E0B' : '#EF4444'  // Yellow : Red
                      }}
                    >
                      {(sentimentData?.data as any)?.professional?.score || 0}%
                    </div>
                    <div className="text-slate-400 mb-1">
                      {(sentimentData?.data as any)?.professional?.sentiment || "Neutral"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Confidence: {(sentimentData?.data as any)?.professional?.confidence || 0}%
                      {(sentimentData?.data as any)?.professional?.postsAnalyzed && (
                        <span className="ml-2">• Last {(sentimentData?.data as any).professional.postsAnalyzed} sources analyzed</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Sentiment Gauge */}
                  <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(sentimentData?.data as any)?.professional?.score || 0}%`,
                        backgroundColor: 
                          ((sentimentData?.data as any)?.professional?.score || 0) >= 60 ? '#10B981' :  // Green
                          ((sentimentData?.data as any)?.professional?.score || 0) >= 40 ? '#F59E0B' : '#EF4444'  // Yellow : Red
                      }}
                    ></div>
                  </div>
                  
                  {/* Source Breakdown */}
                  {(sentimentData?.data as any)?.professional?.sources && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300">Source Breakdown:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">News:</span>
                          <span className="text-white">{(sentimentData?.data as any).professional.sources.news}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Analysts:</span>
                          <span className="text-white">{Math.round((sentimentData?.data as any).professional.sources.analysts || 0)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overall Reddit Sentiment Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">📱</span>
                Summarized Retail Sentiment
                <span className="text-sm text-slate-400 font-normal">(Reddit + StockTwits)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentLoading ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">
                      Analyzing Reddit Communities
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      Searching 6 popular stock communities + StockTwits...
                    </div>
                    <div className="space-y-3">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <div>• Fetching r/wallstreetbets, r/investing, r/stocks...</div>
                        <div>• Analyzing r/StockMarket, r/SecurityAnalysis, r/ValueInvesting...</div>
                        <div>• Processing StockTwits sentiment data...</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (sentimentData?.data as any)?.retail?.noDataFound ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="text-xl font-semibold text-slate-300 mb-2">
                      No Reddit Mentions Found
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      No discussions found for {tickerSymbol.toUpperCase()} in popular stock communities
                    </div>
                    {(sentimentData?.data as any)?.retail?.insights && (
                      <div className="space-y-2">
                        {(sentimentData?.data as any).retail.insights.map((insight: string, index: number) => (
                          <div key={index} className="text-xs text-slate-500 bg-slate-700/30 p-2 rounded">
                            {insight}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div 
                      className="text-4xl font-bold mb-2"
                      style={{
                        color: 
                          ((sentimentData?.data as any)?.retail?.score || 0) >= 60 ? '#10B981' :  // Green
                          ((sentimentData?.data as any)?.retail?.score || 0) >= 40 ? '#F59E0B' : '#EF4444'  // Yellow : Red
                      }}
                    >
                      {(sentimentData?.data as any)?.retail?.score || 0}%
                    </div>
                    <div className="text-slate-400 mb-1">
                      {(sentimentData?.data as any)?.retail?.sentiment || "Neutral"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Confidence: {(sentimentData?.data as any)?.retail?.confidence || 0}%
                      {(sentimentData?.data as any)?.retail?.postsAnalyzed && (
                        <span className="ml-2">• Last {(sentimentData?.data as any).retail.postsAnalyzed} posts analyzed</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Sentiment Gauge */}
                  <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(sentimentData?.data as any)?.retail?.score || 0}%`,
                        backgroundColor: 
                          ((sentimentData?.data as any)?.retail?.score || 0) >= 60 ? '#10B981' :  // Green
                          ((sentimentData?.data as any)?.retail?.score || 0) >= 40 ? '#F59E0B' : '#EF4444'  // Yellow : Red
                      }}
                    ></div>
                  </div>
                  
                  {/* Insights Preview */}
                  {(sentimentData?.data as any)?.retail?.insights && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300">Key Insights:</h4>
                      <div className="space-y-1">
                        {(sentimentData?.data as any).retail.insights.slice(0, 2).map((insight: string, index: number) => (
                          <div key={index} className="text-xs text-slate-400 bg-slate-700/50 p-2 rounded">
                            • {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Individual Subreddit Cards */}
        {sentimentLoading ? (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏘️</span>
              Community Breakdown
              <span className="text-sm text-slate-400 font-normal">
                (Analyzing communities...)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Loading placeholder cards for each subreddit */}
              {['r/WallStreetBets', 'r/investing', 'r/stocks', 'r/StockMarket', 'r/SecurityAnalysis', 'r/ValueInvesting'].map((name, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      <Skeleton className="w-6 h-6 rounded bg-slate-600" />
                      <Skeleton className="w-32 h-4 rounded bg-slate-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <Skeleton className="w-16 h-8 mx-auto mb-2 rounded bg-slate-600" />
                      <Skeleton className="w-20 h-4 mx-auto mb-1 rounded bg-slate-600" />
                      <Skeleton className="w-24 h-3 mx-auto rounded bg-slate-600" />
                    </div>
                    <Skeleton className="w-full h-2 rounded-full bg-slate-600" />
                    <div className="space-y-1">
                      <Skeleton className="w-20 h-3 rounded bg-slate-600" />
                      <div className="flex gap-1">
                        <Skeleton className="w-16 h-5 rounded bg-slate-600" />
                        <Skeleton className="w-20 h-5 rounded bg-slate-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : !sentimentLoading && (sentimentData?.data as any)?.retail?.subreddits && (sentimentData?.data as any).retail.subreddits.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏘️</span>
              Community Breakdown
              <span className="text-sm text-slate-400 font-normal">
                ({(sentimentData?.data as any).retail.subreddits.length} communities with mentions)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{(sentimentData?.data as any).retail.subreddits.map((subreddit: any, index: number) => {
                const getSubredditIcon = (name: string) => {
                  switch(name.toLowerCase()) {
                    case 'wallstreetbets': return '🚀';
                    case 'investing': return '📈';
                    case 'stocks': return '📊';
                    case 'stockmarket': return '🏪';
                    case 'securityanalysis': return '🔍';
                    case 'valueinvesting': return '💎';
                    default: return '💬';
                  }
                };

                const getSentimentColor = (score: number) => {
                  if (score >= 70) return '#10B981'; // Green
                  if (score >= 60) return '#34D399'; // Light green
                  if (score >= 40) return '#F59E0B'; // Yellow
                  if (score >= 30) return '#FB923C'; // Orange
                  return '#EF4444'; // Red
                };

                return (
                  <Card key={index} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-base">
                        <span className="text-xl">{getSubredditIcon(subreddit.subreddit)}</span>
                        {subreddit.displayName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Sentiment Score */}
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold mb-1"
                          style={{ color: getSentimentColor(subreddit.score) }}
                        >
                          {subreddit.score}%
                        </div>
                        <div className="text-slate-400 text-sm mb-1">
                          {subreddit.sentiment}
                        </div>
                        <div className="text-xs text-slate-500">
                          Last {subreddit.postsAnalyzed} posts analyzed • {subreddit.confidence}% confidence
                        </div>
                      </div>

                      {/* Sentiment Bar */}
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${subreddit.score}%`,
                            backgroundColor: getSentimentColor(subreddit.score)
                          }}
                        ></div>
                      </div>

                      {/* Community Characteristics */}
                      <div>
                        <h5 className="text-xs font-medium text-slate-300 mb-2">Community Style:</h5>
                        <div className="flex flex-wrap gap-1">
                          {subreddit.characteristics.slice(0, 3).map((char: string, charIndex: number) => (
                            <span 
                              key={charIndex}
                              className="text-xs bg-slate-700/60 text-slate-300 px-2 py-1 rounded"
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Top Posts Preview */}
                      {subreddit.posts && subreddit.posts.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-slate-300 mb-2">Hot Discussion:</h5>
                          <div className="text-xs text-slate-400 bg-slate-700/30 p-2 rounded leading-relaxed">
                            "{subreddit.posts[0].title}"
                            <div className="text-slate-500 mt-1">
                              {subreddit.posts[0].upvotes} upvotes • {subreddit.posts[0].score}% bullish
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Show insights about search coverage */}
            {(sentimentData?.data as any)?.retail?.insights && (
              <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  Search Coverage
                </h4>
                <div className="space-y-2">
                  {(sentimentData?.data as any).retail.insights.map((insight: string, index: number) => (
                    <div key={index} className="text-xs text-slate-400">
                      • {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* StockTwits Card */}
        {!sentimentLoading && (sentimentData?.data as any)?.retail?.stocktwits && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>💰</span>
              Retail Trading Platform
            </h3>
            <div className="max-w-md">
              {(() => {
                const stocktwits = (sentimentData?.data as any).retail.stocktwits;
                
                const getSentimentColor = (score: number) => {
                  if (score >= 70) return '#10B981'; // Green
                  if (score >= 60) return '#34D399'; // Light green
                  if (score >= 40) return '#F59E0B'; // Yellow
                  if (score >= 30) return '#FB923C'; // Orange
                  return '#EF4444'; // Red
                };

                return (
                  <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-base">
                        <span className="text-xl">📱</span>
                        {stocktwits.displayName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Sentiment Score */}
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold mb-1"
                          style={{ color: getSentimentColor(stocktwits.score) }}
                        >
                          {stocktwits.score}%
                        </div>
                        <div className="text-slate-400 text-sm mb-1">
                          {stocktwits.sentiment}
                        </div>
                        <div className="text-xs text-slate-500">
                          Last {stocktwits.postsAnalyzed} messages analyzed • {stocktwits.confidence}% confidence
                        </div>
                      </div>

                      {/* Sentiment Bar */}
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${stocktwits.score}%`,
                            backgroundColor: getSentimentColor(stocktwits.score)
                          }}
                        ></div>
                      </div>

                      {/* Platform Characteristics */}
                      <div>
                        <h5 className="text-xs font-medium text-slate-300 mb-2">Platform Style:</h5>
                        <div className="flex flex-wrap gap-1">
                          {stocktwits.characteristics.slice(0, 3).map((char: string, charIndex: number) => (
                            <span 
                              key={charIndex}
                              className="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded"
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Top Messages Preview */}
                      {stocktwits.posts && stocktwits.posts.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-slate-300 mb-2">Recent Buzz:</h5>
                          <div className="text-xs text-slate-400 bg-slate-700/30 p-2 rounded leading-relaxed">
                            "{stocktwits.posts[0].title}"
                            <div className="text-slate-500 mt-1">
                              {stocktwits.posts[0].score}% bullish sentiment
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        )}
        
        {/* Sentiment Insights */}
        {!sentimentLoading && (
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-xl">🧠</span>
                Sentiment Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const retailScore = (sentimentData?.data as any)?.retail?.score || 50;
                  const professionalScore = (sentimentData?.data as any)?.professional?.score || 0;
                  const isProfessionalAvailable = !(
                    (sentimentData?.data as any)?.professional?.sentiment?.includes('Not Available') || 
                    (sentimentData?.data as any)?.professional?.sentiment?.includes('Unavailable')
                  );
                  const divergence = Math.abs(retailScore - professionalScore);
                  
                  const insights = [];
                  
                  // Only show sentiment comparisons when professional data is available
                  if (isProfessionalAvailable && divergence > 20) {
                    if (retailScore > professionalScore) {
                      insights.push({
                        icon: "⚠️",
                        text: `Retail investors are significantly more bullish than professionals (${divergence.toFixed(0)} point gap)`,
                        color: "text-yellow-400"
                      });
                    } else {
                      insights.push({
                        icon: "📈",
                        text: `Professionals are more optimistic than retail investors (${divergence.toFixed(0)} point gap)`,
                        color: "text-blue-400"
                      });
                    }
                  } else if (isProfessionalAvailable) {
                    insights.push({
                      icon: "🤝",
                      text: "Retail and professional sentiment are aligned",
                      color: "text-green-400"
                    });
                  }
                  
                  if (retailScore >= 70) {
                    insights.push({
                      icon: "🚀",
                      text: "Strong retail momentum detected",
                      color: "text-green-400"
                    });
                  } else if (retailScore <= 30) {
                    insights.push({
                      icon: "📉",
                      text: "Retail sentiment shows significant bearishness",
                      color: "text-red-400"
                    });
                  }
                  
                  if (professionalScore >= 65) {
                    insights.push({
                      icon: "💼",
                      text: "Professional analysts maintain positive outlook",
                      color: "text-blue-400"
                    });
                  }
                  
                  return insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-lg">{insight.icon}</span>
                      <span className={`text-sm ${insight.color}`}>{insight.text}</span>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="fundamentals" className="mt-6">
        <BeginnerFundamentals ticker={tickerSymbol} />
      </TabsContent>

      <TabsContent value="technical" className="mt-6">
        <TechnicalAnalysisDashboard tickerSymbol={tickerSymbol} />
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
