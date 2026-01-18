import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Navigation } from 'lucide-react';

export default function NextMinyanBanner({ minyan }) {
  if (!minyan) return null;

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
    
    return minutesUntil;
  };

  const minutesUntil = getTimeUntil();

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(minyan.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-navy-600 to-blue-700 rounded-2xl p-4 text-white"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Next Minyan</p>
          <h3 className="font-bold text-lg mt-1">{minyan.prayer_type}</h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium">{formatTime(minyan.time)}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
              {minyan.nusach}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{minyan.synagogue_name}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-white/20 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{minutesUntil}</span>
            <span className="text-[10px] text-white/80">min</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openGoogleMaps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-blue-700 text-xs font-semibold"
          >
            <Navigation className="w-3.5 h-3.5" />
            Go
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}