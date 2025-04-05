'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { getPost, updatePost } from '@/lib/firebase';

// Fallback image for posts when they don't have an image
const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzY0NzQ4YiI+Tm8gaW1hZ2UgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

// Fallback avatar for users when they don't have an avatar
const fallbackAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjOTRhM2I4Ii8+PHRleHQgeD0iMjUiIHk9IjMwIiBmb250LXNpemU9IjIwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+PC9zdmc+';

const PostDetail = () => {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (params.id) {
      const unsubscribe = getPost(params.id, (data) => {
        console.log("Retrieved post data:", data);
        setPost(data);
        setLoading(false);
      });
      
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [params.id]);
  
  const handleLike = async () => {
    if (!post) return;
    
    const updatedPost = {
      ...post,
      likes: (post.likes || 0) + 1
    };
    
    try {
      await updatePost(post.id, updatedPost);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!post || !comment.trim()) return;
    
    const updatedPost = {
      ...post,
      comments: (post.comments || 0) + 1,
      commentsList: [...(post.commentsList || []), {
        id: Date.now(),
        text: comment,
        author: 'Daniel Hamilton',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjMDA3N0I1Ii8+PHRleHQgeD0iMjUiIHk9IjMyIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EPC90ZXh0Pjwvc3ZnPg==',
        timestamp: new Date().toISOString()
      }]
    };
    
    try {
      await updatePost(post.id, updatedPost);
      setComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    } catch (error) {
      return timestamp;
    }
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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Post Detail" />
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : !post ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-xl font-bold mb-2">Post not found</h2>
              <p className="text-[var(--muted)] mb-4">The post you're looking for doesn't exist.</p>
              <Link 
                href="/feed" 
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Back to Feed
              </Link>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)]">
                {/* Post Header */}
                <div className="p-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image 
                        src={post.author?.avatar || fallbackAvatar} 
                        alt={post.author?.name || 'User'} 
                        fill 
                        className="object-cover"
                        unoptimized={(post.author?.avatar || '').startsWith('data:')}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{post.author?.name || 'Anonymous'}</p>
                      <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                        <span>{formatDate(post.timestamp)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getPlatformColor(post.author?.platform) }}
                          ></div>
                          <span className="capitalize">{post.author?.platform}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Post Image */}
                <div className="relative aspect-video">
                  <Image 
                    src={post.image || fallbackImage} 
                    alt={post.title} 
                    fill 
                    className="object-cover"
                    unoptimized={post.image?.startsWith('data:') || !post.image}
                  />
                </div>
                
                {/* Post Content */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                  <p className="text-[var(--muted)] mb-4">{post.description}</p>
                  
                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-6">
                      {post.hashtags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-full"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Post Stats */}
                  <div className="flex items-center justify-between py-4 border-t border-b border-[var(--border)] mb-6">
                    <div className="flex items-center gap-6">
                      <button 
                        className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                        onClick={handleLike}
                      >
                        <HeartIcon className="w-5 h-5" />
                        <span>{post.likes || 0} likes</span>
                      </button>
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <CommentIcon className="w-5 h-5" />
                        <span>{post.comments || 0} comments</span>
                      </div>
                    </div>
                    <div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--background)]">
                        {post.status}
                      </div>
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Comments</h3>
                    
                    {/* Add Comment */}
                    <form onSubmit={handleCommentSubmit} className="mb-6">
                      <div className="flex items-start gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image 
                            src={fallbackAvatar} 
                            alt="Your Avatar" 
                            fill 
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px] resize-none"
                            placeholder="Add a comment..."
                          ></textarea>
                          <div className="flex justify-end mt-2">
                            <button 
                              type="submit" 
                              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!comment.trim()}
                            >
                              Post Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                    
                    {/* Comments List */}
                    <div className="space-y-6">
                      {post.commentsList && post.commentsList.length > 0 ? (
                        post.commentsList.map((comment, index) => (
                          <div key={comment.id || index} className="flex items-start gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                              <Image 
                                src={comment.avatar || fallbackAvatar} 
                                alt={comment.author || 'User'} 
                                fill 
                                className="object-cover"
                                unoptimized={(comment.avatar || '').startsWith('data:')}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="bg-[var(--background)] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">{comment.author}</p>
                                  <p className="text-xs text-[var(--muted)]">{formatDate(comment.timestamp)}</p>
                                </div>
                                <p>{comment.text}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-[var(--muted)]">
                          <p>No comments yet. Be the first to comment!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icons
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

export default PostDetail; 