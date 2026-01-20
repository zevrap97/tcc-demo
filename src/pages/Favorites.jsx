import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Heart, UtensilsCrossed, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import SynagogueCard from '@/components/synagogue/SynagogueCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Favorites() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['allFavorites', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Favorite.filter({ user_email: user.email });
    },
    enabled: !!user,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: synagogues = [] } = useQuery({
    queryKey: ['synagogues'],
    queryFn: () => base44.entities.Synagogue.list(),
  });

  const { data: minyans = [] } = useQuery({
    queryKey: ['allMinyans'],
    queryFn: () => base44.entities.Minyan.filter({ is_active: true }),
  });

  const [calendarDialog, setCalendarDialog] = React.useState({ open: false, synagogue: null });

  const deleteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      await base44.entities.Favorite.delete(favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allFavorites']);
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const toggleFavorite = (item, itemType) => {
    const existing = favorites.find(f => f.item_id === item.id);
    if (existing) {
      deleteMutation.mutate(existing.id);
    }
  };

  const isFavorite = (id) => favorites.some(f => f.item_id === id);

  const getNextPrayers = (synagogueId) => {
    const synagogueMinyans = minyans.filter(m => m.synagogue_id === synagogueId);
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return synagogueMinyans
      .filter(m => m.day_of_week?.includes(currentDay))
      .filter(m => {
        const [hours, minutes] = m.time.split(':').map(Number);
        return hours * 60 + minutes > currentMinutes;
      })
      .sort((a, b) => {
        const [aH, aM] = a.time.split(':').map(Number);
        const [bH, bM] = b.time.split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      })
      .slice(0, 2)
      .map(m => ({
        type: m.prayer_type,
        time: formatTime(m.time),
      }));
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const addPrayerToCalendar = (prayer, synagogue) => {
    const [hours, minutes] = prayer.time.includes('PM') || prayer.time.includes('AM')
      ? convertTo24Hour(prayer.time)
      : prayer.time.split(':').map(Number);
    
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(today.getTime() + 30 * 60000);
    
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(prayer.type + ' at ' + synagogue.name)}&dates=${formatDate(today)}/${formatDate(endTime)}&location=${encodeURIComponent(synagogue.address || '')}`;
    
    window.open(calendarUrl, '_blank');
    setCalendarDialog({ open: false, synagogue: null });
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return [hours, minutes];
  };

  const restaurantFavorites = favorites
    .filter(f => f.item_type === 'restaurant')
    .map(f => restaurants.find(r => r.id === f.item_id))
    .filter(Boolean);
    
  const synagogueFavorites = favorites
    .filter(f => f.item_type === 'synagogue')
    .map(f => synagogues.find(s => s.id === f.item_id))
    .filter(Boolean);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">Please log in to view your favorites</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-4 px-4">
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <h1 className="text-xl font-bold text-slate-800">My Favorites</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 rounded-xl mb-4">
            <TabsTrigger 
              value="restaurants" 
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Restaurants ({restaurantFavorites.length})
            </TabsTrigger>
            <TabsTrigger 
              value="synagogues" 
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Synagogues ({synagogueFavorites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              ))
            ) : restaurantFavorites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No favorite restaurants yet</p>
                <Link
                  to={createPageUrl('Restaurants')}
                  className="inline-block mt-4 text-blue-600 font-medium"
                >
                  Browse Restaurants
                </Link>
              </div>
            ) : (
              restaurantFavorites.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(restaurant, 'restaurant')}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="synagogues" className="space-y-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              ))
            ) : synagogueFavorites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No favorite synagogues yet</p>
                <Link
                  to={createPageUrl('Synagogues')}
                  className="inline-block mt-4 text-blue-600 font-medium"
                >
                  Browse Synagogues
                </Link>
              </div>
            ) : (
              synagogueFavorites.map((synagogue) => (
                <SynagogueCard
                  key={synagogue.id}
                  synagogue={synagogue}
                  nextPrayers={getNextPrayers(synagogue.id)}
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(synagogue, 'synagogue')}
                  onAddToCalendar={() => setCalendarDialog({ open: true, synagogue })}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Calendar Selection Dialog */}
      <Dialog open={calendarDialog.open} onOpenChange={(open) => setCalendarDialog({ ...calendarDialog, open })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {calendarDialog.synagogue && getNextPrayers(calendarDialog.synagogue.id).map((prayer, idx) => (
              <button
                key={idx}
                onClick={() => addPrayerToCalendar(prayer, calendarDialog.synagogue)}
                className="w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <p className="font-medium text-slate-800">{prayer.type}</p>
                <p className="text-sm text-slate-500">{prayer.time}</p>
              </button>
            ))}
            {calendarDialog.synagogue && getNextPrayers(calendarDialog.synagogue.id).length === 0 && (
              <p className="text-center text-slate-500 py-4">No upcoming prayers today</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}