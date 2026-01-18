import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Navigation, 
  CalendarPlus, 
  Heart,
  MapPin,
  User,
  Clock,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SynagogueCard({ 
  synagogue, 
  nextPrayers = [], 
  isFavorite, 
  onToggleFavorite,
  onAddToCalendar 
}) {
  const [expanded, setExpanded] = useState(false);

  const openGoogleMaps = () => {
    const address = encodeURIComponent(synagogue.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-base">{synagogue.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{synagogue.address}</span>
            </div>
            {synagogue.rabbi && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                <User className="w-3 h-3" />
                <span>Rabbi {synagogue.rabbi}</span>
              </div>
            )}
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-slate-400 mt-1"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Nusach Badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
            {synagogue.nusach}
          </span>
        </div>

        {/* Next Prayers */}
        {nextPrayers.length > 0 && (
          <div className="flex items-center gap-3 mt-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <div className="flex gap-2">
              {nextPrayers.slice(0, 2).map((prayer, idx) => (
                <span key={idx} className="text-xs text-slate-600">
                  <span className="font-medium">{prayer.type}</span>
                  <span className="text-slate-400 ml-1">{prayer.time}</span>
                </span>
              ))}
            </div>
          </div>
        )}
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
              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(synagogue);
                  }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl ${
                    isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-medium">Favorite</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddToCalendar(synagogue)}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-purple-50 text-purple-600"
                >
                  <CalendarPlus className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Calendar</span>
                </motion.button>

                <Link
                  to={createPageUrl(`SynagogueDetail?id=${synagogue.id}`)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-blue-50 text-blue-600"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Details</span>
                </Link>

                {synagogue.donation_url && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(synagogue.donation_url, '_blank')}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-green-50 text-green-600"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Donate</span>
                  </motion.button>
                )}
              </div>

              {/* Navigate Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={openGoogleMaps}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium"
              >
                <Navigation className="w-4 h-4" />
                Navigate to Synagogue
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}