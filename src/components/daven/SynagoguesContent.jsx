import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SynagogueCard from '@/components/synagogue/SynagogueCard';
import { Search, Heart, MapPin, Filter, Map, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SynagoguesContent() {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [nusachFilter, setNusachFilter] = useState('All');
  const [calendarDialog, setCalendarDialog] = useState({ open: false, synagogue: null });
  const queryClient = useQueryClient();

  const { data: synagogues = [], isLoading } = useQuery({
    queryKey: ['synagogues'],
    queryFn: () => base44.entities.Synagogue.list(),
  });

  const { data: minyans = [] } = useQuery({
    queryKey: ['allMinyans'],
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
    mutationFn: async (synagogue) => {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      const existing = favorites.find(f => f.item_id === synagogue.id);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          item_type: 'synagogue',
          item_id: synagogue.id,
          item_name: synagogue.name,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
    },
  });

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

  const filteredSynagogues = useMemo(() => {
    return synagogues.filter((synagogue) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !synagogue.name.toLowerCase().includes(query) &&
          !synagogue.address?.toLowerCase().includes(query) &&
          !synagogue.rabbi?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (quickFilter === 'favorites' && !isFavorite(synagogue.id)) {
        return false;
      }

      if (nusachFilter !== 'All' && synagogue.nusach !== nusachFilter) {
        return false;
      }

      return true;
    });
  }, [synagogues, searchQuery, quickFilter, nusachFilter, favorites]);

  const quickFilters = [
    { key: 'all', label: 'All', icon: Filter },
    { key: 'favorites', label: 'Favorites', icon: Heart },
    { key: 'nearby', label: 'Within 10min', icon: MapPin },
  ];

  const nusachOptions = ['All', 'Ashkenaz', 'Sefard', 'Edot HaMizrach', 'Chabad'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}
          >
            <List className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}
          >
            <Map className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search synagogues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

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

      {viewMode === 'list' ? (
        <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : filteredSynagogues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No synagogues found</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredSynagogues.map((synagogue) => (
              <SynagogueCard
                key={synagogue.id}
                synagogue={synagogue}
                nextPrayers={getNextPrayers(synagogue.id)}
                isFavorite={isFavorite(synagogue.id)}
                onToggleFavorite={() => toggleFavoriteMutation.mutate(synagogue)}
                onAddToCalendar={() => setCalendarDialog({ open: true, synagogue })}
              />
            ))}
          </AnimatePresence>
        )}
        </div>
      ) : (
        <div className="h-[60vh] rounded-2xl overflow-hidden">
          <MapContainer
            center={[41.8781, -87.6298]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            {filteredSynagogues
              .filter(s => s.latitude && s.longitude)
              .map((synagogue) => (
                <Marker
                  key={synagogue.id}
                  position={[synagogue.latitude, synagogue.longitude]}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{synagogue.name}</p>
                      <p className="text-slate-500">{synagogue.nusach}</p>
                      {synagogue.rabbi && (
                        <p className="text-xs text-slate-400">Rabbi {synagogue.rabbi}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      )}

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