import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { useTechnicalIndicators } from "@/hooks/use-technical-indicators";
import { TradingViewMiniWidget } from "./charts/TradingViewMiniWidget";
import { EMAChart } from "./charts/EMAChart";
import { MACDChart } from "./charts/MACDChart";
import { RSIChart } from "./charts/RSIChart";
import { TechnicalRecommendation } from "./TechnicalRecommendation";

interface TechnicalAnalysisDashboardProps {
  tickerSymbol: string;
}

export function TechnicalAnalysisDashboard({ tickerSymbol }: TechnicalAnalysisDashboardProps) {
  const { data: technicalData, isLoading, error } = useTechnicalIndicators(tickerSymbol);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gradient-to-b from-[#1E2227] to-[#181B20] border-[#2A2F36] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-[#2A2F36]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full bg-[#2A2F36]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-900/20 border-red-800">
        <AlertDescription className="text-red-300">
          Failed to load technical analysis: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Technical Analysis</h2>
        <div className="flex items-center text-[#94A3B8]">
          <BarChart3 className="h-5 w-5 mr-2" />
          <span className="text-sm">Last 6 months of data</span>
        </div>
      </div>

      {/* Technical Recommendation */}
      {technicalData && <TechnicalRecommendation data={technicalData} ticker={tickerSymbol} />}

      {/* TradingView Price Overview */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          <h3 className="text-lg font-semibold text-white">Price Overview</h3>
        </div>
        <TradingViewMiniWidget ticker={tickerSymbol} />
      </div>

      {/* Custom Charts */}
      {technicalData && (
        <div className="space-y-6">
          {/* EMA Chart */}
          <EMAChart data={technicalData} ticker={tickerSymbol} />

          {/* MACD and RSI Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MACDChart data={technicalData} ticker={tickerSymbol} />
            <RSIChart data={technicalData} ticker={tickerSymbol} />
          </div>
        </div>
      )}

      {/* Technical Indicators Summary */}
      {technicalData && technicalData.rsi && technicalData.rsi.length > 0 && (
        <Card className="bg-gradient-to-b from-[#1E2227] to-[#181B20] border-[#2A2F36] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Current Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {technicalData.ema8[technicalData.ema8.length - 1]?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-[#94A3B8]">EMA 8</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {technicalData.ema21[technicalData.ema21.length - 1]?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-[#94A3B8]">EMA 21</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {technicalData.ema34[technicalData.ema34.length - 1]?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-[#94A3B8]">EMA 34</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {technicalData.ema50[technicalData.ema50.length - 1]?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-[#94A3B8]">EMA 50</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {technicalData.rsi[technicalData.rsi.length - 1]?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-[#94A3B8]">RSI</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Warning - Bottom of Page */}
      <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
        <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Important Disclaimer</span>
        </div>
        <div className="text-amber-300 text-sm">
          This technical analysis is based on mathematical indicators and historical price data only. 
          It should not be considered as financial advice. Please consider fundamental analysis, 
          market conditions, economic factors, and your personal risk tolerance before making any investment decisions. 
          Past performance does not guarantee future results.
        </div>
      </div>
    </div>
  );
}
