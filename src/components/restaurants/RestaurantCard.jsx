import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Navigation, 
  ShoppingBag, 
  CalendarPlus, 
  Clock, 
  Heart,
  Award
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function RestaurantCard({ restaurant, isFavorite, onToggleFavorite }) {
  const [expanded, setExpanded] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);

  const openGoogleMaps = () => {
    const address = encodeURIComponent(restaurant.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  const formatHours = (hours) => {
    if (!hours) return 'Hours not available';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Closed';
  };

  const handleReserve = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank');
    }
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Image/Logo */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
          {restaurant.image_url ? (
            <img 
              src={restaurant.image_url} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              🍽️
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Type */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 text-base">{restaurant.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              restaurant.type === 'meat' ? 'bg-red-100 text-red-700' :
              restaurant.type === 'dairy' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {restaurant.type}
            </span>
          </div>

          {/* Hours and Open Status */}
          <div className="mt-1">
            <p className="text-xs text-slate-500">
              {formatHours(restaurant.opening_hours)}
            </p>
            <span className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${
              restaurant.is_open_now ? 'text-green-600' : 'text-red-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                restaurant.is_open_now ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {restaurant.is_open_now ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Expand Arrow */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </motion.div>
        </motion.button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
              {/* Kashrut Certification */}
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Kashrut</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{restaurant.kashrut_certification}</p>
              </div>

              {/* Opening Hours */}
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Opening Hours</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  {restaurant.opening_hours ? (
                    Object.entries(restaurant.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span>{hours}</span>
                      </div>
                    ))
                  ) : (
                    <p>Hours not available</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={openGoogleMaps}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </Button>

                {restaurant.accepts_online_orders && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrderMenuOpen(true);
                    }}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Order
                  </Button>
                )}

                {restaurant.accepts_reservations && (
                  <Button
                    onClick={handleReserve}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Reserve Table
                  </Button>
                )}

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(restaurant);
                  }}
                  variant={isFavorite ? "default" : "outline"}
                  className={`flex items-center justify-center gap-2 ${
                    isFavorite ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Menu Dialog */}
      <Dialog open={orderMenuOpen} onOpenChange={setOrderMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order from {restaurant.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {restaurant.order_url && (
              <Button
                onClick={() => {
                  window.open(restaurant.order_url, '_blank');
                  setOrderMenuOpen(false);
                }}
                className="w-full"
                variant="outline"
              >
                Order via Website
              </Button>
            )}
            <Button
              onClick={() => {
                window.open(`https://www.ubereats.com/search?q=${encodeURIComponent(restaurant.name)}`, '_blank');
                setOrderMenuOpen(false);
              }}
              className="w-full"
              variant="outline"
            >
              Order via Uber Eats
            </Button>
            <Button
              onClick={() => {
                window.open(`https://www.doordash.com/search/?query=${encodeURIComponent(restaurant.name)}`, '_blank');
                setOrderMenuOpen(false);
              }}
              className="w-full"
              variant="outline"
            >
              Order via DoorDash
            </Button>
            <Button
              onClick={() => {
                window.open(`https://www.grubhub.com/search?searchTerm=${encodeURIComponent(restaurant.name)}`, '_blank');
                setOrderMenuOpen(false);
              }}
              className="w-full"
              variant="outline"
            >
              Order via Grubhub
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}