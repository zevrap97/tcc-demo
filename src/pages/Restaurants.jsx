import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Map, List } from 'lucide-react';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import RestaurantFilters from '@/components/restaurants/RestaurantFilters';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Restaurants() {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [filters, setFilters] = useState({
    certification: 'All',
    priceRange: 'All',
    maxDistance: 50,
  });

  const queryClient = useQueryClient();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', 'restaurant'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          return base44.entities.Favorite.filter({ 
            user_email: user.email, 
            item_type: 'restaurant' 
          });
        }
        return [];
      } catch {
        return [];
      }
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (restaurant) => {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      const existing = favorites.find(f => f.item_id === restaurant.id);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          item_type: 'restaurant',
          item_id: restaurant.id,
          item_name: restaurant.name,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const isFavorite = (id) => favorites.some(f => f.item_id === id);

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Search
    if (searchQuery && !restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Quick filter
    if (quickFilter === 'meat' && restaurant.type !== 'meat') return false;
    if (quickFilter === 'dairy' && restaurant.type !== 'dairy') return false;
    if (quickFilter === 'favorites' && !isFavorite(restaurant.id)) return false;

    // Advanced filters
    if (filters.certification !== 'All' && restaurant.kashrut_certification !== filters.certification) {
      return false;
    }
    if (filters.priceRange !== 'All' && restaurant.price_range !== filters.priceRange) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Kosher Restaurants</h1>
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters - Only show for list view */}
        {viewMode === 'list' && (
          <RestaurantFilters
            quickFilter={quickFilter}
            setQuickFilter={setQuickFilter}
            filters={filters}
            setFilters={setFilters}
          />
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No restaurants found</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isFavorite={isFavorite(restaurant.id)}
                    onToggleFavorite={() => toggleFavoriteMutation.mutate(restaurant)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        ) : (
          <div className="relative h-[70vh] rounded-2xl overflow-hidden">
            <MapContainer
              center={[41.8781, -87.6298]}
              zoom={12}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              {filteredRestaurants
                .filter(r => r.latitude && r.longitude)
                .map((restaurant) => (
                  <Marker
                    key={restaurant.id}
                    position={[restaurant.latitude, restaurant.longitude]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{restaurant.name}</p>
                        <p className="text-slate-500">{restaurant.kashrut_certification}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
            
            {/* Filters overlay on map */}
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-white rounded-2xl shadow-lg p-4">
              <RestaurantFilters
                quickFilter={quickFilter}
                setQuickFilter={setQuickFilter}
                filters={filters}
                setFilters={setFilters}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}