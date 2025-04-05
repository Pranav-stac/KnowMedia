import { generateSocialMediaPost } from '@/lib/ai';

const EventCreator = ({ onSave, onCancel, initialEvent, viewDate }) => {
  // ... existing state ...
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);

  // ... existing functions ...

  const handleGenerateContent = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingContent(true);
    
    try {
      const generatedContent = await generateSocialMediaPost(
        aiPrompt,
        event.profile?.platform || 'linkedin'
      );
      
      setEvent(prev => ({
        ...prev,
        description: generatedContent
      }));
      
      setShowAiPrompt(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold">
            {initialEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {/* ... existing form elements ... */}
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Post Content</label>
            
            {!showAiPrompt ? (
              <div className="mb-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowAiPrompt(true)}
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1"
                >
                  <AIIcon className="w-4 h-4" />
                  <span>Generate with AI</span>
                </button>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="What would you like to post about?"
                    className="flex-1 p-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={!aiPrompt.trim() || isGeneratingContent}
                    className="px-3 py-1 bg-[var(--primary)] text-white rounded disabled:opacity-50"
                  >
                    {isGeneratingContent ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiPrompt(false)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <textarea
              value={event.description}
              onChange={(e) => setEvent({...event, description: e.target.value})}
              className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
              rows="5"
              placeholder="What's on your mind?"
            />
          </div>
          
          {/* ... rest of the form ... */}
        </div>
        
        {/* ... buttons ... */}
      </div>
    </div>
  );
};

// ... existing helper components ...

// AI Icon
const AIIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export default EventCreator; 