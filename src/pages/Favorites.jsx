import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Heart, UtensilsCrossed, Building2, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

  const deleteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      await base44.entities.Favorite.delete(favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allFavorites']);
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const restaurantFavorites = favorites.filter(f => f.item_type === 'restaurant');
  const synagogueFavorites = favorites.filter(f => f.item_type === 'synagogue');

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
              restaurantFavorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="font-medium text-slate-800">{favorite.item_name}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(favorite.id)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
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
              synagogueFavorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="font-medium text-slate-800">{favorite.item_name}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(favorite.id)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}