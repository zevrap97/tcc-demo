import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, UtensilsCrossed, Clock, Heart, BookUser } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', page: 'Home' },
  { icon: UtensilsCrossed, label: 'Food', page: 'Restaurants' },
  { icon: Heart, label: 'Favorites', page: 'Favorites' },
  { icon: Clock, label: 'Daven', page: 'Daven' },
  { icon: BookUser, label: 'Directory', page: 'Directory' },
];

export default function BottomNav() {
  const location = useLocation();
  
  const isActive = (page) => {
    const currentPath = location.pathname.toLowerCase();
    return currentPath.includes(page.toLowerCase()) || 
           (page === 'Home' && currentPath === '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, page }) => (
          <Link
            key={page}
            to={createPageUrl(page)}
            className="flex flex-col items-center justify-center flex-1 py-2 relative"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center ${
                isActive(page) ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              {isActive(page) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-12 h-1 bg-blue-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className={label === 'Favorites' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3 shadow-lg flex flex-col items-center gap-1' : ''}>
                <Icon 
                  className={`${label === 'Favorites' ? 'w-7 h-7' : 'w-5 h-5'} ${isActive(page) ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} 
                  style={label === 'Favorites' ? { color: 'white' } : {}}
                />
                {label === 'Favorites' && (
                  <span className="text-[9px] font-semibold text-white">Favorites</span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${
                isActive(page) ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </nav>
  );
}