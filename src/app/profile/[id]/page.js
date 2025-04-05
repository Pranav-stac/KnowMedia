'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import PostItem from '../../components/feed/PostItem';
import { getProfile, getPostsByProfile } from '@/lib/firebase';

// Fallback avatar for users when they don't have an avatar
const fallbackAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjOTRhM2I4Ii8+PHRleHQgeD0iMjUiIHk9IjMwIiBmb250LXNpemU9IjIwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+PC9zdmc+';

const ProfileView = () => {
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (params.id) {
      // Get profile information
      const profileUnsubscribe = getProfile(params.id, (data) => {
        setProfile(data);
        setLoading(false);
      });
      
      // Get posts for this profile
      const postsUnsubscribe = getPostsByProfile(params.id, (data) => {
        setPosts(data);
      });
      
      return () => {
        profileUnsubscribe();
        postsUnsubscribe();
      };
    }
  }, [params.id]);
  
  // Generate random stats for the profile
  const getProfileStats = () => {
    return {
      followers: 1000 + Math.floor(Math.random() * 9000),
      following: 100 + Math.floor(Math.random() * 900),
      posts: posts.length,
      engagement: Math.floor(Math.random() * 30) / 10
    };
  };
  
  const profileStats = getProfileStats();
  
  // Status indicator based on platform
  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      case 'instagram': return '#E4405F';
      case 'twitter': return '#1DA1F2';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Profile" />
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : !profile ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-xl font-bold mb-2">Profile not found</h2>
              <p className="text-[var(--muted)] mb-4">The profile you're looking for doesn't exist.</p>
              <Link 
                href="/feed" 
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Back to Feed
              </Link>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] mb-6">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="p-6 relative">
                  <div className="absolute -top-16 left-6 w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
                    <Image 
                      src={profile.avatar || fallbackAvatar} 
                      alt={profile.name} 
                      fill 
                      className="object-cover"
                      unoptimized={(profile.avatar || '').startsWith('data:')}
                    />
                    <div 
                      className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center" 
                      style={{ backgroundColor: getPlatformColor(profile.platform) }}
                    >
                      <PlatformIcon platform={profile.platform} className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="ml-28">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <p className="text-[var(--muted)] flex items-center">
                          <span className="capitalize mr-1">{profile.platform}</span>
                          <span>•</span>
                          <span className="ml-1">
                            {profileStats.followers.toLocaleString()} followers
                          </span>
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Profile Stats */}
                <div className="border-t border-[var(--border)] grid grid-cols-4 divide-x divide-[var(--border)]">
                  <div className="p-4 text-center">
                    <p className="text-2xl font-bold">{profileStats.posts}</p>
                    <p className="text-[var(--muted)] text-sm">Posts</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-2xl font-bold">{profileStats.followers.toLocaleString()}</p>
                    <p className="text-[var(--muted)] text-sm">Followers</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-2xl font-bold">{profileStats.following.toLocaleString()}</p>
                    <p className="text-[var(--muted)] text-sm">Following</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-2xl font-bold">{profileStats.engagement.toFixed(1)}%</p>
                    <p className="text-[var(--muted)] text-sm">Engagement Rate</p>
                  </div>
                </div>
              </div>
              
              {/* Content Tabs */}
              <div className="mb-6">
                <div className="border-b border-[var(--border)] flex">
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'posts' ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--muted)]'}`}
                    onClick={() => setActiveTab('posts')}
                  >
                    Posts
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'scheduled' ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--muted)]'}`}
                    onClick={() => setActiveTab('scheduled')}
                  >
                    Scheduled
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--muted)]'}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    Analytics
                  </button>
                </div>
              </div>
              
              {/* Content Based on Active Tab */}
              {activeTab === 'posts' && (
                <div>
                  {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {posts.map((post) => (
                        <PostItem key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[var(--card)] rounded-xl p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                      <p className="text-[var(--muted)] mb-4">Start creating content for this profile.</p>
                      <Link 
                        href="/post/create" 
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Create Post</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'scheduled' && (
                <div className="bg-[var(--card)] rounded-xl p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">Scheduled Posts</h3>
                  <p className="text-[var(--muted)] mb-4">You don't have any scheduled posts.</p>
                  <Link 
                    href="/calendar" 
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>Go to Calendar</span>
                  </Link>
                </div>
              )}
              
              {activeTab === 'analytics' && (
                <div className="bg-[var(--card)] rounded-xl p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">Profile Analytics</h3>
                  <p className="text-[var(--muted)] mb-4">View detailed analytics for this profile.</p>
                  <Link 
                    href="/analytics" 
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-2"
                  >
                    <ChartIcon className="w-4 h-4" />
                    <span>View Analytics</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icons
const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

export default ProfileView; 