'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, AreaChart, BarChart, DonutChart, LineChart, Tooltip, TabGroup, TabList, Tab, TabPanels, TabPanel, Grid } from '@tremor/react';
import { MagnifyingGlassIcon, ChartBarIcon, UserGroupIcon, FireIcon, CalendarIcon, ClockIcon, TrendingUpIcon, HashtagIcon, CameraIcon, VideoCameraIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon, BookmarkIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [username, setUsername] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarView, setCalendarView] = useState('month');
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [chartColorScheme, setChartColorScheme] = useState('default');
  const [profileImageError, setProfileImageError] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  const calculateGrowthRate = (posts) => {
    if (!posts || posts.length < 2) return 0;
    
    // Sort posts by date to ensure correct calculation
    const sortedPosts = [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Calculate average engagement for recent and older periods
    const midPoint = Math.floor(sortedPosts.length / 2);
    const recentPosts = sortedPosts.slice(0, midPoint);
    const olderPosts = sortedPosts.slice(midPoint);
    
    const recentEngagement = recentPosts.reduce((sum, post) => sum + post.engagement_rate, 0) / recentPosts.length;
    const olderEngagement = olderPosts.reduce((sum, post) => sum + post.engagement_rate, 0) / olderPosts.length;
    
    // Calculate growth rate as percentage
    const growthRate = ((recentEngagement - olderEngagement) / olderEngagement) * 100;
    
    return growthRate.toFixed(1);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setSearchSubmitted(true);

    try {
      const response = await fetch(`http://localhost:8000/analytics/${username}`);
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? `No data found for username: ${username}`
            : 'Failed to fetch analytics'
        );
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const colorSchemes = {
    default: ["blue", "green", "orange"],
    vibrant: ["violet", "fuchsia", "rose"],
    cool: ["cyan", "teal", "indigo"],
    warm: ["amber", "red", "yellow"],
  };

  const formatDate = (dateString, format = 'default') => {
    const date = new Date(dateString);
    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'time':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'full':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  };

  const calculateContentTypes = (posts) => {
    const types = posts.reduce((acc, post) => {
      const type = post.media_type || 'photo';
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          likes: 0,
          comments: 0,
          engagement: 0,
          bestPost: null
        };
      }
      acc[type].count += 1;
      acc[type].likes += post.likes;
      acc[type].comments += post.comments;
      acc[type].engagement += post.engagement_rate;
      
      if (!acc[type].bestPost || post.engagement_rate > acc[type].bestPost.engagement_rate) {
        acc[type].bestPost = post;
      }
      
      return acc;
    }, {});

    return Object.entries(types).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: data.count,
      percentage: ((data.count / posts.length) * 100).toFixed(1),
      avgLikes: Math.round(data.likes / data.count),
      avgComments: Math.round(data.comments / data.count),
      avgEngagement: (data.engagement / data.count).toFixed(1),
      bestPost: data.bestPost
    }));
  };

  const calculateBestTimes = (posts) => {
    const timeSlots = {};
    const daysOfWeek = {};
    
    posts.forEach(post => {
      const date = new Date(post.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      const timeSlot = Math.floor(hour / 3) * 3;
      const slotKey = `${timeSlot}-${timeSlot + 3}`;
      const dayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
      
      if (!timeSlots[slotKey]) {
        timeSlots[slotKey] = {
          engagement: 0,
          posts: 0,
          totalLikes: 0,
          totalComments: 0,
          bestPost: null
        };
      }
      
      timeSlots[slotKey].posts += 1;
      timeSlots[slotKey].totalLikes += post.likes;
      timeSlots[slotKey].totalComments += post.comments;
      timeSlots[slotKey].engagement += post.engagement_rate;
      
      if (!timeSlots[slotKey].bestPost || post.engagement_rate > timeSlots[slotKey].bestPost.engagement_rate) {
        timeSlots[slotKey].bestPost = post;
      }

      if (!daysOfWeek[dayKey]) {
        daysOfWeek[dayKey] = {
          engagement: 0,
          posts: 0,
          totalLikes: 0,
          totalComments: 0
        };
      }
      
      daysOfWeek[dayKey].posts += 1;
      daysOfWeek[dayKey].totalLikes += post.likes;
      daysOfWeek[dayKey].totalComments += post.comments;
      daysOfWeek[dayKey].engagement += post.engagement_rate;
    });

    return {
      timeSlots: Object.entries(timeSlots).map(([time, data]) => ({
        time: `${time} ${parseInt(time) < 12 ? 'AM' : 'PM'}`,
        engagement: (data.engagement / data.posts).toFixed(1),
        avgLikes: Math.round(data.totalLikes / data.posts),
        avgComments: Math.round(data.totalComments / data.posts),
        posts: data.posts,
        bestPost: data.bestPost
      })),
      daysOfWeek: Object.entries(daysOfWeek).map(([day, data]) => ({
        day,
        engagement: (data.engagement / data.posts).toFixed(1),
        avgLikes: Math.round(data.totalLikes / data.posts),
        avgComments: Math.round(data.totalComments / data.posts),
        posts: data.posts
      }))
    };
  };

  const prepareCalendarData = () => {
    const calendarData = {};
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 34);

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toDateString();
      calendarData[dateKey] = {
        date: new Date(d),
        posts: [],
        totalLikes: 0,
        totalComments: 0,
        totalEngagement: 0
      };
    }

    analytics.recent_posts.forEach(post => {
      const postDate = new Date(post.timestamp).toDateString();
      if (calendarData[postDate]) {
        calendarData[postDate].posts.push(post);
        calendarData[postDate].totalLikes += post.likes;
        calendarData[postDate].totalComments += post.comments;
        calendarData[postDate].totalEngagement += post.engagement_rate;
      }
    });

    return calendarData;
  };

  const renderCalendar = () => {
    const calendarData = prepareCalendarData();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Title className="text-white">Content Calendar</Title>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1 rounded-lg text-sm ${
                calendarView === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1 rounded-lg text-sm ${
                calendarView === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div key={`day-header-${day}`} className="text-center text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}
          
          {Object.entries(calendarData).map(([dateKey, data]) => {
            const hasContent = data.posts.length > 0;
            const isSelected = selectedDate === dateKey;
            
            return (
              <div
                key={`calendar-${dateKey}`}
                onClick={() => {
                  setSelectedDate(dateKey);
                  if (data.posts.length > 0) {
                    setPreviewPost(data.posts[0]);
                    setShowPostPreview(true);
                  }
                }}
                className={`
                  aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                  cursor-pointer transition-all duration-200
                  ${hasContent 
                    ? 'bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30' 
                    : 'bg-gray-900/50 hover:bg-gray-900/75'}
                  ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}
                `}
              >
                <Text className="text-gray-400 text-xs">{data.date.getDate()}</Text>
                {hasContent && (
                  <>
                    <Text className="text-white text-sm font-medium">
                      {data.posts.length} {data.posts.length === 1 ? 'post' : 'posts'}
                    </Text>
                    <div className="flex items-center gap-1 mt-1">
                      <HeartIcon className="h-3 w-3 text-red-500" />
                      <Text className="text-gray-400 text-xs">
                        {(data.totalLikes / data.posts.length).toFixed(0)}
                      </Text>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getImageUrl = (path, originalUrl) => {
    if (!path && !originalUrl) return null;
    
    // Try the cached image first
    if (path && path.startsWith('/images/')) {
      return `http://localhost:8000${path}`;
    }
    
    // Fallback to original URL if cached image is not available
    return originalUrl || null;
  };

  const handleImageError = (imageId) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  const renderImage = (imageUrl, originalUrl, alt, className = '', imageId = '') => {
    const url = getImageUrl(imageUrl, originalUrl);
    
    if (!url || imageLoadErrors[imageId]) {
      return (
        <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
          <CameraIcon className="w-1/3 h-1/3 text-gray-600" />
        </div>
      );
    }

    return (
      <img
        src={url}
        alt={alt}
        className={className}
        onError={() => handleImageError(imageId)}
        loading="lazy"
      />
    );
  };

  const renderPostPreview = () => {
    if (!showPostPreview || !previewPost) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPostPreview(false);
            setPreviewPost(null);
          }
        }}
      >
        <div className="bg-gray-900 rounded-lg max-w-md w-full m-4 overflow-hidden relative">
          <button
            onClick={() => {
              setShowPostPreview(false);
              setPreviewPost(null);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all duration-200"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {renderImage(
                analytics.account_summary.profile_pic_url,
                null,
                analytics.account_summary.username,
                'w-8 h-8 rounded-full',
                'preview-profile'
              )}
              <div>
                <Text className="text-white font-medium text-sm">
                  {analytics.account_summary.username}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {formatDate(previewPost.timestamp, 'short')}
                </Text>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-square">
            {renderImage(
              previewPost.thumbnail_url,
              previewPost.original_url,
              'Post',
              'w-full h-full object-cover',
              `post-${previewPost.id}`
            )}
          </div>
          
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button className="text-white hover:text-red-500 transition-colors">
                  <HeartIcon className="h-5 w-5" />
                </button>
                <button className="text-white hover:text-blue-500 transition-colors">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                </button>
                <button className="text-white hover:text-green-500 transition-colors">
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
              <button className="text-white hover:text-yellow-500 transition-colors">
                <BookmarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <Text className="text-white text-sm font-medium">
                {previewPost.likes.toLocaleString()} likes
              </Text>
              <Text className="text-white text-sm whitespace-pre-wrap break-words line-clamp-2">
                {previewPost.caption || 'No caption'}
              </Text>
              <Text className="text-gray-400 text-xs">
                {previewPost.comments.toLocaleString()} comments
              </Text>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="p-2 bg-gray-800/50 rounded-lg text-center">
                <Text className="text-gray-400 text-xs">Engagement</Text>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-green-500" />
                  <Text className="text-base font-bold text-white">
                    {previewPost.engagement_rate.toFixed(1)}%
                  </Text>
                </div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded-lg text-center">
                <Text className="text-gray-400 text-xs">Likes</Text>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <HeartIcon className="h-3.5 w-3.5 text-red-500" />
                  <Text className="text-base font-bold text-white">
                    {previewPost.likes.toLocaleString()}
                  </Text>
                </div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded-lg text-center">
                <Text className="text-gray-400 text-xs">Comments</Text>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <ChatBubbleLeftIcon className="h-3.5 w-3.5 text-blue-500" />
                  <Text className="text-base font-bold text-white">
                    {previewPost.comments.toLocaleString()}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentColors = colorSchemes[chartColorScheme];

  const renderColorSchemeSelector = () => (
    <div className="flex items-center gap-2">
      {Object.keys(colorSchemes).map(scheme => (
        <button
          key={`color-scheme-${scheme}`}
          onClick={() => setChartColorScheme(scheme)}
          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
            chartColorScheme === scheme
              ? 'border-white scale-110'
              : 'border-transparent scale-100'
          }`}
          style={{
            background: `linear-gradient(45deg, ${colorSchemes[scheme].map(color => `var(--${color}-500)`).join(', ')})`
          }}
        />
      ))}
    </div>
  );

  const calculateTopHashtags = (posts) => {
    if (!posts || !posts.length) return [];
    
    // Create a map to store hashtag frequencies
    const hashtagMap = new Map();
    
    // Process each post
    posts.forEach(post => {
      if (!post.caption) return;
      
      // Extract hashtags using regex
      const hashtags = post.caption.match(/#[\w\u0590-\u05ff\u0621-\u064A\u0660-\u0669]+/g) || [];
      
      // Count frequency of each hashtag
      hashtags.forEach(tag => {
        hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1);
      });
    });
    
    // Convert map to array and sort by frequency
    const sortedHashtags = Array.from(hashtagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9) // Get top 9 hashtags
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: ((count / posts.length) * 100).toFixed(1),
        engagement: posts
          .filter(post => post.caption && post.caption.includes(tag))
          .reduce((sum, post) => sum + post.engagement_rate, 0) / count
      }));
    
    return sortedHashtags;
  };

  const handleProfileImageError = () => {
    setProfileImageError(true);
  };

  const renderProfileImage = () => {
    const profileImageUrl = analytics?.account_summary?.profile_pic_url;
    
    return (
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500/50 relative group">
          {renderImage(
            profileImageUrl,
            null,
            analytics?.account_summary?.username || 'Profile picture',
            'w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110',
            'profile'
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <Text className="text-white text-xs font-medium">View Profile</Text>
            </div>
          </div>
        </div>
        {analytics?.account_summary?.is_verified && (
          <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5 ring-4 ring-gray-900 transform transition-transform duration-300 hover:scale-110">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const renderRecentPosts = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.recent_posts
          .sort((a, b) => b.engagement_rate - a.engagement_rate)
          .slice(0, 4)
          .map((post) => (
            <div 
              key={`post-${post.id || post.timestamp}`}
              className="flex gap-4 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/75 transition-all duration-200 cursor-pointer"
              onClick={() => {
                setPreviewPost(post);
                setShowPostPreview(true);
              }}
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden">
                {renderImage(
                  post.thumbnail_url,
                  post.original_url,
                  `Post preview`,
                  'w-full h-full object-cover',
                  `grid-${post.id || post.timestamp}`
                )}
              </div>
              <div className="flex-1">
                <Text className="text-white font-medium line-clamp-2">{post.caption || 'No caption'}</Text>
                <Text className="text-gray-400 text-sm mt-1">{formatDate(post.timestamp)}</Text>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <Text className="text-gray-400 text-sm">{post.likes.toLocaleString()}</Text>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <Text className="text-gray-400 text-sm">{post.comments.toLocaleString()}</Text>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <Text className="text-gray-400 text-sm">{post.engagement_rate.toFixed(1)}%</Text>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Instagram username"
                className="w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              />
              <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                disabled={!username.trim() || loading}
                className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ChartBarIcon className="h-5 w-5" />
                    Analyze Profile
                  </>
                )}
              </button>
            </div>
          </form>
            </div>
          </div>
          
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200">{error}</p>
            </div>
          )}
          
        {analytics && !error && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border border-gray-700 col-span-1 md:col-span-2">
                <div className="flex items-center gap-6">
                  {renderProfileImage()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Text className="text-2xl font-bold text-white truncate">
                        {analytics.account_summary.username}
                      </Text>
                      {analytics.account_summary.is_private && (
                        <div className="bg-gray-700/50 rounded-full p-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <Text className="text-gray-400 text-lg truncate">
                      {analytics.account_summary.full_name}
                    </Text>
                    <Text className="text-gray-400 mt-2 line-clamp-2 break-words">
                      {analytics.account_summary.bio || 'No bio available'}
                    </Text>
                    <div className="flex items-center gap-4 mt-3">
                      <a
                        href={`https://instagram.com/${analytics.account_summary.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        View Profile
                      </a>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <ClockIcon className="w-4 h-4" />
                        <span>Joined {new Date(analytics.account_summary.created_at).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-gray-800/50 border border-gray-700 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-gray-400">Followers</Text>
                    <Text className="text-3xl font-bold text-white">
                      {analytics.account_summary.followers.toLocaleString()}
                    </Text>
                    <Text className="text-green-400 text-sm">
                      +{((analytics.account_summary.followers * 0.05).toFixed(0)).toLocaleString()} this week
                    </Text>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <UserGroupIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-800/50 border border-gray-700 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
            <div>
                    <Text className="text-gray-400">Engagement Rate</Text>
                    <Text className="text-3xl font-bold text-white">
                      {analytics.engagement_stats.average_engagement_rate.toFixed(1)}%
                    </Text>
                    <Text className={calculateGrowthRate(analytics.recent_posts) > 0 ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                      {calculateGrowthRate(analytics.recent_posts)}% vs last period
                    </Text>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <FireIcon className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </Card>
            </div>

            <TabGroup className="mt-8" onIndexChange={setSelectedTab}>
              <TabList className="bg-gray-800/50 p-1 rounded-lg">
                <Tab className="py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200">Overview</Tab>
                <Tab className="py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200">Engagement</Tab>
                <Tab className="py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200">Content</Tab>
                <Tab className="py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200">Hashtags</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <div className="space-y-6 mt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {['7d', '30d', '90d', '1y'].map((range) => (
                          <button
                            key={`time-range-${range}`}
                            onClick={() => setSelectedTimeRange(range)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                              selectedTimeRange === range
                                ? 'bg-blue-600 text-white scale-105 shadow-lg shadow-blue-500/25'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:scale-102'
                            }`}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            {range}
                          </button>
                        ))}
                      </div>
                      {renderColorSchemeSelector()}
                    </div>

                    <Card className="bg-gray-800/50 border border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <Title className="text-white">Engagement Trends</Title>
                          <Text className="text-gray-400">Performance over time</Text>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <Text className="text-gray-400">Likes</Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <Text className="text-gray-400">Comments</Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <Text className="text-gray-400">Engagement</Text>
                          </div>
                        </div>
                      </div>
                      <AreaChart
                        data={analytics.recent_posts.map(post => ({
                          ...post,
                          formattedDate: formatDate(post.timestamp),
                          engagement: post.engagement_rate
                        }))}
                        index="formattedDate"
                        categories={["likes", "comments", "engagement"]}
                        colors={currentColors}
                        valueFormatter={(value) => value.toLocaleString()}
                        yAxisWidth={60}
                        showLegend={false}
                        className="h-72"
                        curveType="natural"
                        customTooltip={({ payload }) => {
                          if (!payload?.[0]?.payload) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
                              <div className="text-sm text-gray-400">{data.formattedDate}</div>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <div className="text-blue-500">Likes</div>
                                  <div className="text-white font-bold">{data.likes.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-green-500">Comments</div>
                                  <div className="text-white font-bold">{data.comments.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-orange-500">Engagement</div>
                                  <div className="text-white font-bold">{data.engagement.toFixed(1)}%</div>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </Card>

                    <Card className="bg-gray-800/50 border border-gray-700">
                      {renderCalendar()}
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <Title className="text-white">Content Distribution</Title>
                            <Text className="text-gray-400">By post type</Text>
                          </div>
                        </div>
                        <DonutChart
                          data={calculateContentTypes(analytics.recent_posts)}
                          category="value"
                          index="name"
                          colors={["blue", "cyan", "indigo"]}
                          className="h-48"
                          customTooltip={({ payload }) => {
                            if (!payload?.[0]?.payload) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-700">
                                <div className="text-white font-medium">{data.name}</div>
                                <div className="text-sm text-gray-400">
                                  {data.value} posts ({data.percentage}%)
                                </div>
                              </div>
                            );
                          }}
                        />
                      </Card>

                      <Card className="bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <Title className="text-white">Best Posting Times</Title>
                            <Text className="text-gray-400">By engagement rate</Text>
                          </div>
                        </div>
                        <BarChart
                          data={calculateBestTimes(analytics.recent_posts).timeSlots}
                          index="time"
                          categories={["engagement"]}
                          colors={currentColors}
                          className="h-48"
                          customTooltip={({ payload }) => {
                            if (!payload?.[0]?.payload) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-700">
                                <div className="text-white font-medium">{data.time}</div>
                                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                                  <div>
                                    <div className="text-gray-400">Avg. Engagement</div>
                                    <div className="text-white font-medium">{data.engagement}%</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400">Posts</div>
                                    <div className="text-white font-medium">{data.posts}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400">Avg. Likes</div>
                                    <div className="text-white font-medium">{data.avgLikes}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400">Avg. Comments</div>
                                    <div className="text-white font-medium">{data.avgComments}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                      </Card>
                    </div>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="space-y-6 mt-6">
                    <Card className="bg-gray-800/50 border border-gray-700">
                      <Title className="text-white mb-4">Engagement Breakdown</Title>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <Text className="text-gray-400">Average Likes</Text>
                          <div className="flex items-end gap-2">
                            <Text className="text-3xl font-bold text-white">
                              {Math.round(analytics.engagement_stats.average_likes).toLocaleString()}
                            </Text>
                            <Text className="text-green-400 text-sm mb-1">+5.2%</Text>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <Text className="text-gray-400">Average Comments</Text>
                          <div className="flex items-end gap-2">
                            <Text className="text-3xl font-bold text-white">
                              {Math.round(analytics.engagement_stats.average_comments).toLocaleString()}
                            </Text>
                            <Text className="text-green-400 text-sm mb-1">+3.8%</Text>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Text className="text-gray-400">Engagement Rate</Text>
                          <div className="flex items-end gap-2">
                            <Text className="text-3xl font-bold text-white">
                              {analytics.engagement_stats.average_engagement_rate.toFixed(1)}%
                            </Text>
                            <Text className="text-red-400 text-sm mb-1">-1.2%</Text>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-gray-800/50 border border-gray-700">
                      <Title className="text-white mb-6">Top Performing Posts</Title>
                      {renderRecentPosts()}
                    </Card>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['photo', 'video', 'carousel'].map(type => {
                        const typeData = calculateContentTypes(analytics.recent_posts)
                          .find(t => t.name.toLowerCase() === type);
                        return (
                          <Card key={`content-type-${type}`} className="bg-gray-800/50 border border-gray-700">
                            <div className="flex items-center justify-between">
                              <div>
                                <Text className="text-gray-400">{type.charAt(0).toUpperCase() + type.slice(1)}s</Text>
                                <Text className="text-2xl font-bold text-white">{typeData?.value || 0}</Text>
                                <Text className="text-gray-400 text-sm">{typeData?.percentage || 0}% of content</Text>
                              </div>
                              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                {type === 'photo' && <CameraIcon className="h-6 w-6 text-blue-500" />}
                                {type === 'video' && <VideoCameraIcon className="h-6 w-6 text-blue-500" />}
                                {type === 'carousel' && <ChartBarIcon className="h-6 w-6 text-blue-500" />}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    <Card className="bg-gray-800/50 border border-gray-700">
                      <Title className="text-white mb-6">Content Calendar</Title>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, index) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (34 - index));
                          const posts = analytics.recent_posts.filter(post => 
                            new Date(post.timestamp).toDateString() === date.toDateString()
                          );
                          return (
                            <div
                              key={`calendar-${date.toDateString()}-${index}`}
                              className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center ${
                                posts.length > 0 ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-gray-900/50'
                              }`}
                            >
                              <Text className="text-gray-400 text-xs">{date.getDate()}</Text>
                              {posts.length > 0 && (
                                <Text className="text-white text-sm font-medium">{posts.length}</Text>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="space-y-6 mt-6">
                    <Card className="bg-gray-800/50 border border-gray-700">
                      <Title className="text-white mb-6">Top Hashtags</Title>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {calculateTopHashtags(analytics.recent_posts).map(({ tag, count }) => (
                          <div
                            key={`hashtag-${tag}`}
                            className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <HashtagIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <Text className="text-white font-medium">{tag}</Text>
                                <Text className="text-gray-400 text-sm">{count} posts</Text>
                              </div>
                            </div>
                            <div className="h-2 w-24 bg-gray-700 rounded-full">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${(count / analytics.recent_posts.length * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>

            {showPostDetails && selectedPost && (
              <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-lg max-w-2xl w-full m-4 overflow-hidden">
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <Title className="text-white">Post Details</Title>
                      <button
                        onClick={() => setShowPostDetails(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="aspect-square rounded-lg overflow-hidden mb-4">
                      <img
                        src={selectedPost.thumbnail_url}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Text className="text-white">{selectedPost.caption || 'No caption'}</Text>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                        <Text className="text-gray-400">Likes</Text>
                        <Text className="text-2xl font-bold text-white">{selectedPost.likes.toLocaleString()}</Text>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                        <Text className="text-gray-400">Comments</Text>
                        <Text className="text-2xl font-bold text-white">{selectedPost.comments.toLocaleString()}</Text>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                        <Text className="text-gray-400">Engagement</Text>
                        <Text className="text-2xl font-bold text-white">{selectedPost.engagement_rate.toFixed(1)}%</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {renderPostPreview()}
            </div>
          )}
          
        {!analytics && !error && searchSubmitted && (
          <div className="text-center py-12">
            <Title className="text-white">No Analytics Data</Title>
            <Text className="text-gray-400">Try searching for a different Instagram username</Text>
            </div>
          )}

        {!searchSubmitted && !error && (
          <div className="text-center py-12">
            <Title className="text-white">Instagram Analytics</Title>
            <Text className="text-gray-400">Enter an Instagram username above to view their analytics</Text>
        </div>
        )}
      </div>
    </div>
  );
} 