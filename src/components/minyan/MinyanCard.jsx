import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Navigation, 
  CalendarPlus, 
  Heart,
  Clock,
  MapPin
} from 'lucide-react';

export default function MinyanCard({ minyan, isFavorite, onToggleFavorite, onAddToCalendar, distance }) {
  const [expanded, setExpanded] = useState(false);

  const getTimeUntil = () => {
    const now = new Date();
    const [hours, minutes] = minyan.time.split(':').map(Number);
    const minyanTime = new Date();
    minyanTime.setHours(hours, minutes, 0, 0);
    
    if (minyanTime < now) {
      minyanTime.setDate(minyanTime.getDate() + 1);
    }
    
    const diff = minyanTime - now;
    const minutesUntil = Math.floor(diff / 60000);
    
    if (minutesUntil < 60) {
      return `${minutesUntil}m`;
    } else {
      const hoursUntil = Math.floor(minutesUntil / 60);
      return `${hoursUntil}h ${minutesUntil % 60}m`;
    }
  };

  const getTimeColor = () => {
    const now = new Date();
    const [hours, minutes] = minyan.time.split(':').map(Number);
    const minyanTime = new Date();
    minyanTime.setHours(hours, minutes, 0, 0);

    if (minyanTime < now) {
      minyanTime.setDate(minyanTime.getDate() + 1);
    }

    const diffMinutes = Math.floor((minyanTime - now) / 60000);

    if (diffMinutes < 10) return 'text-red-600';
    if (diffMinutes < 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(minyan.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div 
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Time Badge */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex flex-col items-center justify-center text-white">
          <span className="text-lg font-bold">{formatTime(minyan.time).split(' ')[0]}</span>
          <span className="text-[10px] font-medium opacity-80">{formatTime(minyan.time).split(' ')[1]}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800">{minyan.synagogue_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
              {minyan.prayer_type}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium">
              {minyan.nusach}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className={`flex items-center gap-1 font-medium ${getTimeColor()}`}>
              <Clock className="w-3 h-3" />
              Starts in {getTimeUntil()}
            </span>
            {distance && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3" />
                  ~{distance} mi
                </span>
              </>
            )}
          </div>
        </div>

        {/* Expand Arrow */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-slate-400"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
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
              {/* Address */}
              <div className="flex items-start gap-2 mb-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                <span>{minyan.address}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={openGoogleMaps}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-blue-50 text-blue-600"
                >
                  <Navigation className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Go</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCalendar();
                  }}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-purple-50 text-purple-600"
                >
                  <CalendarPlus className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Calendar</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(minyan);
                  }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl ${
                    isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-medium">Favorite</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}