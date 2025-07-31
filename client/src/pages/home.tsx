import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChartLine, TrendingUp, Shield, Zap, BarChart3, Brain, Users, Target, Globe, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <ChartLine className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Should I buy this stock</h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            <Link href="/pricing">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Pricing
              </Button>
            </Link>
            <Link href="/how-to-use">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                How to use this site
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                About us
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Login now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-8">
            Make Smarter Investment Decisions
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Get comprehensive stock analysis powered by AI, technical indicators, 
            and fundamental data to help you decide whether to buy any stock.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-6">
              Features that you will love
            </h2>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto">
              We have the largest collection of tools for all kinds of traders
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Know when to buy */}
            <div className="bg-black p-8 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Know when to buy</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Use technical analysis with EMA crossovers, MACD signals, and RSI indicators to know exactly when to buy, sell, or do nothing.
              </p>
              <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">AAPL Analysis</span>
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">STRONG BUY</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">EMA Alignment</span>
                    <span className="text-green-400">✓ Bullish (Strength: 5)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MACD Signal</span>
                    <span className="text-green-400">✓ Bullish Crossover</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RSI (47.2)</span>
                    <span className="text-green-400">✓ Healthy Momentum</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700">
                    <div className="text-blue-400 text-sm">Confidence: 87%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Sentiment Analysis */}
            <div className="bg-black p-8 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="h-14 w-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Comprehensive Sentiment Analysis</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Compare retail investors vs professionals across Reddit, StockTwits, and financial news with real-time AI analysis.
              </p>
              <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Retail Sentiment</span>
                    <span className="text-green-400 font-bold">73% Bullish</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '73%'}}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Professional Sentiment</span>
                    <span className="text-blue-400 font-bold">68% Bullish</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-700">
                  <div className="text-xs text-slate-400 mb-2">Live Sources:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">r/investing</span>
                      <span className="text-green-400">67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">StockTwits</span>
                      <span className="text-blue-400">64%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">r/stocks</span>
                      <span className="text-green-400">71%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Financial News</span>
                      <span className="text-yellow-400">69%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Investment Analysis */}
            <div className="bg-black p-8 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
              <div className="h-14 w-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Investment Analysis</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Comprehensive AI-powered investment thesis combining technical analysis, sentiment data, and fundamental insights.
              </p>
              <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">AI Recommendation</span>
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">BUY</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Investment Thesis</span>
                    <span className="text-green-400">✓ Strong Bullish</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Assessment</span>
                    <span className="text-yellow-400">⚠ Moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valuation</span>
                    <span className="text-blue-400">ℹ Fair Value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Outlook</span>
                    <span className="text-green-400">✓ Positive</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700">
                  <div className="text-slate-400 text-xs">AI combines 15+ data points for comprehensive analysis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Interactive Charts & Indicators */}
            <div className="bg-black p-8 rounded-xl border border-slate-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <div className="h-14 w-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Interactive Financial Charts</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                TradingView integration plus custom EMA, MACD, and RSI charts with 6 months of historical data.
              </p>
              <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="text-white font-semibold mb-3">Current Indicators</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">$178.42</div>
                    <div className="text-slate-500">EMA 8</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-bold">$175.83</div>
                    <div className="text-slate-500">EMA 21</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">$172.91</div>
                    <div className="text-slate-500">EMA 34</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">47.2</div>
                    <div className="text-slate-500">RSI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Stock Research */}
            <div className="bg-black p-8 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="h-14 w-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Complete Stock Research Hub</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Everything you need: fundamentals, news, AI analysis, technical signals, and sentiment - all in one dashboard.
              </p>
              <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="text-white font-semibold mb-3">Research Categories</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-300">Primary Details & News</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">AI Investment Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">Financial Fundamentals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-300">Technical Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-slate-300">Sentiment Comparison</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Investment Tracking */}
            <div className="bg-black p-8 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="h-14 w-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Personal Investment Tracker</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Save your favorite stocks to watchlist, track search history, and get personalized investment insights.
              </p>
              <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="text-white font-semibold mb-3">Your Portfolio Insights</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Watchlist Items</span>
                    <span className="text-white">12 stocks</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recent Searches</span>
                    <span className="text-white">8 tickers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Avg Sentiment</span>
                    <span className="text-green-400">68% Bullish</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Strong Buy Signals</span>
                    <span className="text-green-400">3 stocks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Better Investment Decisions?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join thousands of investors who use our platform to analyze stocks before buying.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
              Start Analyzing Stocks Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <ChartLine className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold">Should I buy this stock</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2025 Should I buy this stock. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}