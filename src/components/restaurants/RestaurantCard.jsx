import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Navigation, 
  ShoppingBag, 
  CalendarPlus, 
  Clock, 
  Heart,
  Star
} from 'lucide-react';

export default function RestaurantCard({ restaurant, isFavorite, onToggleFavorite }) {
  const [expanded, setExpanded] = useState(false);

  const openGoogleMaps = () => {
    const address = encodeURIComponent(restaurant.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  const formatHours = (hours) => {
    if (!hours) return 'Hours not available';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Closed';
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div 
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
          {restaurant.image_url ? (
            <img 
              src={restaurant.image_url} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🍽️
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 text-base">{restaurant.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {restaurant.short_description}
              </p>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              className="text-slate-400 mt-1"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Quick Info */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              restaurant.type === 'meat' ? 'bg-red-100 text-red-700' :
              restaurant.type === 'dairy' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {restaurant.type}
            </span>
            <span className="text-xs text-slate-500">
              {restaurant.kashrut_certification}
            </span>
            <span className="text-xs text-slate-400">{restaurant.price_range}</span>
          </div>

          {/* Open Status */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`flex items-center gap-1 text-xs font-medium ${
              restaurant.is_open_now ? 'text-green-600' : 'text-red-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                restaurant.is_open_now ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {restaurant.is_open_now ? 'Open' : 'Closed'}
            </span>
            <span className="text-xs text-slate-400">
              • {formatHours(restaurant.opening_hours)}
            </span>
          </div>
        </div>
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
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={openGoogleMaps}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-blue-50 text-blue-600"
                >
                  <Navigation className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Navigate</span>
                </motion.button>

                {restaurant.accepts_online_orders && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => restaurant.order_url && window.open(restaurant.order_url, '_blank')}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-green-50 text-green-600"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Order</span>
                  </motion.button>
                )}

                {restaurant.accepts_reservations && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-purple-50 text-purple-600"
                  >
                    <CalendarPlus className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Reserve</span>
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(restaurant);
                  }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl ${
                    isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-medium">Favorite</span>
                </motion.button>
              </div>

              {/* Hours */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}