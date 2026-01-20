import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MinyanCard from '@/components/minyan/MinyanCard';
import NextMinyanBanner from '@/components/minyan/NextMinyanBanner';
import { Clock, Heart, Filter, MapPin } from 'lucide-react';

export default function MinyanContent() {
  const [quickFilter, setQuickFilter] = useState('all');
  const [nusachFilter, setNusachFilter] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 41.8781, lng: -87.6298 });
        }
      );
    } else {
      setUserLocation({ lat: 41.8781, lng: -87.6298 });
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
    
    const endTime = new Date(today.getTime() + 30 * 60000);
    
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(minyan.prayer_type + ' at ' + minyan.synagogue_name)}&dates=${formatDate(today)}/${formatDate(endTime)}&location=${encodeURIComponent(minyan.address || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const filteredMinyans = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return minyans
      .filter((minyan) => {
        if (!minyan.day_of_week?.includes(currentDay)) return false;
        if (nusachFilter !== 'All' && minyan.nusach !== nusachFilter) return false;

        if (quickFilter === 'within10') {
          if (!userLocation || !minyan.latitude || !minyan.longitude) return false;
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            minyan.latitude,
            minyan.longitude
          );
          if (distance > 5) return false;
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
  }, [minyans, quickFilter, nusachFilter, currentDay, favorites, userLocation]);

  const nextMinyan = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const allTodayMinyans = minyans.filter((minyan) => {
      if (!minyan.day_of_week?.includes(currentDay)) return false;
      if (nusachFilter !== 'All' && minyan.nusach !== nusachFilter) return false;
      return true;
    });

    return allTodayMinyans.find((minyan) => {
      const [hours, minutes] = minyan.time.split(':').map(Number);
      const minyanMinutes = hours * 60 + minutes;
      return minyanMinutes > currentMinutes;
    });
  }, [minyans, currentDay, nusachFilter]);

  const quickFilters = [
    { key: 'all', label: 'All', icon: Filter },
    { key: 'within10', label: '10m Drive', icon: MapPin },
    { key: 'favorites', label: 'Favorites', icon: Heart },
  ];

  const nusachOptions = ['All', 'Ashkenaz', 'Sefard', 'Edot HaMizrach', 'Chabad'];

  return (
    <div className="space-y-4">
      {nextMinyan && <NextMinyanBanner minyan={nextMinyan} />}

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
            {filteredMinyans.map((minyan) => {
              const distance = userLocation && minyan.latitude && minyan.longitude
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    minyan.latitude,
                    minyan.longitude
                  ).toFixed(1)
                : null;
              
              return (
                <MinyanCard
                  key={minyan.id}
                  minyan={minyan}
                  isFavorite={isFavorite(minyan.synagogue_id)}
                  onToggleFavorite={() => toggleFavoriteMutation.mutate(minyan)}
                  onAddToCalendar={() => addToCalendar(minyan)}
                  distance={distance}
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}