// Subreddit-specific sentiment analysis with 6-hour caching
import { analyzeSentimentAdvanced } from './sentimentAnalysis';
import { XMLParser } from 'fast-xml-parser';

export interface SubredditSentiment {
  subreddit: string;
  displayName: string;
  score: number;
  sentiment: string;
  confidence: number;
  postsAnalyzed: number;
  characteristics: string[];
  posts: Array<{
    title: string;
    score: number;
    sentiment: number;
  }>;
}

export interface StockTwitsSentiment {
  platform: string;
  displayName: string;
  score: number;
  sentiment: string;
  confidence: number;
  postsAnalyzed: number;
  characteristics: string[];
  posts: Array<{
    title: string;
    score: number;
    sentiment: number;
  }>;
}

export interface EnhancedSentimentData {
  overall: {
    score: number;
    sentiment: string;
    confidence: number;
    postsAnalyzed: number;
  };
  subreddits: SubredditSentiment[];
  stocktwits: StockTwitsSentiment | null;
  insights: string[];
  noDataFound: boolean;
}

// Cache for subreddit sentiment data (6 hours)
const subredditSentimentCache = new Map<string, {
  data: EnhancedSentimentData;
  timestamp: number;
  expiresAt: number;
}>();

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Initialize XML parser
const xmlParser = new XMLParser();

// Reddit RSS cache for individual posts (30 minutes)
const redditRssCache = new Map<string, {
  data: any[];
  timestamp: number;
  expiresAt: number;
}>();

const RSS_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds (more aggressive caching)

// Reddit post interface for RSS parsing
interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  ups: number;
  permalink: string;
  subreddit: string;
  created_utc: number;
}

// Fetch Reddit RSS feed for a subreddit and ticker
async function fetchRedditRss(subreddit: string, ticker: string): Promise<RedditPost[]> {
  const cacheKey = `${subreddit}_${ticker}`;
  const cachedData = redditRssCache.get(cacheKey);
  const now = Date.now();

  // Return cached data if available and not expired
  if (cachedData && now < cachedData.expiresAt) {
    const minutesOld = Math.floor((now - cachedData.timestamp) / (1000 * 60));
    console.log(`📊 RSS Cache HIT for r/${subreddit} ${ticker} (age: ${minutesOld} minutes)`);
    return cachedData.data;
  }

  try {
    console.log(`🔍 Fetching RSS for r/${subreddit} searching "${ticker}"...`);
    
    // Fetch RSS feed
    const rssUrl = `https://www.reddit.com/r/${subreddit}/search.rss?q=${ticker}&restrict_sr=1&sort=new&limit=5`;
    const rssResponse = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'ExplainThis-StockAnalysis/1.0 by Creepy-Buy1588'
      }
    });

    if (!rssResponse.ok) {
      console.log(`❌ Failed to fetch RSS from r/${subreddit}: ${rssResponse.status}`);
      return [];
    }

    const rssText = await rssResponse.text();
    const rssData = xmlParser.parse(rssText);
    
    // Handle both RSS and Atom feed formats
    let items = [];
    
    // Check for Atom feed format first (Reddit uses this)
    if (rssData?.feed?.entry) {
      items = Array.isArray(rssData.feed.entry) ? rssData.feed.entry : [rssData.feed.entry];
      console.log(`📊 Found ${items.length} posts in Atom feed for r/${subreddit}`);
    }
    // Fallback to RSS format
    else if (rssData?.rss?.channel?.item) {
      items = Array.isArray(rssData.rss.channel.item) ? rssData.rss.channel.item : [rssData.rss.channel.item];
      console.log(`📊 Found ${items.length} posts in RSS feed for r/${subreddit}`);
    }
    
    if (items.length === 0) {
      console.log(`✅ No posts found in r/${subreddit} feed for ${ticker}`);
      return [];
    }

    // Extract post IDs and fetch details for top 10 posts
    const posts: RedditPost[] = [];
    const limitedItems = items.slice(0, 10);

    for (const item of limitedItems) {
      try {
        // Handle both Atom and RSS formats
        let postId = '';
        let itemTitle = '';
        let itemLink = '';
        
        // Atom feed format (Reddit's format)
        if (item.id && typeof item.id === 'string') {
          // Atom feed: id is usually like "t3_1mdckz0"
          postId = item.id.replace('t3_', '');
          itemTitle = item.title || '';
          itemLink = item.link?.href || item.link || '';
        }
        // RSS format fallback
        else if (item.link) {
          // Extract post ID from link (format: https://www.reddit.com/r/subreddit/comments/postid/title/)
          const linkMatch = item.link.match(/\/comments\/([a-z0-9]+)\//);
          if (linkMatch) {
            postId = linkMatch[1];
            itemTitle = item.title || '';
            itemLink = item.link;
          }
        }
        
        if (!postId) {
          console.log(`⚠️ Could not extract post ID from item`);
          continue;
        }
        
        // Fetch detailed post data
        console.log(`🔍 Fetching details for post ${postId}...`);
        const detailUrl = `https://www.reddit.com/comments/${postId}.json`;
        const detailResponse = await fetch(detailUrl, {
          headers: {
            'User-Agent': 'ExplainThis-StockAnalysis/1.0 by Creepy-Buy1588'
          }
        });

        if (!detailResponse.ok) {
          console.log(`❌ Failed to fetch post details for ${postId}: ${detailResponse.status}`);
          continue;
        }

        const detailData = await detailResponse.json();
        const postData = detailData[0]?.data?.children?.[0]?.data;

        if (postData) {
          posts.push({
            id: postData.id,
            title: postData.title || itemTitle || '',
            selftext: postData.selftext || '',
            ups: postData.ups || 0,
            permalink: postData.permalink || itemLink || '',
            subreddit: postData.subreddit || subreddit,
            created_utc: postData.created_utc || 0
          });
          console.log(`✅ Successfully fetched details for post: "${(postData.title || itemTitle).substring(0, 50)}..."`);
        } else {
          // If detailed fetch fails, use RSS/Atom data
          posts.push({
            id: postId,
            title: itemTitle,
            selftext: '',
            ups: 1, // Default since we don't have upvote data from RSS
            permalink: itemLink,
            subreddit: subreddit,
            created_utc: Math.floor(Date.now() / 1000)
          });
          console.log(`✅ Using RSS data for post: "${itemTitle.substring(0, 50)}..."`);
        }

        // Rate limiting - be very respectful to Reddit (increased delays)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between post detail requests
        
      } catch (error) {
        console.error(`Error fetching post details:`, error);
      }
    }

    // Cache the results
    const expiresAt = now + RSS_CACHE_DURATION;
    redditRssCache.set(cacheKey, {
      data: posts,
      timestamp: now,
      expiresAt
    });

    console.log(`💾 Cached ${posts.length} Reddit posts for r/${subreddit} ${ticker} (expires in 2 hours)`);
    return posts;

  } catch (error) {
    console.error(`Error fetching Reddit RSS for r/${subreddit}:`, error);
    return [];
  }
}

