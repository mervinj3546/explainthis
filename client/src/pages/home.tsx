import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChartLine, TrendingUp, Shield, Zap } from "lucide-react";

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
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Login
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
      <div className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need for Stock Analysis
            </h2>
            <p className="text-slate-300 text-lg">
              Comprehensive tools and insights to guide your investment decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Analysis</h3>
              <p className="text-slate-400">
                Get intelligent insights and price targets based on comprehensive market analysis 
                and machine learning algorithms.
              </p>
            </div>
            
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Risk Assessment</h3>
              <p className="text-slate-400">
                Understand potential risks and market sentiment from both retail and 
                professional investors before making decisions.
              </p>
            </div>
            
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-Time Data</h3>
              <p className="text-slate-400">
                Access up-to-date financial fundamentals, technical indicators, 
                and market news to stay informed.
              </p>
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