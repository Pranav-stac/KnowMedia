'use client';

import { useState, useEffect } from 'react';
import { getProfiles, getPosts } from '@/lib/firebase';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalFollowers: 0,
    totalEngagement: 0,
    totalPosts: 0,
    platformStats: {},
    recentPosts: []
  });
  
  // Load data from Firebase
  useEffect(() => {
    const profilesUnsubscribe = getProfiles((data) => {
      if (data) {
        setProfiles(data);
      }
    });
    
    const postsUnsubscribe = getPosts((data) => {
      if (data) {
        setPosts(data);
      }
    });
    
    return () => {
      profilesUnsubscribe();
      postsUnsubscribe();
    };
  }, []);
  
  // Calculate analytics data whenever profiles or posts change
  useEffect(() => {
    // Mock data generation based on profiles and posts
    const platformStats = {};
    let totalFollowers = 0;
    let totalEngagement = 0;
    
    // Calculate platform stats
    profiles.forEach(profile => {
      const platform = profile.platform;
      if (!platformStats[platform]) {
        const followers = Math.floor(1000 + Math.random() * 9000); // Random follower count
        totalFollowers += followers;
        
        platformStats[platform] = {
          followers,
          posts: 0,
          engagement: 0,
          impressions: 0
        };
      }
    });
    
    // Calculate post stats
    posts.forEach(post => {
      const platform = post.author?.platform;
      if (platform && platformStats[platform]) {
        platformStats[platform].posts++;
        
        // Calculate engagement (likes + comments)
        const engagement = post.likes + post.comments;
        platformStats[platform].engagement += engagement;
        totalEngagement += engagement;
        
        // Generate random impressions between 100-1000
        const impressions = Math.floor(100 + Math.random() * 900);
        platformStats[platform].impressions += impressions;
      }
    });
    
    // Get recent posts (last 5)
    const recentPosts = [...posts]
      .sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);
    
    setAnalyticsData({
      totalFollowers,
      totalEngagement,
      totalPosts: posts.length,
      platformStats,
      recentPosts
    });
  }, [profiles, posts]);
  
  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number;
  };
  
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Followers" 
          value={formatNumber(analyticsData.totalFollowers)} 
          icon={<UsersIcon className="w-5 h-5" />} 
          trend="+12.5%"
          trendDirection="up"
        />
        <StatCard 
          title="Total Posts" 
          value={analyticsData.totalPosts} 
          icon={<DocumentIcon className="w-5 h-5" />} 
          trend="+5.2%"
          trendDirection="up"
        />
        <StatCard 
          title="Total Engagement" 
          value={formatNumber(analyticsData.totalEngagement)} 
          icon={<HeartIcon className="w-5 h-5" />} 
          trend="+18.7%"
          trendDirection="up"
        />
        <StatCard 
          title="Avg. Engagement Rate" 
          value={analyticsData.totalPosts > 0 ? ((analyticsData.totalEngagement / analyticsData.totalPosts) * 100).toFixed(1) + '%' : '0%'} 
          icon={<TrendingUpIcon className="w-5 h-5" />} 
          trend="+3.1%"
          trendDirection="up"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="bg-[var(--card)] rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Platform Performance</h3>
              <select className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm">
                <option value="30days">Last 30 Days</option>
                <option value="7days">Last 7 Days</option>
                <option value="24hours">Last 24 Hours</option>
              </select>
            </div>
            
            <div className="h-[300px] flex items-center justify-center">
              {/* This is where an actual chart would go */}
              <div className="text-center text-[var(--muted)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(analyticsData.platformStats).map(([platform, data]) => (
                    <div key={platform} className="bg-[var(--background)] p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon platform={platform} className="w-5 h-5 text-[var(--primary)]" />
                        <h4 className="font-medium capitalize">{platform}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[var(--muted)]">Followers</p>
                          <p className="font-bold">{formatNumber(data.followers)}</p>
                        </div>
                        <div>
                          <p className="text-[var(--muted)]">Posts</p>
                          <p className="font-bold">{data.posts}</p>
                        </div>
                        <div>
                          <p className="text-[var(--muted)]">Engagement</p>
                          <p className="font-bold">{formatNumber(data.engagement)}</p>
                        </div>
                        <div>
                          <p className="text-[var(--muted)]">Impressions</p>
                          <p className="font-bold">{formatNumber(data.impressions)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card)] rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Recent Posts</h3>
              <a href="/feed" className="text-[var(--primary)] text-sm hover:underline">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 font-medium">Post</th>
                    <th className="text-left py-3 font-medium">Platform</th>
                    <th className="text-left py-3 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Likes</th>
                    <th className="text-left py-3 font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.recentPosts.map((post, index) => (
                    <tr key={post.id || index} className="border-b border-[var(--border)]">
                      <td className="py-3 max-w-xs truncate">{post.title}</td>
                      <td className="py-3 capitalize">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={post.author?.platform} className="w-4 h-4" />
                          <span>{post.author?.platform}</span>
                        </div>
                      </td>
                      <td className="py-3">{post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3">{post.likes}</td>
                      <td className="py-3">{post.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-[var(--card)] rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold mb-4">Upcoming Schedule</h3>
            <div className="space-y-3">
              {posts.filter(post => post.status?.toLowerCase() === 'scheduled').slice(0, 3).map((post, index) => (
                <div key={post.id || index} className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <p className="text-xs text-[var(--muted)]">{post.scheduledFor || 'Upcoming'}</p>
                  </div>
                  <PlatformIcon platform={post.author?.platform} className="w-5 h-5 text-[var(--muted)]" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[var(--card)] rounded-xl p-4">
            <h3 className="text-lg font-bold mb-4">Top Performing Hashtags</h3>
            <div className="space-y-3">
              {/* Generate some mock hashtags based on post data */}
              {generateTopHashtags(posts).map((tag, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <HashtagIcon className="w-5 h-5 text-[var(--primary)]" />
                    <span className="font-medium">#{tag.name}</span>
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {tag.count} posts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate top hashtags from posts
const generateTopHashtags = (posts) => {
  const hashtags = {};
  
  posts.forEach(post => {
    if (post.hashtags && Array.isArray(post.hashtags)) {
      post.hashtags.forEach(tag => {
        // Remove # if it exists
        const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
        if (hashtags[cleanTag]) {
          hashtags[cleanTag]++;
        } else {
          hashtags[cleanTag] = 1;
        }
      });
    }
  });
  
  // Convert to array and sort by count
  return Object.entries(hashtags)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// Stat Card Component
const StatCard = ({ title, value, icon, trend, trendDirection }) => {
  return (
    <div className="bg-[var(--card)] rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="bg-[var(--primary)]/10 p-2 rounded-lg">
          {icon}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${trendDirection === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {trend}
        </div>
      </div>
      <h3 className="text-[var(--muted)] text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Icons
const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const HashtagIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const PlatformIcon = ({ platform, className }) => {
  switch (platform?.toLowerCase()) {
    case 'linkedin':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    default:
      return null;
  }
};

export default AnalyticsDashboard; 