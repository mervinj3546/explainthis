import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown, Building2, DollarSign, BarChart3, Shield } from "lucide-react";
import { useStockData } from "@/hooks/use-stock-data";
import { useQuery } from "@tanstack/react-query";

interface BeginnerFundamentalsProps {
  ticker: string;
}

interface FundamentalsData {
  // New API structure
  keyMetrics?: {
    peRatio: number;
    marketCap: string | null;
    revenue: string | null;
  };
  financialHealth?: {
    debtToEquity: number;
    currentRatio: number;
    roe: number;
  };
  growth?: {
    revenueGrowth: number;
    epsGrowth: number;
    bookValueGrowth: number;
  };
  // Old mock data structure (for backwards compatibility)
  pe_ratio?: number;
  market_cap?: number;
  revenue?: number;
  profit_margin?: number;
}

// Helper function to format large numbers
const formatLargeNumber = (num: number | string | null): string => {
  if (!num || num === 'N/A') return 'N/A';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return 'N/A';
  
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

// Helper function to get color based on value
const getGrowthColor = (value: number | string | null): string => {
  if (!value || value === 'N/A') return 'text-muted-foreground';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'text-muted-foreground';
  return n >= 0 ? 'text-bullish' : 'text-bearish';
};

// Helper function to get ratio assessment
const getRatioAssessment = (ratio: number | string | null, type: 'pe' | 'current' | 'debt'): { color: string, label: string } => {
  if (!ratio || ratio === 'N/A') return { color: 'text-muted-foreground', label: 'Unknown' };
  const n = typeof ratio === 'string' ? parseFloat(ratio) : ratio;
  if (isNaN(n)) return { color: 'text-muted-foreground', label: 'Unknown' };
  
  switch (type) {
    case 'pe':
      if (n < 15) return { color: 'text-bullish', label: 'Good Value' };
      if (n < 25) return { color: 'text-accent-amber', label: 'Fair Value' };
      return { color: 'text-bearish', label: 'Expensive' };
    
    case 'current':
      if (n >= 2) return { color: 'text-bullish', label: 'Very Strong' };
      if (n >= 1.5) return { color: 'text-primary', label: 'Strong' };
      if (n >= 1) return { color: 'text-accent-amber', label: 'Adequate' };
      return { color: 'text-bearish', label: 'Weak' };
    
    case 'debt':
      if (n <= 0.3) return { color: 'text-bullish', label: 'Low Debt' };
      if (n <= 0.6) return { color: 'text-accent-amber', label: 'Moderate Debt' };
      return { color: 'text-bearish', label: 'High Debt' };
    
    default:
      return { color: 'text-muted-foreground', label: 'Unknown' };
  }
};

export function BeginnerFundamentals({ ticker }: BeginnerFundamentalsProps) {
  // Real-time price data (fetched fresh every 5 minutes, user-specific cache)
  const { data: stockData, isLoading, error } = useStockData(ticker);
  
  // Fundamentals data (cached 24 hours, shared across ALL users for same ticker)
  const { data: fundamentalsData, isLoading: fundamentalsLoading, error: fundamentalsError } = useQuery<FundamentalsData>({
    queryKey: ["/api/ticker-data", ticker, "fundamentals", "v2"], // Added v2 to force cache refresh
    queryFn: async () => {
      const response = await fetch(`/api/ticker-data/${ticker}/fundamentals?refresh=true`); // Force refresh to get fresh data
      if (!response.ok) throw new Error('Failed to fetch fundamentals');
      const result = await response.json();
      console.log('Full API response:', result);
      console.log('Extracted data:', result.data);
      // The API returns { data: { keyMetrics: {...}, growth: {...}, financialHealth: {...} } }
      // So we need to extract the nested data property
      return result.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours on client side too
    retry: 2,
  });

  if (isLoading || fundamentalsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || fundamentalsError || !fundamentalsData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Unable to load fundamentals data</p>
          <p className="text-sm text-muted-foreground">
            {fundamentalsError?.message || error?.message || "Data not available"}
          </p>
        </div>
      </div>
    );
  }

  // Use data from APIs with safe access - handle both new and old data structures
  console.log('Debug - Loading states:', { 
    stockLoading: isLoading, 
    fundamentalsLoading, 
    stockError: error, 
    fundamentalsError,
    fundamentalsData 
  });
  console.log('fundamentalsData:', fundamentalsData); // Debug log
  console.log('Type of fundamentalsData:', typeof fundamentalsData);
  console.log('fundamentalsData keys:', fundamentalsData ? Object.keys(fundamentalsData) : 'undefined');
  
  // Cast to any to avoid TypeScript issues for now
  const apiData = fundamentalsData as any;
  
  const fundamentals = {
    // Market Cap - use string directly from API
    marketCapString: fundamentalsData?.keyMetrics?.marketCap || 'N/A',
    
    // PE Ratio - try new structure first, then old
    peRatio: fundamentalsData?.keyMetrics?.peRatio || fundamentalsData?.pe_ratio || 0,
    
    // Revenue - use string directly from API  
    revenueString: fundamentalsData?.keyMetrics?.revenue || 'N/A',
    
    // Profit Margin - use old structure if available, otherwise estimate from growth
    profitMargin: fundamentalsData?.profit_margin 
      ? fundamentalsData.profit_margin * 100 // Convert decimal to percentage (0.25 -> 25)
      : (fundamentalsData?.growth?.revenueGrowth && fundamentalsData.growth.revenueGrowth > 0 ? 15.5 : 0),
    
    // Stock data
    ytdPerformance: stockData?.ytd?.growthPct || 0,
    yearHigh: stockData?.ytd?.yearHigh || 0,
    yearLow: stockData?.ytd?.yearLow || 0,
    currentPrice: stockData?.quote?.c || 0,
  };
  
  console.log('processed fundamentals:', fundamentals); // Debug log

  const peAssessment = getRatioAssessment(apiData?.keyMetrics?.peRatio || 0, 'pe');

  // Generate overall assessment
  const getOverallAssessment = () => {
    const peRatio = apiData?.keyMetrics?.peRatio || 0;
    const roe = apiData?.financialHealth?.roe || 0;
    const revenueGrowth = fundamentalsData?.growth?.revenueGrowth || 0;
    const epsGrowth = fundamentalsData?.growth?.epsGrowth || 0;
    
    let positives = [];
    let concerns = [];
    let overall = "Mixed";
    let overallColor = "text-yellow-500";
    
    // Check fundamentals
    if (roe >= 15) positives.push("Strong profitability (ROE)");
    else if (roe < 10) concerns.push("Low return on equity");
    
    if (revenueGrowth > 5) positives.push("Growing revenue");
    else if (revenueGrowth < 0) concerns.push("Declining revenue");
    
    if (epsGrowth > 5) positives.push("Growing earnings");
    else if (epsGrowth < -5) concerns.push("Declining earnings");
    
    if (peRatio < 15) positives.push("Good value (low P/E)");
    else if (peRatio > 30) concerns.push("Expensive valuation");
    
    // Determine overall assessment
    if (positives.length >= 3 && concerns.length <= 1) {
      overall = "Strong Fundamentals";
      overallColor = "text-green-500";
    } else if (concerns.length >= 3 && positives.length <= 1) {
      overall = "Weak Fundamentals";
      overallColor = "text-red-500";
    } else if (positives.length > concerns.length) {
      overall = "Good Fundamentals";
      overallColor = "text-blue-500";
    } else if (concerns.length > positives.length) {
      overall = "Concerning Fundamentals";
      overallColor = "text-orange-500";
    }
    
    return { overall, overallColor, positives, concerns };
  };

  const assessment = getOverallAssessment();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Fundamentals Made Simple</h2>
          <div className="text-muted-foreground text-sm">Perfect for beginners</div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-b from-[#1E2227] to-[#181B20] border-[#2A2F36] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-start">
                <Badge variant="outline" className={`${assessment.overallColor} border-current`}>
                  {assessment.overall}
                </Badge>
              </div>
              
              {assessment.positives.length > 0 && (
                <div>
                  <h4 className="text-bullish font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assessment.positives.map((positive, index) => (
                      <div key={index} className="bg-bullish/10 border border-bullish/20 rounded-lg px-3 py-1 text-card-foreground text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-bullish rounded-full"></div>
                        {positive}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {assessment.concerns.length > 0 && (
                <div>
                  <h4 className="text-bearish font-medium mb-2 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Areas of Concern
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assessment.concerns.map((concern, index) => (
                      <div key={index} className="bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-1 text-card-foreground text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-bearish rounded-full"></div>
                        {concern}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Overview Card */}
        <Card className="bg-gradient-to-b from-[#1E2227] to-[#181B20] border-[#2A2F36] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Size & Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1 text-[#94A3B8] text-sm mb-2 cursor-help w-full">
                    Market Cap
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The total value of all company shares. Larger = more established.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-[#E5E7EB] font-bold text-2xl mb-1">
                  {apiData?.keyMetrics?.marketCap || 'N/A'}
                </div>
                <div className="text-[#94A3B8] text-xs h-4 flex items-center justify-center">
                  Large Cap
                </div>
              </div>

              <div className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1 text-[#94A3B8] text-sm mb-2 cursor-help w-full">
                    P/E Ratio
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Price vs Earnings. Lower numbers often mean better value.</p>
                  </TooltipContent>
                </Tooltip>
                <div className={`font-bold text-2xl mb-1 ${peAssessment.color}`}>
                  {(apiData?.keyMetrics?.peRatio || 0).toFixed(1)}
                </div>
                <div className="h-4 flex items-center justify-center">
                  <Badge variant="outline" className={`text-xs ${peAssessment.color}`}>
                    {peAssessment.label}
                  </Badge>
                </div>
              </div>

              <div className="text-center">
                <div className="text-[#94A3B8] text-sm mb-2">Current Price</div>
                <div className="text-[#E5E7EB] font-bold text-2xl mb-1">
                  ${fundamentals.currentPrice?.toFixed(2)}
                </div>
                <div className="text-[#94A3B8] text-xs">&nbsp;</div>
              </div>

              <div className="text-center">
                <div className="text-[#94A3B8] text-sm mb-2">52-Week Range</div>
                <div className="text-[#E5E7EB] text-lg font-medium mb-1">
                  ${fundamentals.yearLow?.toFixed(2)} - ${fundamentals.yearHigh?.toFixed(2)}
                </div>
                <div className="text-[#94A3B8] text-xs">&nbsp;</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profitability Card */}
        <Card className="bg-gradient-to-b from-[#1E2227] to-[#181B20] border-[#2A2F36] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#34D399]" />
              Is This Company Making Money?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-2 cursor-help w-full">
                    Market Size
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Company's market capitalization - total value of all shares</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-foreground font-bold text-2xl mb-1">
                  {apiData?.keyMetrics?.marketCap || 'N/A'}
                </div>
                <div className="text-muted-foreground text-xs">
                  Large Cap
                </div>
              </div>

              <div className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-2 cursor-help w-full">
                    Value Rating
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>P/E Ratio - how expensive the stock is relative to earnings</p>
                  </TooltipContent>
                </Tooltip>
                <div className={`font-bold text-2xl mb-1 ${peAssessment.color}`}>
                  {fundamentals.peRatio?.toFixed(1)}
                </div>
                <div className="text-muted-foreground text-xs">
                  <Badge variant="outline" className={`text-xs ${peAssessment.color}`}>
                    {peAssessment.label}
                  </Badge>
                </div>
              </div>

              <div className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-2 cursor-help w-full">
                    Return on Equity
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How efficiently they use shareholder money to generate profit</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-bullish font-bold text-2xl mb-1">
                  {(apiData?.financialHealth?.roe || 0).toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-xs">
                  {(apiData?.financialHealth?.roe || 0) >= 20 ? 'Excellent' :
                   (apiData?.financialHealth?.roe || 0) >= 15 ? 'Good' :
                   (apiData?.financialHealth?.roe || 0) >= 10 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Card */}
        <Card className="bg-gradient-to-b from-[#1E2227] to-[#181B20] border-[#2A2F36] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Is The Company Growing?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-[#94A3B8] text-sm mb-2">Revenue Growth</div>
                <div className={`font-bold text-2xl ${getGrowthColor(fundamentalsData?.growth?.revenueGrowth || 0)}`}>
                  {(fundamentalsData?.growth?.revenueGrowth || 0) >= 0 ? '+' : ''}{(fundamentalsData?.growth?.revenueGrowth || 0).toFixed(1)}%
                </div>
                <div className="text-[#94A3B8] text-xs mt-1">Past 12 months</div>
              </div>

              <div className="text-center border-t border-[#2F343B] pt-4 md:border-t-0 md:pt-0">
                <div className="text-[#94A3B8] text-sm mb-2">Earnings Growth</div>
                <div className={`font-bold text-2xl ${getGrowthColor(fundamentalsData?.growth?.epsGrowth || 0)}`}>
                  {(fundamentalsData?.growth?.epsGrowth || 0) >= 0 ? '+' : ''}{(fundamentalsData?.growth?.epsGrowth || 0).toFixed(1)}%
                </div>
                <div className="text-[#94A3B8] text-xs mt-1">Past 12 months</div>
              </div>

              <div className="text-center border-t border-[#2F343B] pt-4 md:border-t-0 md:pt-0">
                <div className="text-[#94A3B8] text-sm mb-2">Stock Performance</div>
                <div className={`font-bold text-2xl ${getGrowthColor(stockData?.ytd?.growthPct || 0)}`}>
                  {(stockData?.ytd?.growthPct || 0) >= 0 ? '+' : ''}{(stockData?.ytd?.growthPct || 0).toFixed(1)}%
                </div>
                <div className="text-[#94A3B8] text-xs mt-1">Year to date</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beginner Tips */}
        <Card className="bg-muted/50 border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Info className="h-5 w-5 text-accent-amber" />
              Beginner Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-card-foreground text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-bullish rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Look for growing companies:</strong> Positive revenue and earnings growth usually indicates a healthy business.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Check financial health:</strong> Companies that can pay their bills (Current Ratio {'>'} 1) and have reasonable debt levels are safer investments.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-accent-amber rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Don't rely on one metric:</strong> Look at the complete picture - growth, profitability, and financial health together.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-accent-purple rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Compare with competitors:</strong> These numbers are more meaningful when compared to similar companies in the same industry.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}