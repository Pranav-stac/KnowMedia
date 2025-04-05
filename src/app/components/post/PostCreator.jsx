'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const PostCreator = () => {
  const [postContent, setPostContent] = useState("Success comes from mastering your time. Reflect daily on your accomplishments and balance work with rest for maximum productivity! ⏰✨");
  const [selectedProfile, setSelectedProfile] = useState({
    id: 1,
    name: 'Daniel Hamilton',
    platform: 'linkedin',
    avatar: '/avatars/daniel-linkedin.jpg',
    color: '#0077B5'
  });
  const [showAIChat, setShowAIChat] = useState(true);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'assistant', 
      content: "Hi! I'm AI Assistant. I can write any post for you. What do you want to tell your audience about?" 
    },
    {
      id: 2,
      role: 'user',
      content: "Hi! Can you help me generate some post about time management?"
    },
    {
      id: 3,
      role: 'assistant',
      content: "Of course!"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handlePostChange = (e) => {
    setPostContent(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: newMessage
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: "I've created a time management post for you! Check the editor on the left."
      };
      setMessages([...messages, userMessage, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Post Editor */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Create Post</h2>
          
          <div className="flex items-center gap-3 mb-6">
            <ProfileAvatar profile={selectedProfile} />
          </div>
          
          <textarea
            className="flex-1 bg-transparent border-none outline-none resize-none mb-4 min-h-40 text-[16px] leading-relaxed"
            value={postContent}
            onChange={handlePostChange}
            placeholder="What do you want to share?"
          />

          <div className="border-t border-[var(--border)] pt-4 flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--background)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors text-sm">
              <DocumentIcon className="w-5 h-5" />
              <span>Insert Media</span>
            </button>
            
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] rounded-lg transition-colors text-sm text-white">
              <WandIcon className="w-5 h-5" />
              <span>Design Media</span>
            </button>
          </div>

          <div className="border-t border-[var(--border)] mt-4 pt-4 flex justify-between">
            <button className="px-4 py-2 border border-[var(--border)] rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              Save as draft
            </button>
            
            <button className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-md transition-colors">
              Add to calendar
            </button>
          </div>
        </div>
        
        {/* Preview and AI Assistant */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col h-full">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-xl font-semibold">Preview</h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Post Preview */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ProfileAvatar profile={selectedProfile} />
              </div>
              
              <p className="text-[var(--foreground)] mb-4 whitespace-pre-wrap">{postContent}</p>
              
              <div className="flex items-center gap-4 text-[var(--muted)]">
                <div className="flex items-center gap-1">
                  <CommentIcon className="w-5 h-5" />
                  <span>28</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShareIcon className="w-5 h-5" />
                  <span>5</span>
                </div>
              </div>
            </div>
            
            {/* AI Assistant Interface */}
            <div>
              <button 
                className="w-full py-3 px-4 mb-4 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 text-white font-medium"
                onClick={() => setShowAIChat(!showAIChat)}
              >
                <WandIcon className="w-5 h-5" />
                <span>AI Content Assistant</span>
              </button>
              
              {showAIChat && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-lg">
                  <div className="p-4 max-h-64 overflow-y-auto">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`mb-3 ${
                          message.role === 'user' 
                            ? 'flex justify-end' 
                            : 'flex justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-[var(--border)] text-[var(--foreground)]'
                              : 'bg-[var(--primary)] text-white'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="border-t border-[var(--border)] p-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type something..."
                      className="flex-1 bg-transparent border-none outline-none placeholder-[var(--muted)]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="text-[var(--primary)]"
                      disabled={!newMessage.trim()}
                    >
                      <SendIcon className="w-6 h-6" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileAvatar = ({ profile }) => {
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      case 'instagram': return '#E4405F';
      default: return '#6366f1';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <div className="absolute inset-0" style={{ backgroundColor: getPlatformColor(profile.platform) }}></div>
        
        {profile.avatar && (
          <Image 
            src={profile.avatar} 
            alt={profile.name} 
            width={40} 
            height={40}
            className="object-cover"
            onError={(e) => {
              // Fallback avatar with first letter of name
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-lg">${profile.name.charAt(0)}</div>`;
            }}
          />
        )}
        
        {/* Platform icon in bottom right */}
        <div 
          className="absolute bottom-0 right-0 rounded-full w-4 h-4 flex items-center justify-center" 
          style={{ backgroundColor: getPlatformColor(profile.platform) }}
        >
          <PlatformIcon platform={profile.platform} className="w-3 h-3 text-white" />
        </div>
      </div>
      
      <div>
        <p className="font-medium text-sm">{profile.name}</p>
        <p className="text-xs text-[var(--muted)] capitalize">{profile.platform}</p>
      </div>
    </div>
  );
};

// Icons
const WandIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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

export default PostCreator; 