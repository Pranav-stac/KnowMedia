import { useState } from 'react';
import { generateText } from '@/lib/ai';

const AIInsights = ({ posts, platform = 'all' }) => {
  const [insights, setInsights] = useState(null);
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
      setInsights(generatedInsights);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">AI Content Insights</h2>
        
        <button
          onClick={generateInsights}
          disabled={isLoading || posts.length === 0}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <AIIcon className="w-5 h-5" />
          <span>{isLoading ? 'Analyzing...' : 'Generate Insights'}</span>
        </button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : insights ? (
        <div className="prose prose-sm dark:prose-invert max-w-full">
          <div className="whitespace-pre-line">{insights}</div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AILargeIcon className="w-16 h-16 text-[var(--muted)] mb-4" />
          <p className="text-[var(--muted)] mb-2">No insights generated yet</p>
          <p className="text-[var(--muted-foreground)] text-sm max-w-md">
            Click the "Generate Insights" button to analyze your content and get AI-powered recommendations.
          </p>
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