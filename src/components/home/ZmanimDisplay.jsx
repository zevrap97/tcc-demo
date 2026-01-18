import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Sunrise, Calendar } from 'lucide-react';

const defaultZmanim = [
  { key: 'alot', label: 'Alot HaShachar', icon: Sunrise },
  { key: 'sunrise', label: 'Sunrise', icon: Sun },
  { key: 'sofZmanShma', label: 'Sof Zman Shma', icon: Sun },
  { key: 'sofZmanTefilla', label: 'Sof Zman Tefilla', icon: Sun },
  { key: 'chatzot', label: 'Chatzot', icon: Sun },
  { key: 'minchaGedola', label: 'Mincha Gedola', icon: Sun },
  { key: 'minchaKetana', label: 'Mincha Ketana', icon: Sunset },
  { key: 'plagHamincha', label: 'Plag HaMincha', icon: Sunset },
  { key: 'sunset', label: 'Sunset', icon: Sunset },
  { key: 'tzait', label: 'Tzait HaKochavim', icon: Moon },
];

export default function ZmanimDisplay({ selectedZmanim }) {
  const [zmanimTimes, setZmanimTimes] = useState({});
  const [hebrewDate, setHebrewDate] = useState('');
  const [dafYomi, setDafYomi] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZmanim = async () => {
      try {
        // Chicago coordinates
        const lat = 41.8781;
        const lng = -87.6298;
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Fetch from Hebcal API
        const response = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lng}&date=${dateStr}&tzid=America/Chicago`
        );
        const data = await response.json();

        // Map API response to our format
        const times = {
          alot: formatTime(data.times?.alotHaShachar),
          sunrise: formatTime(data.times?.sunrise),
          sofZmanShma: formatTime(data.times?.sofZmanShmaMGA),
          sofZmanTefilla: formatTime(data.times?.sofZmanTfillaMGA),
          chatzot: formatTime(data.times?.chatzot),
          minchaGedola: formatTime(data.times?.minchaGedola),
          minchaKetana: formatTime(data.times?.minchaKetana),
          plagHamincha: formatTime(data.times?.plagHaMincha),
          sunset: formatTime(data.times?.sunset),
          tzait: formatTime(data.times?.tzeit),
        };
        setZmanimTimes(times);

        // Fetch Hebrew date and Daf Yomi
        const hebcalResponse = await fetch(
          `https://www.hebcal.com/converter?cfg=json&date=${dateStr}&g2h=1&strict=1`
        );
        const hebcalData = await hebcalResponse.json();
        setHebrewDate(hebcalData.hebrew || '');

        // Fetch Daf Yomi
        const dafResponse = await fetch(
          `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&tzid=America/Chicago&M=on`
        );
        const dafData = await dafResponse.json();
        const dafItem = dafData.items?.find(item => item.category === 'dafyomi');
        setDafYomi(dafItem?.title?.replace('Daf Yomi: ', '') || 'Loading...');

      } catch (error) {
        console.log('Error fetching zmanim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZmanim();
  }, []);

  const formatTime = (isoTime) => {
    if (!isoTime) return '--:--';
    const date = new Date(isoTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const displayZmanim = selectedZmanim?.length > 0 
    ? defaultZmanim.filter(z => selectedZmanim.includes(z.key))
    : defaultZmanim;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl p-5 text-white shadow-lg">
      {/* Header with Hebrew Date */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Today's Times</p>
          <p className="text-lg font-bold mt-0.5" dir="rtl">{hebrewDate || 'Loading...'}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Daf Yomi */}
      <div className="bg-white/15 rounded-xl px-4 py-2.5 mb-4">
        <p className="text-xs text-white/70">Daf Yomi</p>
        <p className="font-semibold">{dafYomi}</p>
      </div>

      {/* Zmanim Grid */}
      <div className="grid grid-cols-2 gap-2">
        {displayZmanim.map(({ key, label, icon: Icon }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2"
          >
            <Icon className="w-4 h-4 text-white/70" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/70 truncate">{label}</p>
              <p className="font-semibold text-sm">
                {loading ? '--:--' : zmanimTimes[key] || '--:--'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}