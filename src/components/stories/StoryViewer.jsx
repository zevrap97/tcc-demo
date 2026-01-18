import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StoryViewer({ stories, onClose }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startY, setStartY] = useState(null);
  const [viewedStories, setViewedStories] = useState(new Set());

  const currentStory = stories[currentStoryIndex];
  const currentSlide = currentStory?.slides?.[currentSlideIndex];
  const slideDuration = (currentSlide?.duration || 5) * 1000;

  // Track story view
  useEffect(() => {
    const trackView = async () => {
      if (currentStory && !viewedStories.has(currentStory.id)) {
        try {
          await base44.entities.Story.update(currentStory.id, {
            view_count: (currentStory.view_count || 0) + 1,
          });
          setViewedStories(prev => new Set([...prev, currentStory.id]));
        } catch (err) {
          console.log('Failed to track view:', err);
        }
      }
    };
    trackView();
  }, [currentStoryIndex, currentStory?.id]);

  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < (currentStory?.slides?.length || 1) - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentSlideIndex, currentStoryIndex, currentStory?.slides?.length, stories.length, onClose]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    }
  }, [currentSlideIndex, currentStoryIndex]);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (slideDuration / 50));
        if (newProgress >= 100) {
          goToNextSlide();
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [slideDuration, isPaused, goToNextSlide]);

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      goToPrevSlide();
    } else if (x > (width * 2) / 3) {
      goToNextSlide();
    }
  };

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (startY === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 100) {
      onClose();
    }
  };

  const handleTouchEnd = () => {
    setStartY(null);
    setIsPaused(false);
  };

  if (!currentStory || !currentSlide) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[60] flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10">
        {currentStory.slides.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentSlideIndex ? '100%' : 
                       idx === currentSlideIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-10 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Story title */}
      <div className="absolute top-10 left-4 z-10">
        <p className="text-white font-semibold text-sm">{currentStory.title}</p>
      </div>

      {/* Slide content */}
      <div
        className="flex-1 flex items-center justify-center"
        onClick={handleTap}
      >
        <img
          src={currentSlide.image_url}
          alt=""
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Pull down indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs">
        Pull down to close
      </div>
    </motion.div>
  );
}