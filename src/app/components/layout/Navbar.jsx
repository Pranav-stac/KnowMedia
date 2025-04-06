'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('calendar');

  // New function to handle the automation button click
  const handleAutomationClick = async () => {
    try {
      // Making a POST request to the Next.js API route
      const response = await fetch('/api/automate', { // Updated URL
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Get response from the API route
      console.log('Automation response:', data.message);

    } catch (error) {
      console.error("Error triggering automation:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
      <div className="flex items-center space-x-10">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative overflow-hidden rounded-lg h-8 w-8 bg-[var(--secondary)] flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xl">p</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[var(--foreground)]">post</span>
            <span className="text-[var(--secondary)]">iz</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <NavLink 
            href="/calendar" 
            isActive={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </NavLink>
          <NavLink 
            href="/analytics" 
            isActive={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </NavLink>
          <NavLink 
            href="/messages" 
            isActive={activeTab === 'messages'} 
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </NavLink>
          <NavLink 
            href="/automation" 
            isActive={activeTab === 'automation'} 
            onClick={() => setActiveTab('automation')}
          >
            Automation
          </NavLink>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-[var(--card)] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button className="p-2 rounded-full hover:bg-[var(--card)] transition-colors relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children, isActive, onClick }) => {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`relative px-4 py-2 rounded-full transition-all ${
        isActive 
          ? 'bg-white text-black font-medium' 
          : 'text-[var(--foreground)] hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar; 