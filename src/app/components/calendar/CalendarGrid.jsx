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

const CalendarGrid = () => {
  const [currentWeek, setCurrentWeek] = useState('Feb 11 - 17');
  const [scheduledPosts, setScheduledPosts] = useState([
    { 
      id: 1, 
      day: 'Mon', 
      time: '1:10 PM', 
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
    // This would open the post editor in a real app
    console.log('Opening post editor for post:', post);
  };

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <h2 className="text-lg font-medium flex items-center">
            <button 
              onClick={navigateToPreviousWeek}
              className="mr-2 p-2 rounded-full hover:bg-[var(--card)] transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            {currentWeek}
            <button 
              onClick={navigateToNextWeek}
              className="ml-2 p-2 rounded-full hover:bg-[var(--card)] transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </h2>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-[var(--border)]">
        {/* Header */}
        <div className="grid grid-cols-6 bg-[var(--card)]">
          <div className="p-4 border-r border-[var(--border)]"></div>
          {daysOfWeek.map((day) => (
            <div key={day} className="p-4 text-center font-medium border-r border-[var(--border)]">
              {day}
            </div>
          ))}
        </div>

        {/* Time slots */}
        {timeSlots.map((time) => (
          <div key={time} className="grid grid-cols-6 border-t border-[var(--border)]">
            <div className="p-4 border-r border-[var(--border)] flex items-start">
              <span className="text-sm text-[var(--muted)]">{time}</span>
            </div>
            
            {daysOfWeek.map((day) => {
              const postsForTimeSlot = getPostsByTimeAndDay(time, day);
              
              return (
                <div 
                  key={`${day}-${time}`} 
                  className="p-3 border-r border-[var(--border)] calendar-cell min-h-20"
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
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      case 'instagram': return '#E4405F';
      default: return '#6366f1';
    }
  };

  return (
    <div 
      className="flex items-center gap-2 p-1 mb-1 rounded-lg cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
      onClick={onClick}
    >
      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-glow" style={{ boxShadow: `0 0 8px ${getPlatformColor(post.profile.platform)}30` }}>
        <div className="absolute inset-0" style={{ backgroundColor: getPlatformColor(post.profile.platform) }}></div>
        
        {post.profile.avatar && (
          <Image 
            src={post.profile.avatar} 
            alt={post.profile.name} 
            width={32} 
            height={32}
            className="object-cover group-hover:scale-105 transition-transform"
            unoptimized={post.profile.avatar.startsWith('data:')}
          />
        )}
        
        {/* Platform icon in bottom right */}
        <div 
          className="absolute bottom-0 right-0 rounded-full w-3 h-3 flex items-center justify-center" 
          style={{ backgroundColor: getPlatformColor(post.profile.platform) }}
        >
          <PlatformIcon platform={post.profile.platform} className="w-2 h-2 text-white" />
        </div>
      </div>
      
      <span className="text-xs whitespace-nowrap text-[var(--muted)]">{post.time}</span>
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

export default CalendarGrid; 