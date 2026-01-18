import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StoryViewer from '../stories/StoryViewer';

export default function TopBar({ onMenuClick }) {
  const [showStory, setShowStory] = useState(false);
  const [hasNewStory, setHasNewStory] = useState(true);

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.filter({ is_active: true }),
    initialData: [],
  });

  const activeStories = stories.filter(s => {
    if (s.expires_at) {
      return new Date(s.expires_at) > new Date();
    }
    return true;
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuClick}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </motion.button>

          <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
            Chicago Jewish
          </h1>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (activeStories.length > 0) {
                setShowStory(true);
                setHasNewStory(false);
              }
            }}
            className="relative w-10 h-10"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 p-0.5 ${
              hasNewStory && activeStories.length > 0 ? 'animate-pulse ring-2 ring-blue-400 ring-offset-2' : ''
            }`}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <span className="text-lg">📢</span>
              </div>
            </div>
            {hasNewStory && activeStories.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {showStory && activeStories.length > 0 && (
          <StoryViewer 
            stories={activeStories} 
            onClose={() => setShowStory(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}