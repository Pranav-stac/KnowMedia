'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, AreaChart, BarChart, DonutChart, LineChart, Tooltip, TabGroup, TabList, Tab, TabPanels, TabPanel, Grid } from '@tremor/react';
import { MagnifyingGlassIcon, ChartBarIcon, UserGroupIcon, FireIcon, CalendarIcon, ClockIcon, TrendingUpIcon, HashtagIcon, CameraIcon, VideoCameraIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon, BookmarkIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import EngagementReport from '../components/analytics/EngagementReport';
import DemographicsReport from '../components/analytics/DemographicsReport';

export default function AnalyticsPage() {
  const [selectedChannel, setSelectedChannel] = useState('instagram');
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

  const channels = [
    { id: 'instagram', name: 'Aniruddh', icon: '📸', username: 'pr4n4virl' },
    { id: 'twitter', name: 'Pranav Narkhede', icon: '🐦', username: 'pr4n4virl' },
    { id: 'linkedin', name: 'Daniel Hamilton', icon: '💼', username: 'pr4n4virl' }
  ];

  useEffect(() => {
    // Load data for default channel on mount
    fetchAnalytics('instagram');
  }, []);

  const fetchAnalytics = async (channelId) => {
    setLoading(true);
    setError(null);
    const channel = channels.find(c => c.id === channelId);
    
    try {
      // First try the API with proxy
      try {
        const response = await fetch(`/api/analytics/${channel.username}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Data:', data);
          setAnalytics(data);
          setSelectedChannel(channelId);
          return;
        }
      } catch (proxyError) {
        console.warn('Proxy API fetch failed:', proxyError);
      }

      // If proxy fails, try direct API with CORS mode
      try {
        const response = await fetch(`https://bluegill-workable-teal.ngrok-free.app/analytics/${channel.username}`, {
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          mode: 'cors'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Direct API Data:', data);
          setAnalytics(data);
          setSelectedChannel(channelId);
          return;
        }
      } catch (directError) {
        console.warn('Direct API fetch failed:', directError);
      }

      // If both API attempts fail, use fallback data
      console.log('Using fallback data');
      const fallbackData = {
        account_summary: {
          username: channel.username,
          full_name: channel.name,
          profile_pic_url: `https://api.dicebear.com/7.x/avatars/svg?seed=${channel.username}`,
          followers: channel.id === 'instagram' ? 1234 : channel.id === 'twitter' ? 892 : 567,
          following: channel.id === 'instagram' ? 567 : channel.id === 'twitter' ? 345 : 234,
          posts_count: channel.id === 'instagram' ? 89 : channel.id === 'twitter' ? 156 : 45,
          is_verified: true
        },
        recent_posts: Array(12).fill(null).map((_, i) => ({
          id: `post-${i}`,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          caption: `Sample ${channel.id} post ${i + 1} #social #media #analytics`,
          likes: Math.floor(Math.random() * (channel.id === 'instagram' ? 1000 : 500)),
          comments: Math.floor(Math.random() * (channel.id === 'instagram' ? 100 : 50)),
          engagement_rate: (Math.random() * (channel.id === 'instagram' ? 10 : 5)).toFixed(2),
          media_type: ['photo', 'video', 'carousel'][Math.floor(Math.random() * 3)],
          thumbnail_url: `https://picsum.photos/seed/${channel.username}-${i}/400/400`
        }))
      };

      setAnalytics(fallbackData);
      setSelectedChannel(channelId);
      setError('Using sample data for development - API connection failed');

    } catch (err) {
      console.error('Analytics Error:', err);
      setError('Unable to load analytics data. Please try again later.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowthRate = (posts) => {
    if (!posts || posts.length < 2) return 0;
    
    // Sort posts by date nirto ensure correct calculation
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
    if (!selectedChannel.trim()) return;

    setLoading(true);
    setError(null);
    setSearchSubmitted(true);

    try {
      const response = await fetch(`https://bluegill-workable-teal.ngrok-free.app/analytics/pr4n4virl`);
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? `No data found for channel: ${selectedChannel}`
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
      return `https://bluegill-workable-teal.ngrok-free.app${path}`;
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-[var(--foreground)]">Analytics Dashboard</h1>
        
        {/* Channel Selection */}
        <div className="flex gap-4 mb-6">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => fetchAnalytics(channel.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedChannel === channel.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--primary-hover)]'
              }`}
            >
              <span>{channel.icon}</span>
              <span>{channel.name}</span>
              <span className="text-sm opacity-75">@{channel.username}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {analytics && !loading && (
          <div className="space-y-6">
            {/* Account Summary Card */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src={analytics.account_summary.profile_pic_url} 
                    alt={analytics.account_summary.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <div>
                  <Title>{analytics.account_summary.full_name || analytics.account_summary.username}</Title>
                  <Text>@{analytics.account_summary.username}</Text>
                  <div className="flex gap-4 mt-2">
                    <Text><strong>{analytics.account_summary.followers}</strong> followers</Text>
                    <Text><strong>{analytics.account_summary.following}</strong> following</Text>
                    <Text><strong>{analytics.account_summary.posts_count}</strong> posts</Text>
                  </div>
                </div>
              </div>
            </Card>
            
            <TabGroup>
              <TabList className="flex space-x-1 rounded-xl bg-[var(--card)] p-1">
                <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 text-[var(--muted)] hover:bg-white/[0.12] hover:text-white ui-selected:bg-[var(--primary)] ui-selected:text-white ui-selected:shadow">
                  Overview
                </Tab>
                <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 text-[var(--muted)] hover:bg-white/[0.12] hover:text-white ui-selected:bg-[var(--primary)] ui-selected:text-white ui-selected:shadow">
                  Demographics
                </Tab>
                <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 text-[var(--muted)] hover:bg-white/[0.12] hover:text-white ui-selected:bg-[var(--primary)] ui-selected:text-white ui-selected:shadow">
                  Content
                </Tab>
              </TabList>
              <TabPanels className="mt-6">
                <TabPanel>
                  <EngagementReport platform={selectedChannel} />
                </TabPanel>
                <TabPanel>
                  <DemographicsReport platform={selectedChannel} />
                </TabPanel>
                <TabPanel>
                  <div className="space-y-6">
                    {/* Content Calendar */}
                    {renderCalendar()}
                    
                    {/* Content Types */}
                    <Card>
                      <Title>Content Performance</Title>
                      <div className="mt-4">
                        {analytics && analytics.recent_posts && (
                          <BarChart
                            data={calculateContentTypes(analytics.recent_posts)}
                            index="name"
                            categories={["value"]}
                            colors={colorSchemes[chartColorScheme]}
                            valueFormatter={(value) => `${value} posts`}
                            yAxisWidth={48}
                          />
                        )}
                      </div>
                    </Card>
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
        )}

        {!analytics && !loading && !error && (
          <div className="text-center py-12">
            <Title className="text-[var(--foreground)]">Select a Channel</Title>
            <Text className="text-[var(--muted)]">Choose a social media channel above to view analytics</Text>
          </div>
        )}
      </div>
    </div>
  );
} 