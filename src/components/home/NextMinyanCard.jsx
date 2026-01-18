import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, MapPin, ArrowRight } from 'lucide-react';

export default function NextMinyanCard() {
  const { data: minyanim = [] } = useQuery({
    queryKey: ['minyanim'],
    queryFn: () => base44.entities.Minyan.filter({ is_active: true }),
  });

  const getNextMinyan = () => {
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let nextMinyan = null;
    let minTimeDiff = Infinity;

    minyanim.forEach((minyan) => {
      if (!minyan.day_of_week?.includes(currentDay)) return;

      const [hours, minutes] = minyan.time.split(':').map(Number);
      const minyanTime = hours * 60 + minutes;
      const timeDiff = minyanTime - currentTime;

      if (timeDiff > 0 && timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        nextMinyan = { ...minyan, minutesUntil: timeDiff };
      }
    });

    return nextMinyan;
  };

  const nextMinyan = getNextMinyan();

  if (!nextMinyan) return null;

  const handleGoClick = () => {
    if (nextMinyan.latitude && nextMinyan.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${nextMinyan.latitude},${nextMinyan.longitude}`, '_blank');
    } else if (nextMinyan.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextMinyan.address)}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-5 text-white shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-2">Next Minyan</p>
          <h2 className="text-2xl font-bold mb-3">{nextMinyan.prayer_type}</h2>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-200" />
              <span className="text-base font-semibold">{nextMinyan.time}</span>
              <span className="px-2 py-0.5 bg-blue-500/40 rounded-full text-xs">
                {nextMinyan.nusach}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-200" />
              <span className="text-sm">{nextMinyan.synagogue_name}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="text-4xl font-bold">{nextMinyan.minutesUntil}</div>
            <div className="text-xs text-blue-100">minutes</div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGoClick}
            className="flex items-center gap-1 px-4 py-2 bg-white text-blue-600 rounded-full font-semibold text-sm"
          >
            <span>Go</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}