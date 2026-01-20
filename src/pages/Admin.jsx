import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Download, 
  Eye, 
  Building2, 
  UtensilsCrossed,
  Clock,
  Image,
  ArrowLeft,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StoryManager from '@/components/admin/StoryManager';
import BusinessManager from '@/components/admin/BusinessManager';
import MinyanManager from '@/components/admin/MinyanManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import NewsManager from '@/components/admin/NewsManager';
import ZmanimManager from '@/components/admin/ZmanimManager';
import ZmanimDisplay from '@/components/home/ZmanimDisplay';

export default function Admin() {
  const [loading, setLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Redirect non-admin users
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-4">You need admin privileges to access this page</p>
          <Link to={createPageUrl('Home')} className="text-blue-600 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const synagogues = await base44.entities.Synagogue.list();
      const restaurants = await base44.entities.Restaurant.list();
      const contacts = await base44.entities.Contact.list();
      const stories = await base44.entities.Story.list();
      const users = await base44.entities.User.list();
      
      return {
        totalSynagogues: synagogues.length,
        totalRestaurants: restaurants.length,
        totalContacts: contacts.length,
        totalStories: stories.length,
        totalUsers: users.length,
      };
    },
  });

  const statsCards = [
    { title: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { title: 'Synagogues', value: analytics?.totalSynagogues || 0, icon: Building2, color: 'bg-purple-100 text-purple-600' },
    { title: 'Restaurants', value: analytics?.totalRestaurants || 0, icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600' },
    { title: 'Directory Contacts', value: analytics?.totalContacts || 0, icon: Users, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Home')}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                <p className="text-sm text-blue-100">Manage your app and view analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
              <Activity className="w-5 h-5" />
              Admin
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="businesses" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="minyans">Minyans</TabsTrigger>
            <TabsTrigger value="zmanim">Zmanim</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Directory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <BusinessManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="minyans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minyan Time Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MinyanManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="zmanim" className="space-y-4">
            <ZmanimDisplay />
            <Card>
              <CardHeader>
                <CardTitle>Zmanim & Daf Yomi Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ZmanimManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community News</CardTitle>
              </CardHeader>
              <CardContent>
                <NewsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stories & Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <StoryManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}