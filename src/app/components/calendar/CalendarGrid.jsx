'use client';

import { useState } from 'react';
import Image from 'next/image';

// Inline fallback avatars to avoid import issues
const fallbackAvatars = {
  'daniel-linkedin': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMDA3N0I1Ii8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-facebook': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMTg3N0YyIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-instagram': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjRTQ0MDVGIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg=='
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeSlots = ['1 PM', '2 PM', '3 PM', '4 PM'];

const CalendarGrid = ({ onPostClick, onPostNow }) => {
  const [currentWeek, setCurrentWeek] = useState('Feb 11 - 17');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [postStatus, setPostStatus] = useState(null);
  const [scheduledPosts, setScheduledPosts] = useState([
    { 
      id: 1, 
      day: 'Mon', 
      time: '1:10 PM', 
      title: 'LinkedIn Marketing Strategy',
      description: 'Our marketing strategy for Q2 focuses on increasing engagement through thought leadership content.',
      profile: { 
        name: 'Daniel Hamilton', 
        platform: 'linkedin',
        avatar: fallbackAvatars['daniel-linkedin']
      } 
    },
    { 
      id: 2, 
      day: 'Tue', 
      time: '1:40 PM', 
      title: 'Product Launch Announcement',
      description: 'Excited to announce our new product launch! Join us for a live demo next week.',
      profile: { 
        name: 'Daniel Hamilton', 
        platform: 'linkedin',
        avatar: fallbackAvatars['daniel-linkedin']
      } 
    },
    { 
      id: 3, 
      day: 'Wed', 
      time: '1:15 PM', 
      title: 'Customer Spotlight: ABC Corp',
      description: 'Learn how ABC Corp increased their productivity by 200% using our platform.',
      profile: { 
        name: 'Daniel Hamilton', 
        platform: 'facebook',
        avatar: fallbackAvatars['daniel-facebook']
      } 
    },
    { 
      id: 4, 
      day: 'Tue', 
      time: '2:40 PM', 
      title: 'Industry Trends Report',
      description: 'Our latest research reveals the top 5 trends shaping the industry in 2023.',
      profile: { 
        name: 'Daniel Hamilton', 
        platform: 'linkedin',
        avatar: fallbackAvatars['daniel-linkedin']
      } 
    },
    { 
      id: 5, 
      day: 'Wed', 
      time: '3:00 PM', 
      title: 'Team Building Activities',
      description: 'Check out our favorite team building activities that boost productivity and morale!',
      profile: { 
        name: 'Daniel Hamilton', 
        platform: 'facebook',
        avatar: fallbackAvatars['daniel-facebook']
      } 
    },
    { 
      id: 6, 
      day: 'Tue', 
      time: '3:15 PM', 
      title: 'Behind the Scenes',
      description: 'Take a peek behind the scenes of our latest photoshoot! #BehindTheScenes',
      profile: { 
        name: 'HamiltonDan', 
        platform: 'instagram',
        avatar: fallbackAvatars['daniel-instagram']
      } 
    },
    { 
      id: 7, 
      day: 'Thu', 
      time: '2:20 PM', 
      title: 'Networking Event Invitation',
      description: 'Join us for our monthly networking event this Friday at 6pm.',
      profile: { 
        name: 'Daniel Hamilton', 
        platform: 'linkedin',
        avatar: fallbackAvatars['daniel-linkedin']
      } 
    }
  ]);

  const getPostsByTimeAndDay = (time, day) => {
    return scheduledPosts.filter(post => {
      const postHour = parseInt(post.time.split(':')[0]);
      const currentHour = parseInt(time.split(' ')[0]);
      
      if (selectedPlatform && post.profile.platform !== selectedPlatform) {
        return false;
      }
      
      return post.day === day && postHour === currentHour;
    });
  };

  const navigateToPreviousWeek = () => {
    // In a real app, this would calculate the previous week
    setCurrentWeek('Feb 4 - 10');
  };

  const navigateToNextWeek = () => {
    // In a real app, this would calculate the next week
    setCurrentWeek('Feb 18 - 24');
  };

  const handlePostClick = (post) => {
    // Call the parent component's handler
    if (onPostClick) {
      onPostClick(post);
    }
  };

  // Handler for posting individual posts
  const handlePostNow = (post, e) => {
    e.stopPropagation(); // Prevent opening post editor
    
    if (onPostNow) {
      setPostingId(post.id);
      setIsPosting(true);
      
      // Call the parent component's handler and track the result
      onPostNow(post)
        .then(() => {
          // Success already handled by parent
        })
        .catch((error) => {
          // Error already handled by parent
        })
        .finally(() => {
          setTimeout(() => {
            setIsPosting(false);
            setPostingId(null);
          }, 3000);
        });
    }
  };
  
  // Handler for posting all Instagram posts
  const handlePostAllSequential = (e) => {
    e.preventDefault();
    
    // Get only Instagram posts
    const instagramPosts = scheduledPosts.filter(post => 
      post.profile && 
      post.profile.platform === 'instagram'
    );
    
    if (instagramPosts.length === 0) {
      alert('No Instagram posts found to post.');
      return;
    }
    
    // Call the parent's handler for posting all posts
    if (onPostNow) {
      setIsPosting(true);
      setPostStatus({ type: 'info', message: 'Starting sequential posting...' });
      
      // The actual sequential posting logic is in the parent component
      onPostNow(instagramPosts, true)
        .then(() => {
          // Success will be handled by the parent component
        })
        .catch((error) => {
          // Error will be handled by the parent component
        });
    }
  };

  // Calculate some summary statistics
  const totalPostsThisWeek = scheduledPosts.length;
  const totalLinkedInPosts = scheduledPosts.filter(post => post.profile.platform === 'linkedin').length;
  const totalFacebookPosts = scheduledPosts.filter(post => post.profile.platform === 'facebook').length;
  const totalInstagramPosts = scheduledPosts.filter(post => post.profile.platform === 'instagram').length;
  
  // Count posts by day for visualization
  const postsByDay = {
    'Mon': scheduledPosts.filter(post => post.day === 'Mon').length,
    'Tue': scheduledPosts.filter(post => post.day === 'Tue').length,
    'Wed': scheduledPosts.filter(post => post.day === 'Wed').length,
    'Thu': scheduledPosts.filter(post => post.day === 'Thu').length,
    'Fri': scheduledPosts.filter(post => post.day === 'Fri').length,
  };
  
  // Get the max number of posts in a day to scale the visualization
  const maxPostsInDay = Math.max(...Object.values(postsByDay));

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <div className="flex gap-2">
          {/* Add Post All button for Instagram */}
          {selectedPlatform === 'instagram' && (
            <button
              onClick={handlePostAllSequential}
              disabled={isPosting}
              className={`py-2 px-4 rounded-lg text-white flex items-center gap-2 ${
                isPosting ? 'bg-[#E4405F]/50 cursor-not-allowed' : 'bg-[#E4405F] hover:bg-[#d13752]'
              }`}
            >
              {isPosting ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 animate-spin">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Posting All...</span>
                </>
              ) : (
                <>
                  <PlatformIcon platform="instagram" className="w-4 h-4" />
                  <span>Post All Now</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => onPostClick?.(null)} // Pass null to create new post
            className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>
      
      {/* Global status message */}
      {postStatus && (
        <div className={`mb-4 p-3 rounded-lg ${
          postStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
          postStatus.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400' : 
          'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
        }`}>
          <div className="flex items-center gap-2">
            {postStatus.type === 'info' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {postStatus.type === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {postStatus.type === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{postStatus.message}</span>
          </div>
        </div>
      )}

      {/* Calendar Header Section */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
        <div className="relative">
            <h2 className="text-xl font-medium flex items-center">
            <button 
              onClick={navigateToPreviousWeek}
                className="mr-2 p-2 rounded-full hover:bg-[var(--background)] transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
              <span className="text-[var(--primary)]">{currentWeek}</span>
            <button 
              onClick={navigateToNextWeek}
                className="ml-2 p-2 rounded-full hover:bg-[var(--background)] transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </h2>
          </div>
          
          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs ${!selectedPlatform ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
              onClick={() => setSelectedPlatform(null)}
            >
              <span>All</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs ${selectedPlatform === 'linkedin' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
              onClick={() => setSelectedPlatform('linkedin')}
            >
              <PlatformIcon platform="linkedin" className="w-3 h-3 mr-1" />
              <span>LinkedIn</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs ${selectedPlatform === 'facebook' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
              onClick={() => setSelectedPlatform('facebook')}
            >
              <PlatformIcon platform="facebook" className="w-3 h-3 mr-1" />
              <span>Facebook</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs ${selectedPlatform === 'instagram' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
              onClick={() => setSelectedPlatform('instagram')}
            >
              <PlatformIcon platform="instagram" className="w-3 h-3 mr-1" />
              <span>Instagram</span>
            </button>
          </div>
        </div>
        
        {/* Weekly Statistics */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="bg-[var(--background)] rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-1">Total Posts</h3>
            <p className="text-2xl font-bold text-[var(--primary)]">{totalPostsThisWeek}</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-1">LinkedIn</h3>
            <p className="text-2xl font-bold" style={{ color: '#0077B5' }}>{totalLinkedInPosts}</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-1">Facebook</h3>
            <p className="text-2xl font-bold" style={{ color: '#1877F2' }}>{totalFacebookPosts}</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-1">Instagram</h3>
            <p className="text-2xl font-bold" style={{ color: '#E4405F' }}>{totalInstagramPosts}</p>
          </div>
          
          {/* Posts by Day Visualization */}
          <div className="bg-[var(--background)] rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2">Post Distribution</h3>
            <div className="flex items-end justify-between h-8">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex flex-col items-center">
                  <div 
                    className="w-5 bg-[var(--primary)] rounded-t transition-all duration-200"
                    style={{ 
                      height: `${(postsByDay[day] / maxPostsInDay) * 100}%`,
                      opacity: 0.7 + ((postsByDay[day] / maxPostsInDay) * 0.3)
                    }}
                  ></div>
                  <span className="text-xs mt-1">{day[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-6 border-b border-[var(--border)]">
          <div className="px-4 py-3 border-r border-[var(--border)]"></div>
          {daysOfWeek.map((day) => (
            <div key={day} className="px-4 py-3 text-center font-medium border-r border-[var(--border)]">
              {day}
            </div>
          ))}
        </div>

        {/* Time slots */}
        {timeSlots.map((time) => (
          <div key={time} className="grid grid-cols-6 border-t border-[var(--border)] hover:bg-[var(--background)]/30 transition-colors">
            <div className="p-4 border-r border-[var(--border)] flex items-start">
              <span className="text-sm font-medium">{time}</span>
            </div>
            
            {daysOfWeek.map((day) => {
              const postsForTimeSlot = getPostsByTimeAndDay(time, day);
              
              return (
                <div 
                  key={`${day}-${time}`} 
                  className="p-3 border-r border-[var(--border)] calendar-cell min-h-24 transition-colors"
                >
                  {postsForTimeSlot.map((post) => (
                    <ScheduledPost 
                      key={post.id} 
                      post={post} 
                      onClick={() => handlePostClick(post)} 
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const ScheduledPost = ({ post, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      case 'instagram': return '#E4405F';
      default: return '#6366f1';
    }
  };

  // Mock data (in a real app, these would come from the post object)
  const postTitle = post.title || "Scheduled Post";
  const postContent = post.description || "This is a placeholder for the content of your scheduled post. Click to edit.";

  // Handle posting directly
  const handlePostNow = (e) => {
    e.stopPropagation(); // Prevent the click from propagating to the parent
    
    if (post.profile.platform === 'instagram') {
      setIsPosting(true);
      
      // In a real app, you would integrate with the Instagram API
      setTimeout(() => {
        // Simulate success
        setIsPosting(false);
      }, 2000);
    }
  };

  return (
    <div 
      className="relative rounded-lg cursor-pointer group transition-all duration-200"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main card - always visible */}
      <div 
        className="p-2 rounded-lg transition-all duration-200"
        style={{ 
          backgroundColor: `${getPlatformColor(post.profile.platform)}10`,
          borderLeft: `3px solid ${getPlatformColor(post.profile.platform)}` 
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 shadow-glow" 
            style={{ boxShadow: `0 0 8px ${getPlatformColor(post.profile.platform)}30` }}>
            <div className="absolute inset-0" style={{ backgroundColor: getPlatformColor(post.profile.platform) }}></div>
            
            {post.profile.avatar && (
              <Image 
                src={post.profile.avatar} 
                alt={post.profile.name} 
                width={24} 
                height={24}
                className="object-cover group-hover:scale-105 transition-transform"
                unoptimized={post.profile.avatar.startsWith('data:')}
              />
            )}
            
            <div 
              className="absolute bottom-0 right-0 rounded-full w-2 h-2 flex items-center justify-center" 
              style={{ backgroundColor: getPlatformColor(post.profile.platform) }}
            >
              <PlatformIcon platform={post.profile.platform} className="w-1.5 h-1.5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{postTitle}</div>
            <div className="text-xs text-[var(--muted)] flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              {post.time}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded hover card with more details */}
      {isHovered && (
        <div className="absolute top-0 left-0 z-10 w-56 bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)] p-3 transform -translate-y-1/2 transition-opacity duration-200 opacity-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-glow" 
              style={{ boxShadow: `0 0 8px ${getPlatformColor(post.profile.platform)}30` }}>
        <div className="absolute inset-0" style={{ backgroundColor: getPlatformColor(post.profile.platform) }}></div>
        
        {post.profile.avatar && (
          <Image 
            src={post.profile.avatar} 
            alt={post.profile.name} 
            width={32} 
            height={32}
                  className="object-cover"
            unoptimized={post.profile.avatar.startsWith('data:')}
          />
        )}
        
        <div 
          className="absolute bottom-0 right-0 rounded-full w-3 h-3 flex items-center justify-center" 
          style={{ backgroundColor: getPlatformColor(post.profile.platform) }}
        >
          <PlatformIcon platform={post.profile.platform} className="w-2 h-2 text-white" />
        </div>
      </div>
            <div>
              <div className="font-medium text-sm">{post.profile.name}</div>
              <div className="text-xs text-[var(--muted)] capitalize">{post.profile.platform}</div>
            </div>
          </div>
          
          <div className="mb-2">
            <h4 className="font-bold text-sm">{postTitle}</h4>
            <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1">{postContent}</p>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center text-[var(--muted)]">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {post.day}
            </div>
            <div className="flex items-center text-[var(--muted)]">
              <ClockIcon className="w-3 h-3 mr-1" />
              {post.time}
            </div>
          </div>
          
          <div className="flex gap-1 mt-2">
            <button className="bg-[var(--background)] text-xs rounded px-2 py-1 hover:bg-[var(--border)] transition-colors flex items-center">
              <EditIcon className="w-3 h-3 mr-1" />
              Edit
            </button>
            
            {/* Add Post Now button for Instagram */}
            {post.profile.platform === 'instagram' && (
              <button 
                className={`text-xs rounded px-2 py-1 flex items-center ${
                  isPosting 
                    ? 'bg-[#E4405F]/50 text-white/70 cursor-not-allowed' 
                    : 'bg-[#E4405F] text-white hover:bg-[#d13752]'
                }`}
                onClick={handlePostNow}
                disabled={isPosting}
              >
                {isPosting ? 'Posting...' : 'Post Now'}
              </button>
            )}
            
            <button className="bg-[var(--background)] text-xs rounded px-2 py-1 hover:bg-[var(--border)] transition-colors flex items-center">
              <ShareIcon className="w-3 h-3 mr-1" />
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Icons
const ChevronLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PlatformIcon = ({ platform, className }) => {
  switch (platform) {
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
    default:
      return null;
  }
};

const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

export default CalendarGrid; 