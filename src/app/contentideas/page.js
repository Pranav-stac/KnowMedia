'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { generateContentIdeas, generateSocialMediaPost } from '@/lib/ai';

export default function ContentIdeasPage() {
  const [industry, setIndustry] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState(null);
  const [expandedIdea, setExpandedIdea] = useState(null);
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);

  const generateIdeas = async () => {
    if (!industry.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setIdeas([]);
    
    try {
      const generatedIdeas = await generateContentIdeas(industry, 8);
      setIdeas(generatedIdeas.map((idea, index) => ({
        id: index + 1,
        title: idea,
        saved: false
      })));
    } catch (err) {
      console.error('Error generating ideas:', err);
      setError('Failed to generate ideas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveIdea = (id) => {
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, saved: !idea.saved } : idea
    ));
  };

  const handleExpandIdea = async (id) => {
    // If the same idea is already expanded, collapse it
    if (expandedIdea === id) {
      setExpandedIdea(null);
      setGeneratedPost('');
      return;
    }
    
    setExpandedIdea(id);
    setIsGeneratingPost(true);
    setGeneratedPost('');
    
    try {
      const idea = ideas.find(idea => idea.id === id);
      const post = await generateSocialMediaPost(idea.title, platform);
      setGeneratedPost(post);
    } catch (err) {
      console.error('Error generating post:', err);
      setGeneratedPost('Failed to generate a post for this idea. Please try again.');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Content Ideas" />
        
        <div className="container mx-auto p-6 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">AI Content Idea Generator</h1>
          
          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] mb-8">
            <h2 className="text-xl font-semibold mb-4">Generate Ideas</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Industry/Topic</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Digital Marketing, Technology, Health..."
                  className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-md"
                />
              </div>
              
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-md"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={generateIdeas}
              disabled={!industry.trim() || isGenerating}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Ideas'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                {error}
              </div>
            )}
          </div>
          
          {/* Ideas List */}
          <div className="space-y-4">
            {isGenerating ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
              </div>
            ) : ideas.length > 0 ? (
              ideas.map(idea => (
                <div key={idea.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="p-4 flex justify-between items-center">
                    <h3 className="font-medium">{idea.title}</h3>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveIdea(idea.id)}
                        className={`p-2 rounded-md ${
                          idea.saved 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        } transition-colors`}
                      >
                        {idea.saved ? <SavedIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                      </button>
                      
                      <button
                        onClick={() => handleExpandIdea(idea.id)}
                        className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {expandedIdea === idea.id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedIdea === idea.id && (
                    <div className="border-t border-[var(--border)] p-4">
                      {isGeneratingPost ? (
                        <div className="flex items-center justify-center h-24">
                          <div className="animate-pulse flex gap-1">
                            <div className="h-2 w-2 bg-[var(--muted)] rounded-full"></div>
                            <div className="h-2 w-2 bg-[var(--muted)] rounded-full animation-delay-200"></div>
                            <div className="h-2 w-2 bg-[var(--muted)] rounded-full animation-delay-400"></div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium mb-2">Generated Post</h4>
                          <p className="whitespace-pre-line text-[var(--muted-foreground)]">{generatedPost}</p>
                          
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedPost);
                                // Show a small toast notification
                                alert('Post copied to clipboard!');
                              }}
                              className="px-3 py-1 bg-[var(--secondary)] text-white text-sm rounded hover:bg-[var(--secondary-hover)] transition-colors"
                            >
                              Copy to Clipboard
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-[var(--muted)] mb-2">No content ideas generated yet</p>
                <p className="text-[var(--muted-foreground)] text-sm max-w-md">
                  Enter your industry or topic and click "Generate Ideas" to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
const SaveIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const SavedIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a1 1 0 01-1.45.9L12 18.69 5.2 21.9A1 1 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
); 