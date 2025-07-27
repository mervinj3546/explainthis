// Reddit JSON API integration for sentiment analysis
// Uses free Reddit JSON endpoints - no API key required

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  score: number;
  created_utc: number;
  num_comments: number;
  subreddit: string;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

export async function fetchRedditPosts(ticker: string): Promise<RedditPost[]> {
  const subreddits = [
    'stocks',
    'wallstreetbets', 
    'investing',
    'StockMarket',
    'SecurityAnalysis'
  ];

  let allPosts: RedditPost[] = [];

  for (const subreddit of subreddits) {
    try {
      // Search for ticker in each subreddit, get top posts from past week
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${ticker}&restrict_sr=1&sort=top&t=week&limit=10`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ExplainThis-StockAnalysis/1.0'
        }
      });

      if (!response.ok) {
        console.warn(`Failed to fetch from r/${subreddit}: ${response.status}`);
        continue;
      }

      const data: RedditResponse = await response.json();
      
      if (data?.data?.children) {
        const posts = data.data.children.map(child => ({
          ...child.data,
          subreddit
        }));
        
        allPosts = allPosts.concat(posts);
      }

      // Rate limiting - be respectful to Reddit
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.warn(`Error fetching from r/${subreddit}:`, error);
    }
  }

  // Remove duplicates and filter quality posts
  const uniquePosts = Array.from(
    new Map(allPosts.map(post => [post.title, post])).values()
  ).filter(post => 
    post.score > 5 && // Minimum upvotes
    post.title.toLowerCase().includes(ticker.toLowerCase()) && // Relevant to ticker
    post.title.length > 10 // Not just ticker symbol
  );

  return uniquePosts.slice(0, 25); // Limit to 25 most relevant posts
}

export async function fetchStockTwitsPosts(ticker: string): Promise<any[]> {
  try {
    const url = `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`StockTwits API failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    return data.messages?.slice(0, 20) || [];
    
  } catch (error) {
    console.warn('Error fetching StockTwits data:', error);
    return [];
  }
}
