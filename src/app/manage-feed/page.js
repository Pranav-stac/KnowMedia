'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { getProfiles, getPosts, addPost, updatePost } from '@/lib/firebase';
import { postToInstagram, postStoryToInstagram, createHighlightOnInstagram } from '@/lib/instagram';

const ManageFeedPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [feedView, setFeedView] = useState('grid'); // 'grid' or 'list'
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [isAddHighlightOpen, setIsAddHighlightOpen] = useState(false);
  const [newHighlight, setNewHighlight] = useState({
    name: '',
    image: null
  });
  
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    image: null,
    hashtags: []
  });
  
  const [canvasElements, setCanvasElements] = useState([]);
  const [activeElement, setActiveElement] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [drawingColor, setDrawingColor] = useState('#ff0000');
  const [drawingSize, setDrawingSize] = useState(3);
  const [editMode, setEditMode] = useState('select'); // select, image, text, draw
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const canvasRef = useRef(null);
  const phoneFrameRef = useRef(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [postStatus, setPostStatus] = useState(null);
  const [postingStatus, setPostingStatus] = useState(null);
  
  // Fetch profiles and posts
  useEffect(() => {
    const profilesUnsubscribe = getProfiles((data) => {
      if (data && data.length > 0) {
        setProfiles(data);
        setSelectedProfile(data[0]);
      }
    });
    
    const postsUnsubscribe = getPosts((data) => {
      if (data) {
        setPosts(Array.isArray(data) ? data : []);
      }
    });
    
    return () => {
      profilesUnsubscribe();
      postsUnsubscribe();
    };
  }, []);
  
  // Filter posts by selected profile
  const filteredPosts = posts.filter(post => 
    selectedProfile && post.author && post.author.id === selectedProfile.id
  );
  
  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
  };
  
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };
  
  const handleAddPostClick = () => {
    setNewPost({
      title: '',
      description: '',
      image: null,
      hashtags: []
    });
    setIsAddPostModalOpen(true);
  };
  
  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    
    try {
      await updatePost(selectedPost.id, selectedPost);
      setIsPostModalOpen(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  };
  
  const handleAddPost = async () => {
    if (!selectedProfile || !newPost.title || !newPost.image) return;
    
    try {
      const postToAdd = {
        ...newPost,
        author: {
          id: selectedProfile.id,
          name: selectedProfile.name,
          platform: selectedProfile.platform,
          avatar: selectedProfile.avatar
        },
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
        status: 'Published'
      };
      
      await addPost(postToAdd);
      setIsAddPostModalOpen(false);
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post. Please try again.');
    }
  };
  
  const generateCaption = () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedCaption = `📣 ${aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1)}! Check out our latest updates and insights on ${selectedProfile?.platform}.`;
      const generatedHashtags = [
        selectedProfile?.platform || 'socialmedia',
        aiPrompt.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        'trending',
        'digital',
        'content'
      ];
      
      if (selectedPost) {
        setSelectedPost(prev => ({
          ...prev,
          description: generatedCaption,
          hashtags: generatedHashtags
        }));
      } else {
        setNewPost(prev => ({
          ...prev,
          description: generatedCaption,
          hashtags: generatedHashtags
        }));
      }
      
      setIsGenerating(false);
      setAiPrompt('');
    }, 1500);
  };
  
  const handleImageUpload = (e, isNewPost = false) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      
      if (isNewPost) {
        setNewPost(prev => ({
          ...prev,
          image: imageData
        }));
      } else {
        setSelectedPost(prev => ({
          ...prev,
          image: imageData
        }));
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // Different grid layouts based on platform
  const getGridLayout = () => {
    switch (selectedProfile?.platform) {
      case 'instagram':
        return 'grid-cols-3 gap-1';
      case 'youtube':
        return 'grid-cols-1 gap-4';
      case 'twitter':
      case 'facebook':
      case 'linkedin':
        return 'grid-cols-2 gap-4';
      default:
        return 'grid-cols-3 gap-1';
    }
  };
  
  // Post aspect ratio based on platform
  const getPostAspectRatio = () => {
    switch (selectedProfile?.platform) {
      case 'instagram':
        return 'aspect-square';
      case 'youtube':
        return 'aspect-video';
      case 'twitter':
      case 'facebook':
      case 'linkedin':
        return 'aspect-[4/3]';
      default:
        return 'aspect-square';
    }
  };
  
  // Function to post directly to Instagram
  const handlePostNow = async (post, e) => {
    e.stopPropagation(); // Prevent opening the post modal
    
    if (!post || !post.image || !selectedProfile || selectedProfile.platform !== 'instagram') {
      alert('You need an image and Instagram profile selected to post now');
      return;
    }
    
    try {
      setIsPosting(true);
      setPostingId(post.id);
      setPostStatus({ type: 'info', message: 'Posting to Instagram...' });
      
      const result = await postToInstagram(post.image, post.title || post.description);
      
      setPostStatus({ 
        type: 'success', 
        message: 'Posted successfully to Instagram!' 
      });
      
      // Reset status after a few seconds
      setTimeout(() => {
        setPostStatus(null);
        setPostingId(null);
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
  
  // Render platform-specific view
  const renderPlatformView = () => {
    if (!selectedProfile) return null;
    
    if (selectedProfile.platform === 'instagram' && feedView === 'grid') {
      return renderInstagramView();
    } else if (selectedProfile.platform === 'linkedin') {
      return renderLinkedInView();
    }
    
    return (
      <div className={`${feedView === 'grid' ? 'grid' : 'space-y-4'} ${feedView === 'grid' ? getGridLayout() : ''}`}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div 
              key={post.id}
              className={`${feedView === 'grid' ? `${getPostAspectRatio()} overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity border border-[var(--border)] relative group` : 'bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative'}`}
              onClick={() => handlePostClick(post)}
            >
              {feedView === 'grid' ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill
                    className="object-cover"
                    unoptimized={post.image?.startsWith('data:')}
                  />
                  
                  {/* Post Now button - shown on hover for Instagram posts in grid view */}
                  {selectedProfile?.platform === 'instagram' && (
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                      <button
                        onClick={(e) => handlePostNow(post, e)}
                        disabled={isPosting && postingId === post.id}
                        className={`py-1 px-3 rounded-lg text-sm ${
                          isPosting && postingId === post.id
                            ? 'bg-[#E4405F]/50 text-white/70 cursor-not-allowed'
                            : 'bg-[#E4405F] text-white hover:bg-[#d13752]'
                        }`}
                      >
                        {isPosting && postingId === post.id ? 'Posting...' : 'Post Now'}
                      </button>
                      
                      {/* Status message */}
                      {postStatus && postingId === post.id && (
                        <div className={`mt-2 px-3 py-1 rounded-lg text-xs max-w-[90%] text-center ${
                          postStatus.type === 'success' ? 'bg-green-500 text-white' : 
                          postStatus.type === 'error' ? 'bg-red-500 text-white' : 
                          'bg-blue-500 text-white'
                        }`}>
                          {postStatus.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="relative aspect-video w-full">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill
                      className="object-cover"
                      unoptimized={post.image?.startsWith('data:')}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{post.title}</h3>
                    <p className="text-[var(--muted)] text-sm line-clamp-2">{post.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.hashtags?.map((tag, index) => (
                        <span 
                          key={index} 
                          className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-full"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                    
                    {/* Post Now button - List view */}
                    {selectedProfile?.platform === 'instagram' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => handlePostNow(post, e)}
                          disabled={isPosting && postingId === post.id}
                          className={`py-1 px-3 rounded-lg text-sm ${
                            isPosting && postingId === post.id
                              ? 'bg-[#E4405F]/50 text-white/70 cursor-not-allowed'
                              : 'bg-[#E4405F] text-white hover:bg-[#d13752]'
                          }`}
                        >
                          {isPosting && postingId === post.id ? 'Posting...' : 'Post Now'}
                        </button>
                        
                        {/* Status message */}
                        {postStatus && postingId === post.id && (
                          <div className={`ml-2 px-3 py-1 rounded-lg text-xs ${
                            postStatus.type === 'success' ? 'bg-green-500 text-white' : 
                            postStatus.type === 'error' ? 'bg-red-500 text-white' : 
                            'bg-blue-500 text-white'
                          }`}>
                            {postStatus.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center h-64 bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <div className="w-16 h-16 rounded-full bg-[var(--background)] flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-[var(--muted)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No posts yet</h3>
            <p className="text-[var(--muted)] mb-4 text-center">Start adding posts to see how your feed will look.</p>
            <button
              className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
              onClick={handleAddPostClick}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add First Post</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInstagramView = () => {
    return (
      <div className="relative">
        {/* Canvas Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-t-lg flex items-center justify-between">
          <h3 className="font-bold">Instagram Canvas Editor</h3>
          <div className="text-sm">
            <span className="bg-white/20 px-2 py-1 rounded">
              {editMode === 'select' && 'Selection Mode'}
              {editMode === 'image' && 'Image Mode'}
              {editMode === 'text' && 'Text Mode'}
              {editMode === 'draw' && 'Drawing Mode'}
            </span>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div 
          ref={canvasRef}
          className="min-h-[800px] w-full bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden shadow-inner"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{ cursor: editMode === 'draw' ? 'crosshair' : (editMode === 'select' ? 'default' : 'pointer') }}
        >
          {/* Canvas Background Layer - Where elements go */}
          <div className="absolute inset-0 z-0">
            {/* Canvas Elements (Images, Text, Drawings) */}
            {canvasElements.map((element, index) => {
              if (element.type === 'image') {
                return (
                  <div 
                    key={index}
                    className={`absolute cursor-move ${activeElement === index ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      transform: 'translate(-50%, -50%)',
                      zIndex: element.zIndex,
                      touchAction: 'none'
                    }}
                    onMouseDown={(e) => {
                      if (editMode === 'select') {
                        e.stopPropagation();
                        setActiveElement(index);
                        
                        // Start dragging in component
                        const canvasRect = canvasRef.current.getBoundingClientRect();
                        const startX = e.clientX - canvasRect.left;
                        const startY = e.clientY - canvasRect.top;
                        const startElementX = element.x;
                        const startElementY = element.y;
                        
                        const handleElementMove = (moveEvent) => {
                          moveEvent.preventDefault();
                          
                          if (!canvasRef.current) return;
                          const canvasMoveRect = canvasRef.current.getBoundingClientRect();
                          const moveX = moveEvent.clientX - canvasMoveRect.left;
                          const moveY = moveEvent.clientY - canvasMoveRect.top;
                          
                          // Calculate position change with no boundaries
                          const dx = moveX - startX;
                          const dy = moveY - startY;
                          
                          setCanvasElements(prev => prev.map((el, idx) => {
                            if (idx === index) {
                              return {
                                ...el,
                                x: startElementX + dx,
                                y: startElementY + dy
                              };
                            }
                            return el;
                          }));
                        };
                        
                        const handleElementUp = () => {
                          document.removeEventListener('mousemove', handleElementMove);
                          document.removeEventListener('mouseup', handleElementUp);
                        };
                        
                        document.addEventListener('mousemove', handleElementMove, { passive: false });
                        document.addEventListener('mouseup', handleElementUp);
                      }
                    }}
                  >
                    <img 
                      src={element.src} 
                      alt="Canvas element" 
                      className="w-full h-full object-contain"
                      draggable="false"
                      style={{ pointerEvents: 'none' }}
                    />
                    {activeElement === index && (
                      <div 
                        className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border border-blue-500 rounded-full cursor-se-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = element.width;
                          const startHeight = element.height;
                          const aspectRatio = element.width / element.height;
                          
                          const handleResizeMove = (moveEvent) => {
                            moveEvent.preventDefault();
                            const dx = moveEvent.clientX - startX;
                            const newWidth = Math.max(50, startWidth + dx);
                            const newHeight = newWidth / aspectRatio;
                            
                            setCanvasElements(prev => prev.map((el, i) => {
                              if (i === index) {
                                return {
                                  ...el,
                                  width: newWidth,
                                  height: newHeight
                                };
                              }
                              return el;
                            }));
                          };
                          
                          const handleResizeUp = () => {
                            document.removeEventListener('mousemove', handleResizeMove);
                            document.removeEventListener('mouseup', handleResizeUp);
                          };
                          
                          document.addEventListener('mousemove', handleResizeMove, { passive: false });
                          document.addEventListener('mouseup', handleResizeUp);
                        }}
                      />
                    )}
                  </div>
                );
              } else if (element.type === 'text') {
                return (
                  <div 
                    key={index}
                    className={`absolute cursor-move p-2 select-none ${activeElement === index ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                      left: element.x,
                      top: element.y,
                      color: element.color || '#ffffff',
                      fontSize: element.size + 'px',
                      fontWeight: element.bold ? 'bold' : 'normal',
                      fontStyle: element.italic ? 'italic' : 'normal',
                      transform: 'translate(-50%, -50%)',
                      zIndex: element.zIndex,
                      textShadow: '0 0 8px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                      textAlign: 'center',
                      backgroundColor: activeElement === index ? 'rgba(0,0,0,0.3)' : 'transparent',
                      borderRadius: '4px',
                      padding: '8px',
                      lineHeight: '1.2'
                    }}
                    onMouseDown={(e) => {
                      if (editMode === 'select') {
                        e.stopPropagation();
                        setActiveElement(index);
                      }
                    }}
                  >
                    {element.content}
                  </div>
                );
              } else if (element.type === 'drawing') {
                return (
                  <svg 
                    key={index}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: element.zIndex }}
                  >
                    <path
                      d={element.path}
                      stroke={element.color}
                      strokeWidth={element.size}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                );
              }
              return null;
            })}
            
            {/* Active Drawing Path */}
            {isDrawing && drawingPoints.length > 0 && (
              <svg 
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: 9999 }}
              >
                <path
                  d={`M ${drawingPoints.map(point => `${point.x},${point.y}`).join(' L ')}`}
                  stroke={drawingColor}
                  strokeWidth={drawingSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          
          {/* Phone Shadow - Behind the phone */}
          <div className="absolute left-1/2 top-12 transform -translate-x-1/2 z-10 pointer-events-none">
            <div className="w-[400px] h-[750px] -mt-2 -ml-[13px] rounded-[45px] bg-black/20 blur-xl"></div>
          </div>
          
          {/* Mobile Phone Frame - Centered with higher z-index */}
          <div 
            ref={phoneFrameRef}
            className="absolute left-1/2 top-12 transform -translate-x-1/2 select-none z-20"
          >
            <div className="w-[375px] bg-black border-8 border-black rounded-[40px] overflow-hidden shadow-2xl relative transition-all">
              {/* Phone Notch */}
              <div className="relative h-6 bg-black flex justify-center">
                <div className="absolute top-1 w-36 h-4 bg-black rounded-b-xl"></div>
                <div className="w-20 h-3 bg-black rounded-xl absolute -top-1"></div>
              </div>

              {/* Phone Contents (Scrollable Instagram) */}
              <div className="h-[700px] overflow-y-auto bg-black">
                {/* Phone status bar */}
                <div className="bg-black text-white p-2 flex justify-between items-center text-xs">
                  <span>5:10</span>
                  <div className="flex items-center gap-1">
                    <span>362 KB/S</span>
                    <span>5G</span>
                    <span>28%</span>
                  </div>
                </div>
                
                {/* Instagram header */}
                <div className="bg-black text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{selectedProfile.name.toLowerCase().replace(/\s+/g, '')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                </div>
                
                {/* Profile info */}
                <div className="bg-black text-white p-4">
                  <div className="flex items-start justify-between mb-4">
                    {/* Profile picture */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-[var(--border)] overflow-hidden">
                        <Image 
                          src={selectedProfile.avatar} 
                          alt={selectedProfile.name} 
                          width={80}
                          height={80}
                          className="object-cover"
                          unoptimized={selectedProfile.avatar?.startsWith('data:')}
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-[var(--primary)] rounded-full w-6 h-6 flex items-center justify-center">
                        <PlusIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-xl font-semibold">{filteredPosts.length}</div>
                        <div className="text-sm">posts</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">489</div>
                        <div className="text-sm">followers</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">615</div>
                        <div className="text-sm">following</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div className="mb-3">
                    <h3 className="font-semibold">Pranav</h3>
                    <p className="text-sm text-gray-300">Product/service</p>
                    <p className="text-sm text-blue-400">praanav.in</p>
                  </div>
                  
                  {/* Professional dashboard */}
                  <div className="mb-3 bg-gray-900 rounded-md p-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Professional dashboard</h4>
                      <p className="text-xs text-gray-400">New tools are now available.</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  
                  {/* Edit profile / Share profile */}
                  <div className="flex gap-2 mb-4">
                    <button className="flex-1 py-2 text-center bg-gray-900 rounded-md font-medium">
                      Edit profile
                    </button>
                    <button className="flex-1 py-2 text-center bg-gray-900 rounded-md font-medium">
                      Share profile
                    </button>
                  </div>
                  
                  {/* Story highlights */}
                  <div className="mb-4">
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {/* Add new highlight button */}
                      <div 
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => setIsAddHighlightOpen(true)}
                      >
                        <div className="w-16 h-16 rounded-full flex items-center justify-center border border-gray-500">
                          <PlusIcon className="w-8 h-8" />
                        </div>
                        <span className="text-xs mt-1">New</span>
                      </div>
                      
                      {/* Existing highlights */}
                      {highlights.map((highlight, index) => (
                        <div 
                          key={index}
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => {
                            setSelectedHighlight(highlight);
                            setIsAddHighlightOpen(true);
                          }}
                        >
                          <div className="w-16 h-16 rounded-full border border-gray-500 overflow-hidden">
                            {highlight.image ? (
                              <Image 
                                src={highlight.image} 
                                alt={highlight.name} 
                                width={64}
                                height={64}
                                className="object-cover"
                                unoptimized={highlight.image?.startsWith('data:')}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs mt-1">{highlight.name || '...'}</span>
                        </div>
                      ))}
                      
                      {/* Empty highlight placeholders */}
                      {Array.from({ length: Math.max(0, 4 - highlights.length) }).map((_, index) => (
                        <div 
                          key={`empty-${index}`}
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => setIsAddHighlightOpen(true)}
                        >
                          <div className="w-16 h-16 rounded-full flex items-center justify-center border border-gray-500">
                            <ImageIcon className="w-8 h-8 text-gray-600" />
                          </div>
                          <span className="text-xs mt-1">...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Navigation tabs */}
                  <div className="flex border-t border-gray-800 -mx-4">
                    <button className="flex-1 p-2 flex justify-center border-t border-white">
                      <GridIcon className="w-6 h-6" />
                    </button>
                    <button className="flex-1 p-2 flex justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="flex-1 p-2 flex justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Post grid - Enhanced with infinite scrolling */}
                <div className="grid grid-cols-3 gap-px bg-gray-800">
                  {filteredPosts.length > 0 ? (
                    // Show each post only once, no repetition
                    filteredPosts.map((post, index) => (
                      <div 
                        key={post.id}
                        className="aspect-square relative cursor-pointer group"
                        onClick={() => handlePostClick(post)}
                      >
                        <Image 
                          src={post.image} 
                          alt={post.title} 
                          fill
                          className="object-cover"
                          unoptimized={post.image?.startsWith('data:')}
                        />
                        
                        {/* Post Now button - appears on hover */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                          <p className="text-white text-sm mb-2 px-2 truncate max-w-full">{post.title || 'Instagram Post'}</p>
                          
                          <button
                            onClick={(e) => handlePostNow(post, e)}
                            disabled={isPosting && postingId === post.id}
                            className={`mt-2 py-1 px-3 rounded-lg text-sm ${
                              isPosting && postingId === post.id
                                ? 'bg-[#E4405F]/50 text-white/70 cursor-not-allowed'
                                : 'bg-[#E4405F] text-white hover:bg-[#d13752]'
                            }`}
                          >
                            {isPosting && postingId === post.id ? 'Posting...' : 'Post Now'}
                          </button>
                          
                          {/* Status message */}
                          {postStatus && postingId === post.id && (
                            <div className={`mt-2 px-3 py-1 rounded-lg text-xs max-w-[90%] text-center ${
                              postStatus.type === 'success' ? 'bg-green-500 text-white' : 
                              postStatus.type === 'error' ? 'bg-red-500 text-white' : 
                              'bg-blue-500 text-white'
                            }`}>
                              {postStatus.message}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Empty grid placeholders - just enough to show a grid
                    Array.from({ length: 9 }).map((_, index) => (
                      <div 
                        key={`empty-post-${index}`}
                        className="aspect-square bg-gray-900 flex items-center justify-center cursor-pointer"
                        onClick={handleAddPostClick}
                      >
                        <PlusIcon className="w-8 h-8 text-gray-700" />
                      </div>
                    ))
                  )}
                </div>
                
                {/* Bottom nav */}
                <div className="bg-black text-white p-4 flex justify-between items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image 
                      src={selectedProfile.avatar} 
                      alt={selectedProfile.name} 
                      width={24}
                      height={24}
                      className="object-cover"
                      unoptimized={selectedProfile.avatar?.startsWith('data:')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Canvas Toolbar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 flex space-x-3 border border-gray-200 z-50">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button 
                className={`p-2 rounded-lg transition-all ${editMode === 'select' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setEditMode('select')}
                title="Select & Move"
              >
                <CursorIcon className="w-5 h-5" />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all ${editMode === 'image' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setEditMode('image')}
                title="Add Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all ${editMode === 'text' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setEditMode('text')}
                title="Add Text"
              >
                <TextIcon className="w-5 h-5" />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all ${editMode === 'draw' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setEditMode('draw')}
                title="Draw"
              >
                <PenIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-px h-8 bg-gray-300 self-center"></div>
            
            {editMode === 'draw' && (
              <div className="flex space-x-2 items-center">
                <input 
                  type="color" 
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border shadow-sm"
                  title="Select Color"
                />
                <select 
                  value={drawingSize}
                  onChange={(e) => setDrawingSize(Number(e.target.value))}
                  className="p-1 rounded border bg-white shadow-sm"
                  title="Brush Size"
                >
                  <option value="1">Thin</option>
                  <option value="3">Medium</option>
                  <option value="5">Thick</option>
                  <option value="8">Extra Thick</option>
                </select>
              </div>
            )}
            
            {editMode === 'text' && (
              <div className="flex space-x-2 items-center">
                <input 
                  type="text" 
                  placeholder="Enter text..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="px-2 py-1 rounded border shadow-sm"
                />
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border shadow-sm"
                  title="Text Color"
                />
                <select 
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="p-1 rounded border bg-white shadow-sm"
                  title="Font Size"
                >
                  <option value="16">Small</option>
                  <option value="24">Medium</option>
                  <option value="32">Large</option>
                  <option value="48">Extra Large</option>
                </select>
                <button 
                  className={`p-1 rounded ${textBold ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} shadow-sm`}
                  onClick={() => setTextBold(!textBold)}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button 
                  className={`p-1 rounded ${textItalic ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} shadow-sm`}
                  onClick={() => setTextItalic(!textItalic)}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => {
                    if (newText.trim()) {
                      const canvasRect = canvasRef.current.getBoundingClientRect();
                      setCanvasElements([
                        ...canvasElements,
                        {
                          type: 'text',
                          content: newText,
                          x: canvasRect.width / 2,
                          y: canvasRect.height / 2,
                          color: textColor,
                          size: textSize,
                          bold: textBold,
                          italic: textItalic,
                          zIndex: canvasElements.length + 1
                        }
                      ]);
                      setNewText('');
                    }
                  }}
                  disabled={!newText.trim()}
                >
                  Add
                </button>
              </div>
            )}
            
            <div className="w-px h-8 bg-gray-300 self-center"></div>
            
            <div className="flex space-x-1">
              <button 
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none"
                onClick={() => {
                  if (activeElement !== null) {
                    setCanvasElements(canvasElements.filter((_, i) => i !== activeElement));
                    setActiveElement(null);
                  }
                }}
                disabled={activeElement === null}
                title="Delete Selected"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
              <button 
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                onClick={() => {
                  setCanvasElements([]);
                  setActiveElement(null);
                  setDrawingPoints([]);
                }}
                disabled={canvasElements.length === 0}
                title="Clear All"
              >
                <RefreshIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Canvas Element Count */}
        <div className="bg-gray-100 py-2 px-4 rounded-b-lg text-sm text-gray-600 flex justify-between">
          <span>{canvasElements.length} elements on canvas</span>
          {activeElement !== null && (
            <span>Element #{activeElement + 1} selected</span>
          )}
        </div>
        
        {/* Hidden File Input for Images */}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleCanvasImageUpload}
          className="hidden" 
          id="canvas-image" 
        />
      </div>
    );
  };

// Canvas Handling Functions
const handleCanvasMouseDown = (e) => {
  if (!canvasRef.current) return;
  
  const canvasRect = canvasRef.current.getBoundingClientRect();
  const mouseX = e.clientX - canvasRect.left;
  const mouseY = e.clientY - canvasRect.top;
  
  // Check if click is inside phone frame
  if (phoneFrameRef.current) {
    const phoneRect = phoneFrameRef.current.getBoundingClientRect();
    
    // Convert phone coords to canvas coords
    const phoneLeft = phoneRect.left - canvasRect.left;
    const phoneRight = phoneRect.right - canvasRect.left;
    const phoneTop = phoneRect.top - canvasRect.top;
    const phoneBottom = phoneRect.bottom - canvasRect.top;
    
    // If clicking in phone frame area and not drawing, skip canvas interaction
    if (mouseX >= phoneLeft && mouseX <= phoneRight && mouseY >= phoneTop && mouseY <= phoneBottom && editMode !== 'draw') {
      return; // Allow phone interaction
    }
  }
  
  // First, check if we clicked on an existing element
  let clickedOnElement = false;
  
  // Only check if we're in select mode
  if (editMode === 'select') {
    // Check elements in reverse order to select the top one first
    for (let i = canvasElements.length - 1; i >= 0; i--) {
      const element = canvasElements[i];
      
      if (element.type === 'image' || element.type === 'text') {
        // Calculate element boundaries correctly for both image and text
        const halfWidth = element.type === 'image' ? element.width / 2 : 100;
        const halfHeight = element.type === 'image' ? element.height / 2 : 20;
        
        const elementLeft = element.x - halfWidth;
        const elementRight = element.x + halfWidth;
        const elementTop = element.y - halfHeight;
        const elementBottom = element.y + halfHeight;
        
        if (
          mouseX >= elementLeft &&
          mouseX <= elementRight &&
          mouseY >= elementTop &&
          mouseY <= elementBottom
        ) {
          setActiveElement(i);
          clickedOnElement = true;
          
          // Start dragging with improved handling
          const startX = mouseX;
          const startY = mouseY;
          const startElementX = element.x;
          const startElementY = element.y;
          
          const handleMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            
            if (!canvasRef.current) return;
            const canvasMoveRect = canvasRef.current.getBoundingClientRect();
            const moveX = moveEvent.clientX - canvasMoveRect.left;
            const moveY = moveEvent.clientY - canvasMoveRect.top;
            
            // Calculate position change with no boundaries
            const dx = moveX - startX;
            const dy = moveY - startY;
            
            // Update element position with no restrictions
            setCanvasElements(prev => prev.map((el, idx) => {
              if (idx === i) {
                return {
                  ...el,
                  x: startElementX + dx,
                  y: startElementY + dy
                };
              }
              return el;
            }));
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          // Use capture phase for better event handling
          document.addEventListener('mousemove', handleMouseMove, { passive: false });
          document.addEventListener('mouseup', handleMouseUp);
          break;
        }
      }
    }
    
    if (!clickedOnElement) {
      setActiveElement(null);
    }
  } else if (editMode === 'draw') {
    setIsDrawing(true);
    setDrawingPoints([{ x: mouseX, y: mouseY }]);
  } else if (editMode === 'image') {
    document.getElementById('canvas-image').click();
  } else if (editMode === 'text') {
    // Text addition is handled via the toolbar
  }
};

const handleCanvasMouseMove = (e) => {
  if (!isDrawing || !canvasRef.current) return;
  
  const canvasRect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - canvasRect.left;
  const y = e.clientY - canvasRect.top;
  setDrawingPoints(prev => [...prev, { x, y }]);
};

const handleCanvasMouseUp = (e) => {
  if (isDrawing && drawingPoints.length > 1) {
    // Convert points to SVG path
    const path = `M ${drawingPoints.map(point => `${point.x},${point.y}`).join(' L ')}`;
    
    setCanvasElements(prev => [
      ...prev,
      {
        type: 'drawing',
        path,
        color: drawingColor,
        size: drawingSize,
        zIndex: prev.length + 1
      }
    ]);
  }
  
  setIsDrawing(false);
  setDrawingPoints([]);
};

// Update canvas image upload function
const handleCanvasImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file || !canvasRef.current) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Determine position for image - place it away from the phone
    let x, y;
    
    if (phoneFrameRef.current) {
      const phoneRect = phoneFrameRef.current.getBoundingClientRect();
      const phoneLeft = phoneRect.left - canvasRect.left;
      
      // Place image to the left of the phone
      x = Math.max(150, phoneLeft - 150); // At least 150px from left edge
      y = 150;
    } else {
      // Fallback positioning
      x = canvasRect.width / 4;
      y = canvasRect.height / 3;
    }
    
    const newElement = {
      type: 'image',
      src: event.target.result,
      x: x,
      y: y,
      width: 200,
      height: 200,
      zIndex: canvasElements.length + 1
    };
    
    setCanvasElements(prevElements => [...prevElements, newElement]);
    
    // Select the new element
    setEditMode('select');
    setTimeout(() => {
      setActiveElement(canvasElements.length);
    }, 50);
  };
  
  reader.readAsDataURL(file);
  
  // Reset the file input
  e.target.value = '';
};

const handleHighlightImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const imageData = event.target.result;
    
    if (selectedHighlight) {
      const updatedHighlights = highlights.map(highlight => 
        highlight === selectedHighlight ? {...highlight, image: imageData} : highlight
      );
      setHighlights(updatedHighlights);
      setSelectedHighlight({...selectedHighlight, image: imageData});
    } else {
      setNewHighlight(prev => ({
        ...prev,
        image: imageData
      }));
    }
  };
  
  reader.readAsDataURL(file);
};

const handleAddHighlight = () => {
  if (selectedHighlight) {
    // Update existing highlight
    const updatedHighlights = highlights.map(highlight => 
      highlight === selectedHighlight ? {...selectedHighlight, name: newHighlight.name || selectedHighlight.name} : highlight
    );
    setHighlights(updatedHighlights);
  } else {
    // Add new highlight
    if (!newHighlight.name || !newHighlight.image) return;
    setHighlights([...highlights, {...newHighlight}]);
  }
  
  // Reset
  setIsAddHighlightOpen(false);
  setSelectedHighlight(null);
  setNewHighlight({
    name: '',
    image: null
  });
};

// Add LinkedIn view renderer after renderInstagramView
const renderLinkedInView = () => {
  return (
    <div className="relative">
      {/* Canvas Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 rounded-t-lg flex items-center justify-between">
        <h3 className="font-bold">LinkedIn Canvas Editor</h3>
        <div className="text-sm">
          <span className="bg-white/20 px-2 py-1 rounded">
            {editMode === 'select' && 'Selection Mode'}
            {editMode === 'image' && 'Image Mode'}
            {editMode === 'text' && 'Text Mode'}
            {editMode === 'draw' && 'Drawing Mode'}
          </span>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="min-h-[800px] w-full bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden shadow-inner"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{ cursor: editMode === 'draw' ? 'crosshair' : (editMode === 'select' ? 'default' : 'pointer') }}
      >
        {/* Canvas Background Layer */}
        <div className="absolute inset-0 z-0">
          {/* Canvas Elements (Images, Text, Drawings) */}
          {canvasElements.map((element, index) => {
            if (element.type === 'image') {
              return (
                <div 
                  key={index}
                  className={`absolute cursor-move ${activeElement === index ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    transform: 'translate(-50%, -50%)',
                    zIndex: element.zIndex,
                    touchAction: 'none'
                  }}
                  onMouseDown={(e) => {
                    if (editMode === 'select') {
                      e.stopPropagation();
                      setActiveElement(index);
                      
                      // Start dragging in component
                      const canvasRect = canvasRef.current.getBoundingClientRect();
                      const startX = e.clientX - canvasRect.left;
                      const startY = e.clientY - canvasRect.top;
                      const startElementX = element.x;
                      const startElementY = element.y;
                      
                      const handleElementMove = (moveEvent) => {
                        moveEvent.preventDefault();
                        
                        if (!canvasRef.current) return;
                        const canvasMoveRect = canvasRef.current.getBoundingClientRect();
                        const moveX = moveEvent.clientX - canvasMoveRect.left;
                        const moveY = moveEvent.clientY - canvasMoveRect.top;
                        
                        // Calculate position change with no boundaries
                        const dx = moveX - startX;
                        const dy = moveY - startY;
                        
                        setCanvasElements(prev => prev.map((el, idx) => {
                          if (idx === index) {
                            return {
                              ...el,
                              x: startElementX + dx,
                              y: startElementY + dy
                            };
                          }
                          return el;
                        }));
                      };
                      
                      const handleElementUp = () => {
                        document.removeEventListener('mousemove', handleElementMove);
                        document.removeEventListener('mouseup', handleElementUp);
                      };
                      
                      document.addEventListener('mousemove', handleElementMove, { passive: false });
                      document.addEventListener('mouseup', handleElementUp);
                    }
                  }}
                >
                  <img 
                    src={element.src} 
                    alt="Canvas element" 
                    className="w-full h-full object-contain"
                    draggable="false"
                    style={{ pointerEvents: 'none' }}
                  />
                  {activeElement === index && (
                    <div 
                      className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border border-blue-500 rounded-full cursor-se-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = element.width;
                        const startHeight = element.height;
                        const aspectRatio = element.width / element.height;
                        
                        const handleResizeMove = (moveEvent) => {
                          moveEvent.preventDefault();
                          const dx = moveEvent.clientX - startX;
                          const newWidth = Math.max(50, startWidth + dx);
                          const newHeight = newWidth / aspectRatio;
                          
                          setCanvasElements(prev => prev.map((el, i) => {
                            if (i === index) {
                              return {
                                ...el,
                                width: newWidth,
                                height: newHeight
                              };
                            }
                            return el;
                          }));
                        };
                        
                        const handleResizeUp = () => {
                          document.removeEventListener('mousemove', handleResizeMove);
                          document.removeEventListener('mouseup', handleResizeUp);
                        };
                        
                        document.addEventListener('mousemove', handleResizeMove, { passive: false });
                        document.addEventListener('mouseup', handleResizeUp);
                      }}
                    />
                  )}
                </div>
              );
            } else if (element.type === 'text') {
              return (
                <div 
                  key={index}
                  className={`absolute cursor-move p-2 select-none ${activeElement === index ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    color: element.color || '#ffffff',
                    fontSize: element.size + 'px',
                    fontWeight: element.bold ? 'bold' : 'normal',
                    fontStyle: element.italic ? 'italic' : 'normal',
                    transform: 'translate(-50%, -50%)',
                    zIndex: element.zIndex,
                    textShadow: '0 0 8px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    textAlign: 'center',
                    backgroundColor: activeElement === index ? 'rgba(0,0,0,0.3)' : 'transparent',
                    borderRadius: '4px',
                    padding: '8px',
                    lineHeight: '1.2'
                  }}
                  onMouseDown={(e) => {
                    if (editMode === 'select') {
                      e.stopPropagation();
                      setActiveElement(index);
                    }
                  }}
                >
                  {element.content}
                </div>
              );
            } else if (element.type === 'drawing') {
              return (
                <svg 
                  key={index}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ zIndex: element.zIndex }}
                >
                  <path
                    d={element.path}
                    stroke={element.color}
                    strokeWidth={element.size}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              );
            }
            return null;
          })}
          
          {/* Active Drawing Path */}
          {isDrawing && drawingPoints.length > 0 && (
            <svg 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 9999 }}
            >
              <path
                d={`M ${drawingPoints.map(point => `${point.x},${point.y}`).join(' L ')}`}
                stroke={drawingColor}
                strokeWidth={drawingSize}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        
        {/* LinkedIn Phone Frame */}
        <div 
          ref={phoneFrameRef}
          className="absolute left-1/2 top-12 transform -translate-x-1/2 select-none z-20"
        >
          <div className="w-[375px] bg-white border-8 border-gray-800 rounded-[40px] overflow-hidden shadow-2xl">
            {/* LinkedIn Header */}
            <div className="bg-white text-gray-900 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0A66C2">
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                    </svg>
                  </div>
                  <div className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image 
                    src={selectedProfile.avatar} 
                    alt={selectedProfile.name} 
                    width={32}
                    height={32}
                    className="object-cover"
                    unoptimized={selectedProfile.avatar?.startsWith('data:')}
                  />
                </div>
              </div>
            </div>

            {/* LinkedIn Feed */}
            <div className="h-[600px] overflow-y-auto bg-gray-100">
              {/* Profile Section */}
              <div className="bg-white p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image 
                      src={selectedProfile.avatar} 
                      alt={selectedProfile.name} 
                      width={48}
                      height={48}
                      className="object-cover"
                      unoptimized={selectedProfile.avatar?.startsWith('data:')}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedProfile.name}</h3>
                    <p className="text-sm text-gray-600">Product/Service</p>
                  </div>
                </div>
              </div>

              {/* Posts Grid */}
              <div className="space-y-4 p-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <div 
                      key={post.id}
                      className="bg-white rounded-lg overflow-hidden shadow cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image 
                              src={selectedProfile.avatar} 
                              alt={selectedProfile.name} 
                              width={48}
                              height={48}
                              className="object-cover"
                              unoptimized={selectedProfile.avatar?.startsWith('data:')}
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold">{selectedProfile.name}</h4>
                            <p className="text-sm text-gray-600">Product/Service • 2d</p>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{post.description}</p>
                      </div>
                      <div className="relative aspect-video w-full">
                        <Image 
                          src={post.image} 
                          alt={post.title} 
                          fill
                          className="object-cover"
                          unoptimized={post.image?.startsWith('data:')}
                        />
                      </div>
                      <div className="p-4 border-t">
                        <div className="flex justify-between text-gray-600">
                          <button className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>Like</span>
                          </button>
                          <button className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Comment</span>
                          </button>
                          <button className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Start sharing your updates with your network.</p>
                    <button
                      className="py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                      onClick={handleAddPostClick}
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Create Post</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* LinkedIn Bottom Nav */}
            <div className="bg-white border-t px-2 py-1 flex justify-between items-center">
              <button className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <button className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2">
                <PlusIcon className="w-6 h-6" />
              </button>
              <button className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image 
                  src={selectedProfile.avatar} 
                  alt={selectedProfile.name} 
                  width={24}
                  height={24}
                  className="object-cover"
                  unoptimized={selectedProfile.avatar?.startsWith('data:')}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Canvas Toolbar - Keep existing toolbar */}
        {/* ... existing toolbar code ... */}
      </div>
      
      {/* Canvas Element Count - Keep existing count */}
      {/* ... existing element count code ... */}
      
      {/* Hidden File Input - Keep existing input */}
      {/* ... existing file input code ... */}
    </div>
  );
};

// Add a new function to handle posting all Instagram posts
const handlePostAllInSequence = async () => {
  if (!selectedProfile || selectedProfile.platform !== 'instagram') {
    alert('You need to select an Instagram profile to post all');
    return;
  }
  
  const instagramPosts = filteredPosts.filter(post => post.image);
  
  if (instagramPosts.length === 0) {
    alert('No eligible Instagram posts found');
    return;
  }
  
  // Confirm with the user
  if (!confirm(`Are you sure you want to post all ${instagramPosts.length} posts to Instagram?`)) {
    return;
  }
  
  setIsPosting(true);
  setPostStatus({ 
    type: 'info', 
    message: `Starting to post ${instagramPosts.length} posts to Instagram...` 
  });
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < instagramPosts.length; i++) {
    const post = instagramPosts[i];
    setPostingId(post.id);
    setPostStatus({ 
      type: 'info', 
      message: `Posting ${i+1}/${instagramPosts.length}: "${post.title || 'Untitled'}"` 
    });
    
    try {
      // Post to Instagram
      await postToInstagram(post.image, post.title || post.description);
      
      // Update success count
      successCount++;
      
      // Update progress message
      setPostStatus({ 
        type: 'info', 
        message: `Posted ${i+1}/${instagramPosts.length}: "${post.title || 'Untitled'}" successfully. (${successCount} succeeded, ${failCount} failed)` 
      });
      
      // Short pause between posts
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error posting post ${i+1}:`, error);
      
      // Update fail count
      failCount++;
      
      // Show error message but continue with next post
      setPostStatus({ 
        type: 'error', 
        message: `Failed to post "${post.title || 'Untitled'}": ${error.message}. Continuing with next post... (${successCount} succeeded, ${failCount} failed)` 
      });
      
      // Longer pause after error
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Final status message
  if (failCount === 0) {
    setPostStatus({ 
      type: 'success', 
      message: `Successfully posted all ${instagramPosts.length} posts to Instagram!` 
    });
  } else if (successCount === 0) {
    setPostStatus({ 
      type: 'error', 
      message: `Failed to post any of the ${instagramPosts.length} posts to Instagram.` 
    });
  } else {
    setPostStatus({ 
      type: 'info', 
      message: `Completed posting: ${successCount} succeeded, ${failCount} failed out of ${instagramPosts.length} total posts.` 
    });
  }
  
  setPostingId(null);
  setIsPosting(false);
  
  // Reset status after a longer time
  setTimeout(() => {
    setPostStatus(null);
  }, 10000);
};

// Function to post stories in sequence
const handlePostAllStories = async () => {
  if (!selectedProfile || selectedProfile.platform !== 'instagram') {
    alert('You need to select an Instagram profile to post stories');
    return;
  }
  
  // For demo purposes, we'll use the first 3 posts as stories
  // In a real app, you'd have a dedicated stories collection
  const storiesToPost = filteredPosts.slice(0, 3).filter(post => post.image);
  
  if (storiesToPost.length === 0) {
    alert('No eligible Instagram posts found to use as stories');
    return;
  }
  
  // Confirm with the user
  if (!confirm(`Are you sure you want to post ${storiesToPost.length} stories to Instagram?`)) {
    return;
  }
  
  setIsPosting(true);
  setPostStatus({ 
    type: 'info', 
    message: `Starting to post ${storiesToPost.length} stories to Instagram...` 
  });
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < storiesToPost.length; i++) {
    const story = storiesToPost[i];
    setPostingId(story.id);
    setPostStatus({ 
      type: 'info', 
      message: `Posting story ${i+1}/${storiesToPost.length}...` 
    });
    
    try {
      // Post to Instagram as a story
      await postStoryToInstagram(story.image, story.title || story.description);
      
      // Update success count
      successCount++;
      
      // Update progress message
      setPostStatus({ 
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
      setPostStatus({ 
        type: 'error', 
        message: `Failed to post story ${i+1}: ${error.message}. Continuing with next story... (${successCount} succeeded, ${failCount} failed)` 
      });
      
      // Longer pause after error
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Final status message
  if (failCount === 0) {
    setPostStatus({ 
      type: 'success', 
      message: `Successfully posted all ${storiesToPost.length} stories to Instagram!` 
    });
  } else if (successCount === 0) {
    setPostStatus({ 
      type: 'error', 
      message: `Failed to post any of the ${storiesToPost.length} stories to Instagram.` 
    });
  } else {
    setPostStatus({ 
      type: 'info', 
      message: `Completed posting stories: ${successCount} succeeded, ${failCount} failed out of ${storiesToPost.length} total.` 
    });
  }
  
  setPostingId(null);
  setIsPosting(false);
  
  // Reset status after a longer time
  setTimeout(() => {
    setPostStatus(null);
  }, 10000);
};

// Function to create highlights in sequence
const handleCreateAllHighlights = async () => {
  if (!selectedProfile || selectedProfile.platform !== 'instagram') {
    alert('Please select an Instagram profile to create highlights.');
    return;
  }

  // Get highlights with images
  const highlightsToCreate = highlights.filter(h => h.image);
  
  if (highlightsToCreate.length === 0) {
    alert('You need at least one highlight with an image to create.');
    return;
  }

  if (!confirm(`Are you sure you want to create ${highlightsToCreate.length} highlights on Instagram?`)) {
    return;
  }

  setIsPosting(true);
  setPostingStatus(`Creating highlights... (0/${highlightsToCreate.length})`);
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < highlightsToCreate.length; i++) {
    const highlight = highlightsToCreate[i];
    
    // Update status
    setPostingStatus(`Creating highlight "${highlight.name}" (${i + 1}/${highlightsToCreate.length})...`);
    
    try {
      // Create highlight via Instagram API
      await createHighlightOnInstagram(highlight.image, highlight.name);
      successCount++;
      setPostingStatus(`Created highlight "${highlight.name}" (${successCount} succeeded, ${failCount} failed)`);
    } catch (error) {
      failCount++;
      console.error('Error creating highlight:', error);
      setPostingStatus(`Failed to create highlight "${highlight.name}": ${error.message || error}. Continuing... (${successCount} succeeded, ${failCount} failed)`);
      
      // Pause slightly longer after an error
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Small pause between posts
    await new Promise(r => setTimeout(r, 500));
  }

  // Final status update
  if (failCount === 0) {
    setPostingStatus(`Successfully created all ${highlightsToCreate.length} highlights!`);
  } else {
    setPostingStatus(`Completed creating highlights. ${successCount} succeeded, ${failCount} failed.`);
  }
  
  // Reset status after some time
  setTimeout(() => {
    setPostingStatus(null);
    setIsPosting(false);
  }, 5000);
};

return (
  <div className="flex h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar title="Manage Feed" />
      <div className="flex-1 overflow-y-auto">
        {/* Platform Selector */}
        <div className="mb-6 bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 mx-6 mt-6">
          <h3 className="text-sm font-medium mb-3">Select Platform</h3>
          <div className="flex flex-wrap gap-2">
            {profiles.map(profile => (
              <button
                key={profile.id}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 ${selectedProfile?.id === profile.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
                onClick={() => handleProfileSelect(profile)}
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <div className="absolute inset-0" style={{ backgroundColor: profile.color }}></div>
                  {profile.avatar && (
                    <Image 
                      src={profile.avatar} 
                      alt={profile.name} 
                      width={20}
                      height={20}
                      className="object-cover"
                      unoptimized={profile.avatar.startsWith('data:')}
                    />
                  )}
                </div>
                <span className="capitalize">{profile.platform}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Global Status Indicator */}
        {postStatus && (
          <div className={`mx-6 mb-4 p-3 rounded-lg ${
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
        
        {/* Feed Toolbar */}
        <div className="flex justify-between items-center mb-4 mx-6">
          <div className="flex gap-2">
            <button
              className={`p-2 rounded-lg ${feedView === 'grid' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
              onClick={() => setFeedView('grid')}
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg ${feedView === 'list' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] hover:bg-[var(--border)]'}`}
              onClick={() => setFeedView('list')}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2">
            {selectedProfile?.platform === 'instagram' && (
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Instagram Actions</h3>
                  <div className="text-xs text-[var(--muted)]">
                    {isPosting && postStatus && <span>{postStatus.message}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={isPosting}
                    onClick={handlePostAllInSequence}
                    className={`py-2 px-4 text-white rounded-lg flex items-center gap-2 ${
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
                        <InstagramIcon className="w-4 h-4" />
                        <span>Post All Feed</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    disabled={isPosting}
                    onClick={handlePostAllStories}
                    className={`py-2 px-4 text-white rounded-lg flex items-center gap-2 ${
                      isPosting ? 'bg-[#E4405F]/50 cursor-not-allowed' : 'bg-[#E4405F] hover:bg-[#d13752]'
                    }`}
                  >
                    {isPosting ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 animate-spin">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Posting Stories...</span>
                      </>
                    ) : (
                      <>
                        <StoriesIcon className="w-4 h-4" />
                        <span>Post All Stories</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    disabled={isPosting}
                    onClick={handleCreateAllHighlights}
                    className={`py-2 px-4 text-white rounded-lg flex items-center gap-2 ${
                      isPosting ? 'bg-[#E4405F]/50 cursor-not-allowed' : 'bg-[#E4405F] hover:bg-[#d13752]'
                    }`}
                  >
                    {isPosting ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 animate-spin">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Creating Highlights...</span>
                      </>
                    ) : (
                      <>
                        <HighlightIcon className="w-4 h-4" />
                        <span>Create All Highlights</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            <button
              className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
              onClick={handleAddPostClick}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Post</span>
            </button>
          </div>
        </div>
        
        {/* Feed Grid or Canvas */}
        {selectedProfile ? (
          renderPlatformView()
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 mx-6">
            <h3 className="text-xl font-bold mb-2">Select a platform</h3>
            <p className="text-[var(--muted)] text-center">Choose a platform to manage its feed.</p>
          </div>
        )}
      </div>
    </div>
    
    {/* Add Highlight Modal */}
    {isAddHighlightOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-[var(--card)] rounded-xl p-6 w-96 max-w-full shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{selectedHighlight ? 'Edit Story Highlight' : 'Add Story Highlight'}</h2>
            <button 
              onClick={() => {
                setIsAddHighlightOpen(false);
                setSelectedHighlight(null);
                setNewHighlight({
                  name: '',
                  image: null
                });
              }}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Highlight Image</label>
              <div className="flex justify-center mb-3">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[var(--background)] border border-[var(--border)]">
                  {(selectedHighlight?.image || newHighlight.image) ? (
                    <Image 
                      src={selectedHighlight?.image || newHighlight.image} 
                      alt="Highlight cover" 
                      fill
                      className="object-cover"
                      unoptimized={(selectedHighlight?.image || newHighlight.image)?.startsWith('data:')}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-10 h-10 text-[var(--muted)]" />
                    </div>
                  )}
                </div>
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleHighlightImageUpload}
                className="hidden" 
                id="highlight-image" 
              />
              <label 
                htmlFor="highlight-image"
                className="w-full py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadIcon className="w-5 h-5" />
                <span>Upload Image</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="highlight-name">
                Highlight Name
              </label>
              <input
                type="text"
                id="highlight-name"
                value={selectedHighlight?.name || newHighlight.name}
                onChange={(e) => {
                  if (selectedHighlight) {
                    setSelectedHighlight({...selectedHighlight, name: e.target.value});
                  } else {
                    setNewHighlight({...newHighlight, name: e.target.value});
                  }
                }}
                placeholder="e.g. Travel, Food, Events"
                className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsAddHighlightOpen(false);
                setSelectedHighlight(null);
                setNewHighlight({
                  name: '',
                  image: null
                });
              }}
              className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddHighlight}
              disabled={(!selectedHighlight && (!newHighlight.name || !newHighlight.image))}
              className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
            >
              {selectedHighlight ? 'Save Changes' : 'Add Highlight'}
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* View/Edit Post Modal */}
    {isPostModalOpen && selectedPost && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Post</h2>
            <button 
              onClick={() => setIsPostModalOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[var(--border)]">
                <Image 
                  src={selectedPost.image} 
                  alt={selectedPost.title} 
                  fill
                  className="object-cover"
                  unoptimized={selectedPost.image?.startsWith('data:')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Change Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e)}
                  className="hidden" 
                  id="post-image" 
                />
                <label 
                  htmlFor="post-image"
                  className="w-full py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload New Image</span>
                </label>
              </div>
            </div>
            
            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={selectedPost.title}
                  onChange={(e) => setSelectedPost({...selectedPost, title: e.target.value})}
                  className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="description">
                  Caption
                </label>
                <textarea
                  id="description"
                  value={selectedPost.description}
                  onChange={(e) => setSelectedPost({...selectedPost, description: e.target.value})}
                  className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[150px]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="hashtags">
                  Hashtags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedPost.hashtags?.map((tag, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1 bg-[var(--background)] px-2 py-1 rounded-full"
                    >
                      <span>#{tag.replace(/^#/, '')}</span>
                      <button
                        className="text-[var(--muted)] hover:text-red-500"
                        onClick={() => {
                          const newHashtags = [...selectedPost.hashtags];
                          newHashtags.splice(index, 1);
                          setSelectedPost({...selectedPost, hashtags: newHashtags});
                        }}
                      >
                        <XSmallIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="hashtag-input"
                    placeholder="Add a hashtag (without #)"
                    className="flex-1 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        const newTag = e.target.value.trim().replace(/^#/, '');
                        setSelectedPost({
                          ...selectedPost, 
                          hashtags: [...(selectedPost.hashtags || []), newTag]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg"
                    onClick={() => {
                      const input = document.getElementById('hashtag-input');
                      if (input.value.trim()) {
                        const newTag = input.value.trim().replace(/^#/, '');
                        setSelectedPost({
                          ...selectedPost, 
                          hashtags: [...(selectedPost.hashtags || []), newTag]
                        });
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* AI Caption Generator */}
              <div className="border border-[var(--border)] rounded-lg p-3">
                <h3 className="font-medium mb-2">AI Caption Generator</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="What is this post about?"
                    className="flex-1 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    className="py-2 px-4 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary-hover)] transition-colors disabled:opacity-50"
                    disabled={!aiPrompt.trim() || isGenerating}
                    onClick={generateCaption}
                  >
                    {isGenerating ? 
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Writing...</span>
                      </span> 
                      : 'Generate'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdatePost}
              className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Add New Post Modal */}
    {isAddPostModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add New Post</h2>
            <button 
              onClick={() => setIsAddPostModalOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--background)]">
                {newPost.image ? (
                  <Image 
                    src={newPost.image} 
                    alt="New post" 
                    fill
                    className="object-cover"
                    unoptimized={newPost.image?.startsWith('data:')}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-[var(--muted)] mb-2" />
                    <p className="text-[var(--muted)]">No image selected</p>
                  </div>
                )}
              </div>
              
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden" 
                  id="new-post-image" 
                  required
                />
                <label 
                  htmlFor="new-post-image"
                  className="w-full py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload Image</span>
                </label>
              </div>
            </div>
            
            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="new-title">
                  Title
                </label>
                <input
                  type="text"
                  id="new-title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="new-description">
                  Caption
                </label>
                <textarea
                  id="new-description"
                  value={newPost.description}
                  onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                  className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[150px]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="new-hashtags">
                  Hashtags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPost.hashtags?.map((tag, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1 bg-[var(--background)] px-2 py-1 rounded-full"
                    >
                      <span>#{tag.replace(/^#/, '')}</span>
                      <button
                        className="text-[var(--muted)] hover:text-red-500"
                        onClick={() => {
                          const newHashtags = [...newPost.hashtags];
                          newHashtags.splice(index, 1);
                          setNewPost({...newPost, hashtags: newHashtags});
                        }}
                      >
                        <XSmallIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="new-hashtag-input"
                    placeholder="Add a hashtag (without #)"
                    className="flex-1 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        const newTag = e.target.value.trim().replace(/^#/, '');
                        setNewPost({
                          ...newPost, 
                          hashtags: [...(newPost.hashtags || []), newTag]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg"
                    onClick={() => {
                      const input = document.getElementById('new-hashtag-input');
                      if (input.value.trim()) {
                        const newTag = input.value.trim().replace(/^#/, '');
                        setNewPost({
                          ...newPost, 
                          hashtags: [...(newPost.hashtags || []), newTag]
                        });
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* AI Caption Generator */}
              <div className="border border-[var(--border)] rounded-lg p-3">
                <h3 className="font-medium mb-2">AI Caption Generator</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="What is this post about?"
                    className="flex-1 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    className="py-2 px-4 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary-hover)] transition-colors disabled:opacity-50"
                    disabled={!aiPrompt.trim() || isGenerating}
                    onClick={generateCaption}
                  >
                    {isGenerating ? 
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Writing...</span>
                      </span> 
                      : 'Generate'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddPostModalOpen(false)}
              className="py-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPost}
              disabled={!newPost.title || !newPost.image}
              className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
            >
              Add Post
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

// Icons
const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const GridIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const XSmallIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const ImageIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// New Icons
const CursorIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const TextIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
  </svg>
);

const PenIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Add the InstagramIcon component near the other icon components
const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" />
  </svg>
);

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

export default ManageFeedPage; 