'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Fallback image for posts when they don't have an image
const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzY0NzQ4YiI+Tm8gaW1hZ2UgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

// Fallback avatar for users when they don't have an avatar
const fallbackAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjOTRhM2I4Ii8+PHRleHQgeD0iMjUiIHk9IjMwIiBmb250LXNpemU9IjIwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+PC9zdmc+';

const PostItem = ({ post, layout = 'grid', onLike, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) onLike();
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete();
    setIsDropdownOpen(false);
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    // Check if timestamp is a string ISO date
    if (typeof timestamp === 'string' && timestamp.includes('T')) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return date.toLocaleDateString();
    }
    
    // Otherwise, return the timestamp as is (for backward compatibility)
    return timestamp;
  };
  
  // Get platform color
  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      case 'instagram': return '#E4405F';
      case 'twitter': return '#1DA1F2';
      default: return '#94a3b8';
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Link href={`/post/${post.id}`}>
      <div className={`bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer relative ${layout === 'list' ? 'flex' : ''}`}>
        {/* Post Image */}
        <div className={`relative ${layout === 'list' ? 'w-48 h-full' : 'aspect-video'}`}>
          <Image 
            src={post.image || fallbackImage} 
            alt={post.title || 'Post image'} 
            fill 
            className="object-cover"
            unoptimized={post.image?.startsWith('data:') || !post.image}
          />
          
          {/* Platform indicator */}
          {post.author?.platform && (
            <div 
              className="absolute bottom-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white" 
              style={{ backgroundColor: getPlatformColor(post.author.platform) }}
            >
              <PlatformIcon platform={post.author.platform} className="w-3 h-3" />
            </div>
          )}
          
          {/* Status badge */}
          {post.status && (
            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-white text-xs ${getStatusColor(post.status)}`}>
              {typeof post.status === 'string' ? post.status.charAt(0).toUpperCase() + post.status.slice(1).toLowerCase() : post.status}
            </div>
          )}
        </div>
        
        {/* Post Content */}
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image 
                  src={post.author?.avatar || fallbackAvatar} 
                  alt={post.author?.name || 'User'} 
                  fill 
                  className="object-cover"
                  unoptimized={(post.author?.avatar || '').startsWith('data:')}
                />
              </div>
              <p className="text-xs text-[var(--muted)]">{post.author?.name || 'Anonymous'}</p>
              <span className="text-xs text-[var(--muted)]">•</span>
              <p className="text-xs text-[var(--muted)]">{formatDate(post.timestamp)}</p>
            </div>
            
            {/* Dropdown Menu */}
            <div className="relative">
              <button 
                className="p-1 rounded-full hover:bg-[var(--background)] transition-colors"
                onClick={handleDropdownToggle}
              >
                <MoreIcon className="w-4 h-4 text-[var(--muted)]" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] z-10">
                  <div className="p-1">
                    <button 
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--background)] transition-colors text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsDropdownOpen(false);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--background)] transition-colors text-sm"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{post.title}</h3>
          <p className="text-sm text-[var(--muted)] mb-3 line-clamp-2">{post.description}</p>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.hashtags.map((tag, index) => (
                <span 
                  key={index} 
                  className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
          
          {/* Post Actions */}
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
              onClick={handleLike}
            >
              <HeartIcon className="w-4 h-4" />
              <span className="text-xs">{post.likes || 0}</span>
            </button>
            
            <button className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
              <CommentIcon className="w-4 h-4" />
              <span className="text-xs">{post.comments || 0}</span>
            </button>
            
            <button className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Icon components
const HeartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const MoreIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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

export default PostItem; 