import { useState } from 'react';
import { generateText } from '../../../lib/ai';

const AIInsights = ({ posts = [], platform = 'all' }) => {
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Filter posts by platform if specified
      const filteredPosts = platform === 'all' 
        ? posts 
        : posts.filter(post => post.profile?.platform === platform);
      
      if (!filteredPosts || filteredPosts.length === 0) {
        setError('No posts available to analyze. Please add some posts first.');
        setIsLoading(false);
        return;
      }
      
      // Extract relevant data for analysis
      const postData = filteredPosts.map(post => ({
        description: post.description,
        platform: post.profile?.platform,
        engagement: post.stats?.likes + post.stats?.comments + post.stats?.shares,
        likes: post.stats?.likes,
        comments: post.stats?.comments,
        shares: post.stats?.shares,
        date: post.date
      }));
      
      // Determine top performing posts (by engagement)
      const topPosts = [...postData]
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 3);
      
      // Create platform-specific insight prompt
      let platformLabel = platform === 'all' ? 'social media' : platform;
      
      const prompt = `
        Analyze these ${platformLabel} posts and provide insights.
        
        Post Data: ${JSON.stringify(postData)}
        
        Top Performing Posts: ${JSON.stringify(topPosts)}
        
        Generate insights covering:
        1. Content themes and patterns that are performing well
        2. Best posting times based on engagement
        3. Recommendations for future content to improve performance
        4. Key metrics summary
        
        Format the response with clear headings and bullet points.
      `;
      
      // Generate insights
      const generatedInsights = await generateText(prompt);
      
      if (!generatedInsights || generatedInsights.trim() === '') {
        throw new Error('No insights were generated');
      }
      
      setInsights(generatedInsights);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(`Failed to generate insights: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium
            ${isLoading 
              ? 'bg-[var(--border)] text-[var(--muted)]' 
              : 'bg-[var(--primary)] text-white hover:bg-opacity-90'
            }
            transition-colors
          `}
        >
          {isLoading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {insights ? (
        <div className="prose dark:prose-invert max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: insights.replace(/\n/g, '<br />') 
            }} 
          />
        </div>
      ) : !error && (
        <div className="text-[var(--muted)] text-center py-8">
          Click "Generate Insights" to analyze your content performance and get AI-powered recommendations.
        </div>
      )}
    </div>
  );
};

// AI icon
const AIIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

// Larger AI icon for empty state
const AILargeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export default AIInsights; 