// Subreddit configurations with characteristics
const SUBREDDIT_CONFIG = {
  'wallstreetbets': {
    displayName: 'r/WallStreetBets',
    characteristics: ['High Risk', 'YOLO Plays', 'Momentum Trading', 'Options Heavy']
  },
  'investing': {
    displayName: 'r/investing',
    characteristics: ['Long Term', 'Fundamentals', 'Diversified', 'Risk Aware']
  },
  'stocks': {
    displayName: 'r/stocks',
    characteristics: ['General Discussion', 'DD Posts', 'News Focus', 'Balanced Views']
  },
  'StockMarket': {
    displayName: 'r/StockMarket',
    characteristics: ['Market Analysis', 'Technical Focus', 'News Driven', 'Broad Coverage']
  },
  'SecurityAnalysis': {
    displayName: 'r/SecurityAnalysis',
    characteristics: ['Deep Analysis', 'Value Focus', 'Research Heavy', 'Academic']
  },
  'ValueInvesting': {
    displayName: 'r/ValueInvesting',
    characteristics: ['Value Focus', 'Warren Buffett Style', 'Long Term Hold', 'Fundamental Analysis']
  }
};

export async function analyzeSubredditSentiments(ticker: string): Promise<EnhancedSentimentData> {
  const cacheKey = `${ticker.toUpperCase()}_subreddits`;
  const cachedData = subredditSentimentCache.get(cacheKey);
  const now = Date.now();

  // Return cached data if available and not expired
  if (cachedData && now < cachedData.expiresAt) {
    const minutesOld = Math.floor((now - cachedData.timestamp) / (1000 * 60));
    console.log(`📊 Cache HIT for subreddit sentiment ${ticker} (age: ${minutesOld} minutes)`);
    return cachedData.data;
  }

  console.log(`🔍 Analyzing subreddit sentiments for ${ticker}...`);

  const subreddits = ['wallstreetbets', 'investing', 'stocks', 'StockMarket', 'SecurityAnalysis', 'ValueInvesting'];
  const results: SubredditSentiment[] = [];

  // Analyze each subreddit using RSS feeds
  for (const subreddit of subreddits) {
    try {
      console.log(`🔍 Fetching RSS data for r/${subreddit} searching "${ticker}"...`);
      
      // Fetch posts using RSS
      const posts = await fetchRedditRss(subreddit, ticker);
      
      if (posts.length > 0) {
        console.log(`✅ Found ${posts.length} posts in r/${subreddit} via RSS`);
        
        // Analyze sentiment for each post
        const sentiments = posts.map((post) => ({
          title: post.title,
          text: post.selftext || post.title,
          score: post.ups,
          source: 'reddit'
        }));

        // Analyze sentiment for the combined text
        const combinedText = sentiments.map((s) => s.text).join(' ');
        const overallSentiment = analyzeSentimentAdvanced(combinedText);
        const config = SUBREDDIT_CONFIG[subreddit as keyof typeof SUBREDDIT_CONFIG];

        // Convert score to sentiment string
        const sentimentString = overallSentiment.score >= 60 ? 'Bullish' : 
                               overallSentiment.score >= 55 ? 'Slightly Bullish' : 
                               overallSentiment.score >= 45 ? 'Neutral' : 
                               overallSentiment.score >= 40 ? 'Slightly Bearish' : 'Bearish';

        results.push({
          subreddit,
          displayName: config.displayName,
          score: overallSentiment.score,
          sentiment: sentimentString,
          confidence: overallSentiment.confidence,
          postsAnalyzed: posts.length,
          characteristics: config.characteristics,
          posts: posts.slice(0, 3).map((post) => ({
            title: post.title,
            score: post.ups,
            sentiment: overallSentiment.score
          }))
        });
      } else {
        console.log(`✅ Found 0 posts in r/${subreddit} via RSS`);
      }

      // Rate limiting between subreddits - be very respectful to Reddit
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between subreddit requests
      
    } catch (error) {
      console.error(`Error analyzing r/${subreddit} via RSS:`, error);
    }
  }

  // Analyze StockTwits sentiment
  let stocktwitsData: StockTwitsSentiment | null = null;
  try {
    console.log(`🔍 Analyzing StockTwits for ${ticker}...`);
    
    const stocktwitsUrl = `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`;
    const stocktwitsResponse = await fetch(stocktwitsUrl);
    
    if (stocktwitsResponse.ok) {
      const stocktwitsJson = await stocktwitsResponse.json();
      
      if (stocktwitsJson.messages && stocktwitsJson.messages.length > 0) {
        const messages = stocktwitsJson.messages.slice(0, 20);
        console.log(`✅ Found ${messages.length} StockTwits messages`);
        
        const sentiments = messages.map((message: any) => ({
          title: message.body,
          text: message.body,
          score: 1,
          source: 'stocktwits'
        }));

        const combinedText = sentiments.map((s: any) => s.text).join(' ');
        const overallSentiment = analyzeSentimentAdvanced(combinedText);

        // Convert score to sentiment string
        const sentimentString = overallSentiment.score >= 60 ? 'Bullish' : 
                               overallSentiment.score >= 55 ? 'Slightly Bullish' : 
                               overallSentiment.score >= 45 ? 'Neutral' : 
                               overallSentiment.score >= 40 ? 'Slightly Bearish' : 'Bearish';

        stocktwitsData = {
          platform: 'stocktwits',
          displayName: 'StockTwits',
          score: overallSentiment.score,
          sentiment: sentimentString,
          confidence: overallSentiment.confidence,
          postsAnalyzed: messages.length,
          characteristics: ['Real-time Chat', 'Trader Focus', 'Quick Takes', 'Market Pulse'],
          posts: messages.slice(0, 3).map((message: any) => ({
            title: message.body.substring(0, 100) + (message.body.length > 100 ? '...' : ''),
            score: 1,
            sentiment: overallSentiment.score
          }))
        };
      } else {
        console.log(`✅ Found 0 StockTwits messages`);
      }
    } else {
      console.log(`❌ Failed to fetch StockTwits data: ${stocktwitsResponse.status}`);
    }
  } catch (error) {
    console.error(`Error analyzing StockTwits:`, error);
  }

  // Calculate overall sentiment
  const allScores = results.map(r => r.score);
  if (stocktwitsData) {
    allScores.push(stocktwitsData.score);
  }
  
  // No mock data - only show real Reddit communities with actual mentions
  
  const overallScore = allScores.length > 0 
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 50;

  const overallSentiment = overallScore >= 60 ? 'Bullish' : 
                          overallScore >= 55 ? 'Slightly Bullish' : 
                          overallScore >= 45 ? 'Neutral' : 
                          overallScore >= 40 ? 'Slightly Bearish' : 'Bearish';

  // Calculate total posts analyzed
  const totalPostsAnalyzed = results.reduce((sum, r) => sum + r.postsAnalyzed, 0) + 
                            (stocktwitsData ? stocktwitsData.postsAnalyzed : 0);

  // Generate insights with information about searched communities
  const searchedSubreddits = ['wallstreetbets', 'investing', 'stocks', 'StockMarket', 'SecurityAnalysis', 'ValueInvesting'];
  const insights = [];
  
  if (results.length === 0 && !stocktwitsData) {
    insights.push(`No mentions found across ${searchedSubreddits.length} popular stock subreddits`);
    insights.push(`Searched: ${searchedSubreddits.map(s => `r/${s}`).join(', ')}`);
  } else {
    if (results.length > 0) {
      const foundSubreddits = results.map(r => r.subreddit);
      insights.push(`Found discussions in ${results.length}/${searchedSubreddits.length} Reddit communities`);
      insights.push(`Active in: ${foundSubreddits.map(s => `r/${s}`).join(', ')}`);
      
      // Mention which ones had no mentions if some were missing
      const missingSubreddits = searchedSubreddits.filter(s => !foundSubreddits.includes(s));
      if (missingSubreddits.length > 0 && missingSubreddits.length < searchedSubreddits.length) {
        insights.push(`No mentions in: ${missingSubreddits.map(s => `r/${s}`).join(', ')}`);
      }
    }
    if (stocktwitsData) {
      insights.push(`StockTwits sentiment: ${stocktwitsData.sentiment}`);
    }
    if (overallScore >= 70) {
      insights.push('Strong bullish sentiment detected across social platforms');
    } else if (overallScore <= 30) {
      insights.push('Bearish sentiment detected across social platforms');
    }
  }

  const enhancedData: EnhancedSentimentData = {
    overall: {
      score: overallScore,
      sentiment: overallSentiment,
      confidence: Math.min(90, Math.max(50, (results.length + (stocktwitsData ? 1 : 0)) * 15)),
      postsAnalyzed: totalPostsAnalyzed
    },
    subreddits: results,
    stocktwits: stocktwitsData,
    insights: insights,
    noDataFound: results.length === 0  // True if no Reddit communities have mentions
  };

  // Cache the results
  const expiresAt = now + CACHE_DURATION;
  subredditSentimentCache.set(cacheKey, {
    data: enhancedData,
    timestamp: now,
    expiresAt
  });

  console.log(`💾 Cached subreddit sentiment for ${ticker} (expires in 6 hours)`);
  console.log(`✅ Subreddit sentiment analysis complete for ${ticker}: ${overallScore}% across ${results.length} communities${stocktwitsData ? ' + StockTwits' : ''}`);

  return enhancedData;
}

// Cache management functions
export function getSubredditSentimentCacheStats() {
  const now = Date.now();
  const entries = Array.from(subredditSentimentCache.entries());
  
  return {
    totalEntries: entries.length,
    validEntries: entries.filter(([_, value]) => now < value.expiresAt).length,
    expiredEntries: entries.filter(([_, value]) => now >= value.expiresAt).length,
    cacheSize: JSON.stringify(Array.from(subredditSentimentCache.entries())).length
  };
}

export function cleanupSubredditSentimentCache() {
  const now = Date.now();
  let removedCount = 0;
  
  subredditSentimentCache.forEach((value, key) => {
    if (now >= value.expiresAt) {
      subredditSentimentCache.delete(key);
      removedCount++;
    }
  });
  
  console.log(`🧹 Cleaned up ${removedCount} expired subreddit sentiment cache entries`);
  return removedCount;
}

// Auto cleanup every hour
setInterval(cleanupSubredditSentimentCache, 60 * 60 * 1000);
