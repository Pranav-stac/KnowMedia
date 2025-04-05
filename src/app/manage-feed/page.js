'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { getProfiles, getPosts, addPost, updatePost } from '@/lib/firebase';

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
  
  // Render platform-specific view
  const renderPlatformView = () => {
    if (!selectedProfile) return null;
    
    if (selectedProfile.platform === 'instagram' && feedView === 'grid') {
      return renderInstagramView();
    }
    
    return (
      <div className={`${feedView === 'grid' ? 'grid' : 'space-y-4'} ${feedView === 'grid' ? getGridLayout() : ''}`}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div 
              key={post.id}
              className={`${feedView === 'grid' ? `${getPostAspectRatio()} overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity border border-[var(--border)]` : 'bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow'}`}
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
        {/* Canvas Area */}
        <div 
          ref={canvasRef}
          className="min-h-[800px] w-full bg-gray-900 relative overflow-hidden"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
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
                    zIndex: element.zIndex
                  }}
                  onMouseDown={(e) => {
                    if (editMode === 'select') {
                      e.stopPropagation();
                      setActiveElement(index);
                    }
                  }}
                >
                  <img 
                    src={element.src} 
                    alt="Canvas element" 
                    className="w-full h-full object-contain"
                    draggable="false"
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
                        
                        document.addEventListener('mousemove', handleResizeMove);
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
                  className={`absolute cursor-move p-2 ${activeElement === index ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    color: element.color || '#ffffff',
                    fontSize: element.size + 'px',
                    fontWeight: element.bold ? 'bold' : 'normal',
                    fontStyle: element.italic ? 'italic' : 'normal',
                    transform: 'translate(-50%, -50%)',
                    zIndex: element.zIndex,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
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
          
          {/* Mobile Phone Frame - Centered */}
          <div 
            ref={phoneFrameRef}
            className="absolute left-1/2 top-5 transform -translate-x-1/2 select-none"
          >
            <div className="w-[375px] bg-black border-8 border-black rounded-[40px] overflow-hidden shadow-2xl">
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
                  {/* Generate a lot of posts or empty placeholders for scrolling */}
                  {filteredPosts.length > 0 ? (
                    // Repeat posts to make it seem infinite
                    [...Array(Math.ceil(30 / filteredPosts.length))].flatMap((_, i) =>
                      filteredPosts.map(post => (
                        <div 
                          key={`${post.id}-${i}`}
                          className="aspect-square relative cursor-pointer"
                          onClick={() => handlePostClick(post)}
                        >
                          <Image 
                            src={post.image} 
                            alt={post.title} 
                            fill
                            className="object-cover"
                            unoptimized={post.image?.startsWith('data:')}
                          />
                        </div>
                      ))
                    ).slice(0, 30) // Limit to 30 posts total
                  ) : (
                    // Empty grid placeholders - show more for scrolling
                    Array.from({ length: 30 }).map((_, index) => (
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
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg p-2 flex space-x-2">
            <button 
              className={`p-2 rounded-lg ${editMode === 'select' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setEditMode('select')}
              title="Select & Move"
            >
              <CursorIcon className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded-lg ${editMode === 'image' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setEditMode('image')}
              title="Add Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded-lg ${editMode === 'text' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setEditMode('text')}
              title="Add Text"
            >
              <TextIcon className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded-lg ${editMode === 'draw' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setEditMode('draw')}
              title="Draw"
            >
              <PenIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 self-center"></div>
            {editMode === 'draw' && (
              <>
                <input 
                  type="color" 
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Select Color"
                />
                <select 
                  value={drawingSize}
                  onChange={(e) => setDrawingSize(Number(e.target.value))}
                  className="p-1 rounded border"
                  title="Brush Size"
                >
                  <option value="1">Thin</option>
                  <option value="3">Medium</option>
                  <option value="5">Thick</option>
                  <option value="8">Extra Thick</option>
                </select>
              </>
            )}
            {editMode === 'text' && (
              <>
                <input 
                  type="text" 
                  placeholder="Enter text..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="px-2 py-1 rounded border"
                />
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Text Color"
                />
                <select 
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="p-1 rounded border"
                  title="Font Size"
                >
                  <option value="16">Small</option>
                  <option value="24">Medium</option>
                  <option value="32">Large</option>
                  <option value="48">Extra Large</option>
                </select>
                <button 
                  className={`p-1 rounded ${textBold ? 'bg-blue-100' : 'bg-gray-100'}`}
                  onClick={() => setTextBold(!textBold)}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button 
                  className={`p-1 rounded ${textItalic ? 'bg-blue-100' : 'bg-gray-100'}`}
                  onClick={() => setTextItalic(!textItalic)}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                >
                  Add
                </button>
              </>
            )}
            <div className="w-px h-6 bg-gray-300 self-center"></div>
            <button 
              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
              onClick={() => {
                if (activeElement !== null) {
                  setCanvasElements(canvasElements.filter((_, i) => i !== activeElement));
                  setActiveElement(null);
                }
              }}
              title="Delete Selected"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => {
                setCanvasElements([]);
                setActiveElement(null);
                setDrawingPoints([]);
              }}
              title="Clear All"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
          </div>
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
    
    // First, check if we clicked on an existing element
    let clickedOnElement = false;
    
    // Only check if we're in select mode or moving existing element
    if (editMode === 'select') {
      // Check elements in reverse order to select the top one first
      for (let i = canvasElements.length - 1; i >= 0; i--) {
        const element = canvasElements[i];
        
        if (element.type === 'image' || element.type === 'text') {
          const halfWidth = element.type === 'image' ? element.width / 2 : 100;
          const halfHeight = element.type === 'image' ? element.height / 2 : 20;
          
          if (
            mouseX >= element.x - halfWidth &&
            mouseX <= element.x + halfWidth &&
            mouseY >= element.y - halfHeight &&
            mouseY <= element.y + halfHeight
          ) {
            setActiveElement(i);
            clickedOnElement = true;
            
            // Start dragging
            const startX = mouseX;
            const startY = mouseY;
            
            const handleMouseMove = (moveEvent) => {
              const dx = moveEvent.clientX - canvasRect.left - startX;
              const dy = moveEvent.clientY - canvasRect.top - startY;
              
              setCanvasElements(prev => prev.map((el, idx) => {
                if (idx === i) {
                  return {
                    ...el,
                    x: element.x + dx,
                    y: element.y + dy
                  };
                }
                return el;
              }));
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
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
      // We'll handle text addition via the text input and button in the toolbar
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
    reader.onload = (event) => {
      // Create a temporary image to get dimensions
      const img = new Image();
      img.onload = () => {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        // Use a default width of 200px but maintain aspect ratio
        const aspectRatio = img.width / img.height;
        const width = 200;
        const height = width / aspectRatio;
        
        setCanvasElements(prev => [
          ...prev,
          {
            type: 'image',
            src: event.target.result,
            x: canvasRect.width / 2,
            y: canvasRect.height / 2,
            width,
            height,
            zIndex: prev.length + 1
          }
        ]);
      };
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
    
    // Reset the file input to allow selecting the same file again
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
            
            <button
              className="py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
              onClick={handleAddPostClick}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Post</span>
            </button>
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

export default ManageFeedPage; 