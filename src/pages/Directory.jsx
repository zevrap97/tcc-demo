import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ContactCard from '@/components/directory/ContactCard';
import { Search, BookUser, Briefcase } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const professionCategories = [
  'All',
  'Doctor',
  'Lawyer',
  'Accountant',
  'Real Estate',
  'Insurance',
  'Plumber',
  'Electrician',
  'Contractor',
  'Tutor',
  'Caterer',
  'Photographer',
  'Event Planner',
  'Other',
];

export default function Directory() {
  const [activeTab, setActiveTab] = useState('professionals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('All');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Tab filter
      if (activeTab === 'professionals' && contact.type !== 'business') return false;
      if (activeTab === 'phonebook' && contact.type !== 'person') return false;

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !contact.name.toLowerCase().includes(query) &&
          !contact.profession?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Profession filter (only for professionals)
      if (activeTab === 'professionals' && selectedProfession !== 'All') {
        if (contact.profession_category !== selectedProfession) return false;
      }

      return true;
    });
  }, [contacts, activeTab, searchQuery, selectedProfession]);

  // Check if user can view phone book
  const canViewPhonebook = user !== null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <h1 className="text-xl font-bold text-slate-800">Directory</h1>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 rounded-xl">
            <TabsTrigger 
              value="professionals" 
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Professionals
            </TabsTrigger>
            <TabsTrigger 
              value="phonebook" 
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookUser className="w-4 h-4 mr-2" />
              Phone Book
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professionals" className="mt-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Profession Filters */}
            <div className="flex flex-wrap gap-2">
              {professionCategories.map((profession) => (
                <motion.button
                  key={profession}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedProfession(profession)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    selectedProfession === profession
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {profession}
                </motion.button>
              ))}
            </div>

            {/* Contacts List */}
            <div className="space-y-3">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No professionals found</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          <TabsContent value="phonebook" className="mt-4 space-y-4">
            {!canViewPhonebook ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <BookUser className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium mb-2">Login Required</p>
                <p className="text-slate-500 text-sm mb-4">
                  Please log in to access the community phone book
                </p>
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium"
                >
                  Log In
                </button>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Contacts List */}
                <div className="space-y-3">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No contacts found</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredContacts.map((contact) => (
                        <ContactCard key={contact.id} contact={contact} />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}