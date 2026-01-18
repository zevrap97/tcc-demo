import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

export default function RestaurantFilters({ 
  quickFilter, 
  setQuickFilter, 
  filters, 
  setFilters 
}) {
  const quickFilters = [
    { key: 'all', label: 'All' },
    { key: 'meat', label: '🥩 Meat' },
    { key: 'dairy', label: '🧀 Dairy' },
    { key: 'favorites', label: '❤️ Favorites' },
  ];

  const certifications = ['All', 'cRc', 'OU', 'OK', 'Star-K', 'Other'];
  const priceRanges = ['All', '$', '$$', '$$$', '$$$$'];

  return (
    <div className="space-y-3">
      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {quickFilters.map(({ key, label }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setQuickFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              quickFilter === key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Advanced Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
            <SlidersHorizontal className="w-4 h-4" />
            More Filters
            {(filters.certification !== 'All' || filters.priceRange !== 'All' || filters.maxDistance < 50) && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 py-4">
            {/* Certification */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Kashrut Certification
              </label>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <button
                    key={cert}
                    onClick={() => setFilters({ ...filters, certification: cert })}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      filters.certification === cert
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Price Range
              </label>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((price) => (
                  <button
                    key={price}
                    onClick={() => setFilters({ ...filters, priceRange: price })}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      filters.priceRange === price
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Max Distance: {filters.maxDistance} miles
              </label>
              <Slider
                value={[filters.maxDistance]}
                onValueChange={(value) => setFilters({ ...filters, maxDistance: value[0] })}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ certification: 'All', priceRange: 'All', maxDistance: 50 })}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}