'use client';

import { useState } from 'react';

// Basic component for displaying messages (like Flask's flash messages)
const FlashMessage = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <ul className="list-none p-0 my-4">
      {messages.map((msg, index) => (
        <li 
          key={index} 
          className={`p-3 mb-2 rounded border text-sm ${
            msg.type === 'success' ? 'bg-green-100 border-green-300 text-green-800' :
            msg.type === 'error' ? 'bg-red-100 border-red-300 text-red-800' :
            msg.type === 'warning' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
            'bg-blue-100 border-blue-300 text-blue-800' // Default/info
          }`}
        >
          {msg.text}
        </li>
      ))}
    </ul>
  );
};


export default function AutomationPage() {
  const [subject, setSubject] = useState('Marketing Update');
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState([]); // To store feedback messages
  const [isLoading, setIsLoading] = useState({
    recentEmails: false,
    recentWhatsapp: false,
    blast: false,
  });

  const addMessage = (text, type = 'info') => {
    // Add new message, potentially clearing old ones or keeping a history
    setMessages([{ text, type }]); 
  };

  // --- Handler Functions ---

  const handleSendRecent = async (type) => {
    const apiPath = type === 'email' ? '/api/automate/recent-emails' : '/api/automate/recent-whatsapp';
    const loadingKey = type === 'email' ? 'recentEmails' : 'recentWhatsapp';
    
    setIsLoading(prev => ({ ...prev, [loadingKey]: true }));
    setMessages([]); // Clear previous messages

    try {
      const response = await fetch(apiPath, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to trigger ${type} automation.`);
      }
      
      addMessage(data.message || `Successfully triggered ${type} task. Sent: ${data[type === 'email' ? 'emails_sent' : 'whatsapp_sent']}`, 'success');

    } catch (error) {
      console.error(`Error triggering recent ${type}:`, error);
      addMessage(`Error: ${error.message}`, 'error');
    } finally {
       setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleSendBlast = async (e) => {
    e.preventDefault(); // Prevent default form submission
     setIsLoading(prev => ({ ...prev, blast: true }));
     setMessages([]);

    if (!body.trim()) {
       addMessage('Message body cannot be empty.', 'warning');
       setIsLoading(prev => ({ ...prev, blast: false }));
       return;
    }

    try {
      const response = await fetch('/api/automate/marketing-blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const data = await response.json();

       if (!response.ok) {
        throw new Error(data.message || 'Failed to send marketing blast.');
      }

      addMessage(data.message || `Marketing blast finished. Emails: ${data.emails_sent}, WhatsApp: ${data.whatsapp_sent}.`, 'success');
      // Optionally clear form:
      // setSubject('Marketing Update');
      // setBody(''); 

    } catch (error) {
       console.error('Error sending blast:', error);
       addMessage(`Error: ${error.message}`, 'error');
    } finally {
       setIsLoading(prev => ({ ...prev, blast: false }));
    }
  };


  // --- Render ---
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[var(--foreground)]">Marketing Automation</h1>

      <FlashMessage messages={messages} />

      {/* Targeted Messages Section */}
      <div className="mb-8 p-5 border border-[var(--border)] rounded-lg bg-[var(--card)] shadow-sm">
        <h2 className="text-xl font-semibold mb-3 border-b border-[var(--border)] pb-2 text-[var(--foreground)]">Targeted Messages (Based on Recent Views)</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Send messages to users based on products they viewed recently.</p>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleSendRecent('email')} 
            disabled={isLoading.recentEmails || isLoading.recentWhatsapp || isLoading.blast}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading.recentEmails ? 'Sending...' : 'Send Targeted Emails'}
          </button>
          <button 
            onClick={() => handleSendRecent('whatsapp')} 
            disabled={isLoading.recentEmails || isLoading.recentWhatsapp || isLoading.blast}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isLoading.recentWhatsapp ? 'Sending...' : 'Send Targeted WhatsApp'}
          </button>
        </div>
      </div>

      {/* Marketing Blast Section */}
      <div className="p-5 border border-[var(--border)] rounded-lg bg-[var(--card)] shadow-sm">
        <h2 className="text-xl font-semibold mb-3 border-b border-[var(--border)] pb-2 text-[var(--foreground)]">Marketing Blast (All Users)</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Compose and send a custom marketing message (email and/or WhatsApp) to all registered users.</p>
        <form onSubmit={handleSendBlast}>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-[var(--foreground)] mb-1">Email Subject:</label>
            <input 
              type="text" 
              id="subject" 
              name="subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full p-2 border border-[var(--border)] rounded bg-[var(--input)] text-[var(--foreground)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="body" className="block text-sm font-medium text-[var(--foreground)] mb-1">Message Body:</label>
            <textarea 
              id="body" 
              name="body" 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Enter your marketing message here..."
              rows="5"
              className="w-full p-2 border border-[var(--border)] rounded bg-[var(--input)] text-[var(--foreground)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <button 
              type="submit"
              disabled={isLoading.recentEmails || isLoading.recentWhatsapp || isLoading.blast}
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading.blast ? 'Sending...' : 'Send Blast to All Users'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
} 