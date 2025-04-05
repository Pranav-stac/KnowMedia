'use client';

import { useState } from 'react';
import Image from 'next/image';
import { postToInstagram } from '@/lib/instagram';

// Inline fallback avatars to avoid import issues
const fallbackAvatars = {
  'daniel-linkedin': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMDA3N0I1Ii8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-facebook': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMTg3N0YyIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
  'daniel-instagram': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjRTQ0MDVGIi8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg=='
};

// Inline fallback images
const fallbackImages = {
  'desk-setup': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEyMTIxMiIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSI4MCIgcng9IjQiIGZpbGw9IiMyMjIiLz48cmVjdCB4PSI2MCIgeT0iMTQwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjI0MCIgY3k9IjgwIiByPSIyMCIgZmlsbD0iIzQ0NCIvPjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzU1NSIvPjxyZWN0IHg9IjEyMCIgeT0iNjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcng9IjQiIGZpbGw9IiM1NTUiLz48L3N2Zz4=',
  'phone-clock': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjMwMCIgcng9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyOTAiIHJ4PSIxNSIgZmlsbD0iIzExMSIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iMTUwIiByPSI1MCIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNDQ0IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNzUiIHkxPSIxNTAiIHgyPSI3NSIgeTI9IjExMCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjMiLz48bGluZSB4MT0iNzUiIHkxPSIxNTAiIHgyPSIxMDAiIHkyPSIxNTAiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHRleHQgeD0iNzUiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0Ij4yOjI0PC90ZXh0Pjwvc3ZnPg=='
};

const PostItem = ({ post, onEditClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  
  // Default post if none provided
  const defaultPost = {
    id: 1,
    title: 'Work Desk Setup',
    description: 'My productivity corner. Where inspiration meets focus.',
    image: fallbackImages['desk-setup'],
    likes: 128,
    comments: 32,
    timestamp: '2h ago',
    author: {
      name: 'Daniel Hamilton',
      avatar: fallbackAvatars['daniel-linkedin'],
      platform: 'linkedin'
    },
    hashtags: ['#WorkFromHome', '#ProductivityTips', '#DeskSetup'],
    status: 'Scheduled',
    scheduledFor: 'Today, 2:30 PM'
  };
  
  const postData = post || defaultPost;
  
  // Function to post directly to Instagram
  const handlePostNow = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!postData.image || !postData.platform || postData.platform !== 'instagram') {
      alert('This post cannot be posted to Instagram.');
      return;
    }
    
    try {
      setIsPosting(true);
      setPostStatus({ type: 'info', message: 'Posting to Instagram...' });
      
      const result = await postToInstagram(postData.image, postData.title || postData.description);
      
      setPostStatus({ 
        type: 'success', 
        message: 'Posted successfully!' 
      });
      
      // Reset status after a few seconds
      setTimeout(() => {
        setPostStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      setPostStatus({ 
        type: 'error', 
        message: `Failed to post: ${error.message}` 
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getPlatformColor = () => {
    switch(postData.platform) {
      case 'linkedin': return '#0077B5';
      case 'instagram': return '#E4405F';
      default: return '#6366f1';
    }
  };
  
  return (
    <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
      {/* Post Image */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image 
          src={postData.image} 
          alt={postData.title}
          width={400}
          height={400}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          unoptimized={postData.image.startsWith('data:')}
        />
        
        {/* Overlay with status */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full overflow-hidden relative">
                <Image 
                  src={postData.author.avatar} 
                  alt={postData.author.name}
                  width={24}
                  height={24}
                  className="object-cover"
                  unoptimized={postData.author.avatar.startsWith('data:')}
                />
              </div>
              <span className="text-white text-sm font-medium">{postData.author.name}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/80 text-white font-medium">
                {postData.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* Menu options */}
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1 rounded-full bg-[var(--card)]/80 hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <DotsIcon className="w-5 h-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg py-1 w-32">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.(postData);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--accent)]/10 flex items-center gap-2"
              >
                <EditIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              {postData.platform === 'instagram' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostNow(e);
                    setIsMenuOpen(false);
                  }}
                  disabled={isPosting}
                  className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 ${
                    isPosting ? 'text-[#E4405F]/50 cursor-not-allowed' : 'text-[#E4405F] hover:bg-[#E4405F]/10'
                  }`}
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>{isPosting ? 'Posting...' : 'Post Now'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Post Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{postData.title}</h3>
        <p className="text-[var(--muted)] text-sm mb-3 line-clamp-2">{postData.description}</p>
        
        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {postData.hashtags.map((tag, index) => (
            <span key={index} className="text-xs text-[var(--primary)] hover:underline cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-[var(--muted)] text-sm">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <HeartIcon className="w-4 h-4" />
              {postData.likes}
            </span>
            <span className="flex items-center gap-1">
              <CommentIcon className="w-4 h-4" />
              {postData.comments}
            </span>
          </div>
          <span>{postData.scheduledFor}</span>
        </div>
        
        {/* Post status message */}
        {postStatus && (
          <div className={`mt-2 p-2 rounded text-sm ${
            postStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
            postStatus.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400' : 
            'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
          }`}>
            {postStatus.message}
          </div>
        )}
      </div>
    </div>
  );
};

// Icons
const DotsIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 16.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm0-6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm0-6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5z" />
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z" />
  </svg>
);

const CommentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875V5.25c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375z" />
    <path d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 0 1 1.06 0l1.72 1.72 1.72-1.72a.75.75 0 1 1 1.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 1 1-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 1 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" />
  </svg>
);

export default PostItem; 