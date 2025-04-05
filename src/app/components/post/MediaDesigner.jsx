'use client';

import { useState } from 'react';
import Image from 'next/image';

const MediaDesigner = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [generatedImage, setGeneratedImage] = useState('/images/desk-setup.jpg');
  const [phoneImage, setPhoneImage] = useState('/images/phone-clock.jpg');
  const [prompt, setPrompt] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleGenerateImage = () => {
    console.log('Generating image with prompt:', prompt);
    // In a real app, this would call an AI image generation API
    setPrompt('');
  };

  const handleUseMedia = () => {
    console.log('Using media in post');
    // This would add the media to the post being created
  };

  return (
    <div className="flex-1 p-4">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold">Design Media</h2>
        </div>
        
        <div className="grid grid-cols-5 h-full">
          {/* Sidebar menu */}
          <div className="border-r border-[var(--border)] p-4 space-y-8">
            <MediaTab 
              icon={<TextIcon />}
              label="Text"
              active={activeTab === 'text'}
              onClick={() => handleTabChange('text')}
            />
            
            <MediaTab 
              icon={<PhotoIcon />}
              label="Photos"
              active={activeTab === 'photos'}
              onClick={() => handleTabChange('photos')}
            />
            
            <MediaTab 
              icon={<ElementsIcon />}
              label="Elements"
              active={activeTab === 'elements'}
              onClick={() => handleTabChange('elements')}
            />
            
            <MediaTab 
              icon={<BackgroundIcon />}
              label="Background"
              active={activeTab === 'background'}
              onClick={() => handleTabChange('background')}
            />
            
            <MediaTab 
              icon={<AIIcon />}
              label="AI Image"
              active={activeTab === 'ai'}
              onClick={() => handleTabChange('ai')}
            />
          </div>
          
          {/* Content area */}
          <div className="col-span-4 flex flex-col">
            {/* AI Image Generation UI */}
            {activeTab === 'ai' && (
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-medium mb-4">Generate image with AI</h3>
                
                <div className="flex gap-4 mb-6">
                  <button className="px-4 py-2 bg-[var(--background)] rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm">
                    Add iPhone
                  </button>
                  
                  <div className="flex-1">
                    <div className="relative mb-2">
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                        placeholder="Describe your image idea..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                    
                    <button 
                      className="w-full py-2 bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleGenerateImage}
                      disabled={!prompt.trim()}
                    >
                      Generate
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 flex-1">
                  {/* Phone mockup */}
                  <div className="rounded-lg overflow-hidden border border-[var(--border)] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[150px] h-[300px] relative overflow-hidden rounded-2xl border-4 border-black">
                        <Image
                          src={phoneImage}
                          alt="Phone clock"
                          width={150}
                          height={300}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Primary image */}
                  <div className="rounded-lg overflow-hidden border border-[var(--border)] relative group">
                    <Image
                      src={generatedImage}
                      alt="Generated image"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors transform scale-90 group-hover:scale-100" onClick={handleUseMedia}>
                        Use this media
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Other tabs would go here but are omitted for brevity */}
            {activeTab !== 'ai' && (
              <div className="flex items-center justify-center h-full">
                <p className="text-[var(--muted)]">This feature is not implemented in the demo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaTab = ({ icon, label, active, onClick }) => {
  return (
    <div 
      className={`flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
        active ? 'bg-[rgba(255,255,255,0.05)]' : 'hover:bg-[rgba(255,255,255,0.02)]'
      }`}
      onClick={onClick}
    >
      <div className={`w-8 h-8 flex items-center justify-center ${active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}>
        {icon}
      </div>
      <span className={`text-xs ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>{label}</span>
    </div>
  );
};

// Icons
const TextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const PhotoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ElementsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const BackgroundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const AIIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export default MediaDesigner; 