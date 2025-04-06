'use client';

import { useState } from 'react';
import CalendarGrid from '../components/calendar/CalendarGrid';
import PostCreator from '../components/post/PostCreator';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { postToInstagram, postStoryToInstagram } from '@/lib/instagram';

const FeedPage = () => {
  const [activeView, setActiveView] = useState('calendar'); // 'calendar' or 'create'
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postingStatus, setPostingStatus] = useState(null);
  // Sample highlights for demo purposes
  const [sampleHighlights] = useState([
    { id: 1, name: 'Travel', image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzNiODJmNiIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=' },
    { id: 2, name: 'Food', image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwNTk0MiIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=' }
  ]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setActiveView('create');
  };
  
  // Handle posting a single post now
  const handlePostNow = async (post) => {
    if (!post || !post.image || !post.profile || post.profile.platform !== 'instagram') {
      alert('Cannot post: You need an image and an Instagram profile.');
      return Promise.reject(new Error('Invalid post for Instagram'));
    }
    
    setIsPosting(true);
    setPostingStatus({ type: 'info', message: 'Posting to Instagram...' });
    
    try {
      await postToInstagram(post.image, post.title || post.description);
      
      setPostingStatus({ 
        type: 'success', 
        message: 'Posted successfully to Instagram!' 
      });
      
      // Reset status after a few seconds
      setTimeout(() => {
        setPostingStatus(null);
      }, 3000);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      setPostingStatus({ 
        type: 'error', 
        message: `Failed to post: ${error.message}` 
      });
      return Promise.reject(error);
    } finally {
      setIsPosting(false);
    }
  };
  
  // Handle posting all posts in sequence
  const handlePostAllSequential = async (posts, isSequence = false) => {
    if (!isSequence) {
      // If not explicitly a sequence call, treat as a single post
      return handlePostNow(posts);
    }
    
    // Filter for posts with images 
    const postsToPublish = posts.filter(post => post.image);
    
    if (postsToPublish.length === 0) {
      alert('No Instagram posts with images found to post.');
      return Promise.reject(new Error('No valid posts'));
    }
    
    // Confirm with the user
    if (!confirm(`Are you sure you want to post all ${postsToPublish.length} Instagram posts now?`)) {
      return Promise.reject(new Error('User cancelled'));
    }
    
    setIsPosting(true);
    setPostingStatus({ 
      type: 'info', 
      message: `Starting to post ${postsToPublish.length} posts to Instagram...` 
    });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < postsToPublish.length; i++) {
      const post = postsToPublish[i];
      
      setPostingStatus({ 
        type: 'info', 
        message: `Posting ${i+1}/${postsToPublish.length}: "${post.title || 'Untitled'}"` 
      });
      
      try {
        // Post to Instagram
        await postToInstagram(post.image, post.title || post.description);
        
        // Update success count
        successCount++;
        
        // Update progress message
        setPostingStatus({ 
          type: 'info', 
          message: `Posted ${i+1}/${postsToPublish.length}: "${post.title || 'Untitled'}" successfully. (${successCount} succeeded, ${failCount} failed)` 
        });
        
        // Short pause between posts
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error posting post ${i+1}:`, error);
        
        // Update fail count
        failCount++;
        
        // Show error message but continue with next post
        setPostingStatus({ 
          type: 'error', 
          message: `Failed to post "${post.title || 'Untitled'}": ${error.message}. Continuing with next post... (${successCount} succeeded, ${failCount} failed)` 
        });
        
        // Longer pause after error
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Final status message
    if (failCount === 0) {
      setPostingStatus({ 
        type: 'success', 
        message: `Successfully posted all ${postsToPublish.length} posts to Instagram!` 
      });
    } else if (successCount === 0) {
      setPostingStatus({ 
        type: 'error', 
        message: `Failed to post any of the ${postsToPublish.length} posts to Instagram.` 
      });
      return Promise.reject(new Error('All posts failed'));
    } else {
      setPostingStatus({ 
        type: 'info', 
        message: `Completed posting: ${successCount} succeeded, ${failCount} failed out of ${postsToPublish.length} total posts.` 
      });
    }
    
    setIsPosting(false);
    
    // Reset status after a longer time
    setTimeout(() => {
      setPostingStatus(null);
    }, 10000);
    
    return Promise.resolve();
  };
  
  // Handle posting all selected posts as stories
  const handlePostAllStories = async (posts) => {
    // For this demo, we're using the posts array passed in from CalendarGrid
    // In a real app, you might have a dedicated stories collection
    const storiesToPost = posts.filter(post => post.image);
    
    if (storiesToPost.length === 0) {
      alert('No Instagram posts with images found to use as stories.');
      return Promise.reject(new Error('No valid posts for stories'));
    }
    
    // Confirm with the user
    if (!confirm(`Are you sure you want to post ${storiesToPost.length} stories to Instagram?`)) {
      return Promise.reject(new Error('User cancelled'));
    }
    
    setIsPosting(true);
    setPostingStatus({ 
      type: 'info', 
      message: `Starting to post ${storiesToPost.length} stories to Instagram...` 
    });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < storiesToPost.length; i++) {
      const story = storiesToPost[i];
      
      setPostingStatus({ 
        type: 'info', 
        message: `Posting story ${i+1}/${storiesToPost.length}: "${story.title || 'Untitled'}"` 
      });
      
      try {
        // Post to Instagram as a story
        await postStoryToInstagram(story.image, story.title || story.description);
        
        // Update success count
        successCount++;
        
        // Update progress message
        setPostingStatus({ 
          type: 'info', 
          message: `Posted story ${i+1}/${storiesToPost.length} successfully. (${successCount} succeeded, ${failCount} failed)` 
        });
        
        // Short pause between posts
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error posting story ${i+1}:`, error);
        
        // Update fail count
        failCount++;
        
        // Show error message but continue with next post
        setPostingStatus({ 
          type: 'error', 
          message: `Failed to post story: ${error.message}. Continuing with next story... (${successCount} succeeded, ${failCount} failed)` 
        });
        
        // Longer pause after error
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Final status message
    if (failCount === 0) {
      setPostingStatus({ 
        type: 'success', 
        message: `Successfully posted all ${storiesToPost.length} stories to Instagram!` 
      });
    } else if (successCount === 0) {
      setPostingStatus({ 
        type: 'error', 
        message: `Failed to post any of the ${storiesToPost.length} stories to Instagram.` 
      });
      return Promise.reject(new Error('All stories failed'));
    } else {
      setPostingStatus({ 
        type: 'info', 
        message: `Completed posting stories: ${successCount} succeeded, ${failCount} failed out of ${storiesToPost.length} total.` 
      });
    }
    
    setIsPosting(false);
    
    // Reset status after a longer time
    setTimeout(() => {
      setPostingStatus(null);
    }, 10000);
    
    return Promise.resolve();
  };
  
  // Handle creating all highlights
  const handleCreateAllHighlights = async () => {
    // For demo purposes, use sample highlights
    const highlightsToCreate = sampleHighlights.filter(highlight => highlight.image);
    
    if (highlightsToCreate.length === 0) {
      alert('No highlights with images found to create.');
      return Promise.reject(new Error('No valid highlights'));
    }
    
    // Confirm with the user
    if (!confirm(`Are you sure you want to create ${highlightsToCreate.length} highlights on Instagram?`)) {
      return Promise.reject(new Error('User cancelled'));
    }
    
    setIsPosting(true);
    setPostingStatus({ 
      type: 'info', 
      message: `Starting to create ${highlightsToCreate.length} highlights on Instagram...` 
    });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < highlightsToCreate.length; i++) {
      const highlight = highlightsToCreate[i];
      
      setPostingStatus({ 
        type: 'info', 
        message: `Creating highlight ${i+1}/${highlightsToCreate.length}: "${highlight.name}"...` 
      });
      
      try {
        // Create highlight on Instagram
        await createHighlightOnInstagram(highlight.image, highlight.name);
        
        // Update success count
        successCount++;
        
        // Update progress message
        setPostingStatus({ 
          type: 'info', 
          message: `Created highlight ${i+1}/${highlightsToCreate.length}: "${highlight.name}" successfully. (${successCount} succeeded, ${failCount} failed)` 
        });
        
        // Short pause between operations
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error creating highlight ${i+1}:`, error);
        
        // Update fail count
        failCount++;
        
        // Show error message but continue with next highlight
        setPostingStatus({ 
          type: 'error', 
          message: `Failed to create highlight "${highlight.name}": ${error.message || error}. Continuing... (${successCount} succeeded, ${failCount} failed)` 
        });
        
        // Longer pause after error
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Final status message
    if (failCount === 0) {
      setPostingStatus({ 
        type: 'success', 
        message: `Successfully created all ${highlightsToCreate.length} highlights on Instagram!` 
      });
    } else if (successCount === 0) {
      setPostingStatus({ 
        type: 'error', 
        message: `Failed to create any of the ${highlightsToCreate.length} highlights on Instagram.` 
      });
      return Promise.reject(new Error('All highlights failed'));
    } else {
      setPostingStatus({ 
        type: 'info', 
        message: `Completed creating highlights: ${successCount} succeeded, ${failCount} failed out of ${highlightsToCreate.length} total.` 
      });
    }
    
    setIsPosting(false);
    
    // Reset status after a longer time
    setTimeout(() => {
      setPostingStatus(null);
    }, 10000);
    
    return Promise.resolve();
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Content Calendar" />
        
        {/* View Toggle */}
        <div className="border-b border-[var(--border)] bg-[var(--background)]">
          <div className="flex gap-4 px-6">
            <button
              className={`py-4 px-2 relative ${
                activeView === 'calendar'
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
              onClick={() => setActiveView('calendar')}
            >
              Calendar View
              {activeView === 'calendar' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></div>
              )}
            </button>
            <button
              className={`py-4 px-2 relative ${
                activeView === 'create'
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
              onClick={() => setActiveView('create')}
            >
              Create Post
              {activeView === 'create' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></div>
              )}
            </button>
          </div>
        </div>
        
        {/* Instagram Action Buttons - Show only in calendar view */}
        {activeView === 'calendar' && (
          <div className="border-b border-[var(--border)] bg-[var(--background)] py-2 px-6">
            <div className="flex flex-wrap gap-2">
              <button
                disabled={isPosting}
                onClick={() => {
                  // Get posts from CalendarGrid via a reference or state management
                  // For demo, we'll use a simplified approach
                  const samplePosts = [
                    { id: 1, title: 'Sample Post 1', image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzNiODJmNiIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=', profile: { platform: 'instagram' } }
                  ];
                  handlePostAllStories(samplePosts);
                }}
                className={`py-1 px-3 text-white rounded-lg text-sm flex items-center gap-1 ${
                  isPosting ? 'bg-[#E4405F]/50 cursor-not-allowed' : 'bg-[#E4405F] hover:bg-[#d13752]'
                }`}
              >
                {isPosting ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 animate-spin">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <StoriesIcon className="w-3 h-3" />
                    <span>Post All Stories</span>
                  </>
                )}
              </button>
              <button
                disabled={isPosting}
                onClick={handleCreateAllHighlights}
                className={`py-1 px-3 text-white rounded-lg text-sm flex items-center gap-1 ${
                  isPosting ? 'bg-[#E4405F]/50 cursor-not-allowed' : 'bg-[#E4405F] hover:bg-[#d13752]'
                }`}
              >
                {isPosting ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 animate-spin">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <HighlightIcon className="w-3 h-3" />
                    <span>Create All Highlights</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Global Status Indicator */}
        {postingStatus && (
          <div className={`m-4 p-3 rounded-lg ${
            postingStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
            postingStatus.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400' : 
            'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
          }`}>
            <div className="flex items-center gap-2">
              {postingStatus.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {postingStatus.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {postingStatus.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{postingStatus.message}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeView === 'calendar' ? (
            <CalendarGrid 
              onPostClick={handlePostClick}
              onPostNow={handlePostAllSequential}
            />
          ) : (
            <PostCreator 
              initialPost={selectedPost}
              onSave={(post) => {
                // Handle post save
                setSelectedPost(null);
                setActiveView('calendar');
              }}
              onCancel={() => {
                setSelectedPost(null);
                setActiveView('calendar');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Icon components 
const StoriesIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
    <path d="M12 8v8M8 12h8" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

const HighlightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L9.19 8.62L2 9.24L7.45 14.14L5.82 21L12 17.27L18.18 21L16.54 14.14L22 9.24L14.81 8.62L12 2Z" />
  </svg>
);

export default FeedPage; 