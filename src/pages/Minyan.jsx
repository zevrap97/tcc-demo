import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MinyanCard from '@/components/minyan/MinyanCard';
import NextMinyanBanner from '@/components/minyan/NextMinyanBanner';
import { Search, Clock, Heart, Filter } from 'lucide-react';

export default function Minyan() {
  const [quickFilter, setQuickFilter] = useState('all');
  const [nusachFilter, setNusachFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data: minyans = [], isLoading } = useQuery({
    queryKey: ['minyans'],
    queryFn: () => base44.entities.Minyan.filter({ is_active: true }),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', 'synagogue'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          return base44.entities.Favorite.filter({ 
            user_email: user.email, 
            item_type: 'synagogue' 
          });
        }
        return [];
      } catch {
        return [];
      }
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (minyan) => {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      const existing = favorites.find(f => f.item_id === minyan.synagogue_id);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          item_type: 'synagogue',
          item_id: minyan.synagogue_id,
          item_name: minyan.synagogue_name,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const isFavorite = (synagogueId) => favorites.some(f => f.item_id === synagogueId);

  const addToCalendar = (minyan) => {
    const [hours, minutes] = minyan.time.split(':').map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(today.getTime() + 30 * 60000); // 30 min duration
    
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(minyan.prayer_type + ' at ' + minyan.synagogue_name)}&dates=${formatDate(today)}/${formatDate(endTime)}&location=${encodeURIComponent(minyan.address || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  // Get current day
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Filter and sort minyans
  const filteredMinyans = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return minyans
      .filter((minyan) => {
        // Check if minyan is for today
        if (!minyan.day_of_week?.includes(currentDay)) return false;

        // Nusach filter
        if (nusachFilter !== 'All' && minyan.nusach !== nusachFilter) return false;

        // Quick filters
        if (quickFilter === 'within10' || quickFilter === 'soon') {
          const [hours, minutes] = minyan.time.split(':').map(Number);
          const minyanMinutes = hours * 60 + minutes;
          const diff = minyanMinutes - currentMinutes;
          if (diff < 0 || diff > 30) return false; // Within 30 minutes
        }

        if (quickFilter === 'favorites' && !isFavorite(minyan.synagogue_id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const [aH, aM] = a.time.split(':').map(Number);
        const [bH, bM] = b.time.split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });
  }, [minyans, quickFilter, nusachFilter, currentDay, favorites]);

  // Get next minyan
  const nextMinyan = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return filteredMinyans.find((minyan) => {
      const [hours, minutes] = minyan.time.split(':').map(Number);
      const minyanMinutes = hours * 60 + minutes;
      return minyanMinutes > currentMinutes;
    });
  }, [filteredMinyans]);

  const quickFilters = [
    { key: 'all', label: 'All', icon: Filter },
    { key: 'soon', label: 'Soon', icon: Clock },
    { key: 'favorites', label: 'Favorites', icon: Heart },
  ];

  const nusachOptions = ['All', 'Ashkenaz', 'Sefard', 'Edot HaMizrach', 'Chabad'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <h1 className="text-xl font-bold text-slate-800">Minyan Times</h1>

        {/* Next Minyan Banner */}
        {nextMinyan && <NextMinyanBanner minyan={nextMinyan} />}

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickFilters.map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuickFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                quickFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.button>
          ))}
        </div>

        {/* Nusach Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {nusachOptions.map((nusach) => (
            <motion.button
              key={nusach}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNusachFilter(nusach)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                nusachFilter === nusach
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {nusach}
            </motion.button>
          ))}
        </div>

        {/* Minyan List */}
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredMinyans.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No minyans found for today</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredMinyans.map((minyan) => (
                <MinyanCard
                  key={minyan.id}
                  minyan={minyan}
                  isFavorite={isFavorite(minyan.synagogue_id)}
                  onToggleFavorite={() => toggleFavoriteMutation.mutate(minyan)}
                  onAddToCalendar={() => addToCalendar(minyan)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}