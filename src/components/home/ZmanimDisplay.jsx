import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Calendar } from 'lucide-react';

const defaultZmanim = [
  { key: 'alotHaShachar', label: 'Alot HaShachar' },
  { key: 'misheyakir', label: 'Misheyakir' },
  { key: 'sunrise', label: 'Sunrise' },
  { key: 'sofZmanShmaMGA', label: 'Shma (MGA)' },
  { key: 'sofZmanShma', label: 'Shma (GRA)' },
  { key: 'sofZmanTfillaMGA', label: 'Tefila (MGA)' },
  { key: 'sofZmanTfilla', label: 'Tefila (GRA)' },
  { key: 'chatzot', label: 'Chatzot' },
  { key: 'minchaGedola', label: 'Mincha Gedola' },
  { key: 'minchaKetana', label: 'Mincha Ketana' },
  { key: 'plagHamincha', label: 'Plag HaMincha' },
  { key: 'sunset', label: 'Sunset' },
  { key: 'tzeit7083deg', label: 'Tzeit (3 Stars)' }
];

const selectedDefault = ['sunrise', 'sofZmanShma', 'sofZmanTfilla', 'sunset', 'tzeit7083deg'];

export default function ZmanimDisplay({ selectedZmanim = selectedDefault }) {
  const [zmanimData, setZmanimData] = useState(null);
  const [hebrewDate, setHebrewDate] = useState(null);
  const [dafYomi, setDafYomi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    const fetchZmanim = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://www.hebcal.com/zmanim?cfg=json&zip=60645&tzid=America/Chicago'
        );
        const data = await response.json();
        setZmanimData(data.times);
        setHebrewDate(data.date?.hebrew);
        setDafYomi(data.dafyomi);
        setLoading(false);
      } catch (err) {
        setError('Failed to load zmanim');
        setLoading(false);
      }
    };

    fetchZmanim();
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const displayedZmanim = defaultZmanim.filter(z => selectedZmanim.includes(z.key));

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl shadow-lg overflow-hidden">
      {/* Header - Always Visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-white text-xl font-bold mb-1">Today's Times</h2>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{hebrewDate || 'Loading...'}</span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-slate-300" />
          </motion.div>
        </div>

        {/* Daf Yomi */}
        {dafYomi && (
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">Daf Yomi:</span>
            <span>{dafYomi}</span>
          </div>
        )}
      </div>

      {/* Expandable Zmanim Table */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="bg-slate-900/30 rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-4 text-center text-slate-400">Loading times...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-400">{error}</div>
                ) : (
                  <table className="w-full">
                    <tbody>
                      {displayedZmanim.map((zman, index) => (
                        <tr 
                          key={zman.key}
                          className={index !== displayedZmanim.length - 1 ? 'border-b border-slate-700/50' : ''}
                        >
                          <td className="py-3 px-4 text-slate-300 text-sm font-medium">
                            {zman.label}
                          </td>
                          <td className="py-3 px-4 text-right text-white font-semibold">
                            {formatTime(zmanimData?.[zman.key])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}