import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { TrendingUp, Eye, Heart, Users, Clock, UtensilsCrossed, Building2, Calendar, Activity, Star, MapPin, BookUser } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { data: stories = [] } = useQuery({
    queryKey: ['allStories'],
    queryFn: () => base44.entities.Story.list(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['allFavorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: synagogues = [] } = useQuery({
    queryKey: ['synagogues'],
    queryFn: () => base44.entities.Synagogue.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: minyans = [] } = useQuery({
    queryKey: ['minyans'],
    queryFn: () => base44.entities.Minyan.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const { data: news = [] } = useQuery({
    queryKey: ['news'],
    queryFn: () => base44.entities.News.list(),
  });

  const { data: zmanim = [] } = useQuery({
    queryKey: ['zmanim'],
    queryFn: () => base44.entities.Zmanim.list(),
  });

  // Story performance data
  const topStories = [...stories]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5)
    .map(s => ({
      name: s.title && s.title.length > 20 ? s.title.substring(0, 20) + '...' : (s.title || 'Untitled'),
      views: s.view_count || 0,
    }));

  // Favorite distribution
  const favoriteTypes = [
    { name: 'Restaurants', value: favorites.filter(f => f.item_type === 'restaurant').length, color: '#3b82f6' },
    { name: 'Synagogues', value: favorites.filter(f => f.item_type === 'synagogue').length, color: '#8b5cf6' },
  ];

  // Most favorited items
  const favoriteCounts = favorites.reduce((acc, fav) => {
    acc[fav.item_id] = (acc[fav.item_id] || 0) + 1;
    return acc;
  }, {});

  const topFavorited = Object.entries(favoriteCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const item = favorites.find(f => f.item_id === id);
      return {
        name: item?.item_name || 'Unknown',
        count: count || 0,
      };
    });
  
  const maxFavoriteCount = topFavorited.length > 0 ? topFavorited[0].count : 1;

  // User growth (mock data based on created dates)
  const userGrowth = users.reduce((acc, user) => {
    if (user.created_date) {
      const date = new Date(user.created_date);
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + 1;
      }
    }
    return acc;
  }, {});

  const userGrowthData = Object.entries(userGrowth)
    .slice(-6)
    .map(([month, count]) => ({ month, users: count }));

  const totalStoryViews = stories.reduce((sum, s) => sum + (s.view_count || 0), 0);
  const avgStoryViews = stories.length > 0 ? Math.round(totalStoryViews / stories.length) : 0;

  // Restaurant type distribution
  const restaurantTypes = [
    { name: 'Meat', value: restaurants.filter(r => r.type === 'meat').length, color: '#ef4444' },
    { name: 'Dairy', value: restaurants.filter(r => r.type === 'dairy').length, color: '#3b82f6' },
    { name: 'Pareve', value: restaurants.filter(r => r.type === 'pareve').length, color: '#10b981' },
  ];

  // Synagogue nusach distribution
  const nusachData = [
    { nusach: 'Ashkenaz', count: synagogues.filter(s => s.nusach === 'Ashkenaz').length },
    { nusach: 'Sefard', count: synagogues.filter(s => s.nusach === 'Sefard').length },
    { nusach: 'Edot HaMizrach', count: synagogues.filter(s => s.nusach === 'Edot HaMizrach').length },
    { nusach: 'Chabad', count: synagogues.filter(s => s.nusach === 'Chabad').length },
    { nusach: 'Other', count: synagogues.filter(s => s.nusach === 'Other').length },
  ].filter(n => n.count > 0);

  // Minyan times distribution
  const minyanByPrayer = [
    { type: 'Shacharit', count: minyans.filter(m => m.prayer_type === 'Shacharit').length },
    { type: 'Mincha', count: minyans.filter(m => m.prayer_type === 'Mincha').length },
    { type: 'Maariv', count: minyans.filter(m => m.prayer_type === 'Maariv').length },
    { type: 'Selichot', count: minyans.filter(m => m.prayer_type === 'Selichot').length },
  ].filter(m => m.count > 0);

  // Contact profession distribution
  const professionData = contacts.reduce((acc, contact) => {
    const category = contact.profession_category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topProfessions = Object.entries(professionData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([category, count]) => ({ category, count }));

  // Activity overview - radar chart data
  const activityData = [
    { category: 'Restaurants', count: restaurants.length, fullMark: Math.max(restaurants.length, synagogues.length, contacts.length, minyans.length, stories.length) },
    { category: 'Synagogues', count: synagogues.length, fullMark: Math.max(restaurants.length, synagogues.length, contacts.length, minyans.length, stories.length) },
    { category: 'Contacts', count: contacts.length, fullMark: Math.max(restaurants.length, synagogues.length, contacts.length, minyans.length, stories.length) },
    { category: 'Minyans', count: minyans.length, fullMark: Math.max(restaurants.length, synagogues.length, contacts.length, minyans.length, stories.length) },
    { category: 'Stories', count: stories.length, fullMark: Math.max(restaurants.length, synagogues.length, contacts.length, minyans.length, stories.length) },
  ];

  // News activity
  const activeNews = news.filter(n => n.is_active).length;

  // Price range distribution for restaurants
  const priceRangeData = [
    { range: '$', count: restaurants.filter(r => r.price_range === '$').length },
    { range: '$$', count: restaurants.filter(r => r.price_range === '$$').length },
    { range: '$$$', count: restaurants.filter(r => r.price_range === '$$$').length },
    { range: '$$$$', count: restaurants.filter(r => r.price_range === '$$$$').length },
  ].filter(p => p.count > 0);

  // User role distribution
  const userRoles = [
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#8b5cf6' },
    { name: 'Users', value: users.filter(u => u.role === 'user').length, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Story Views</p>
                <p className="text-xl font-bold text-slate-800">{totalStoryViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg Views/Story</p>
                <p className="text-xl font-bold text-slate-800">{avgStoryViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Favorites</p>
                <p className="text-xl font-bold text-slate-800">{favorites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Users</p>
                <p className="text-xl font-bold text-slate-800">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Restaurants</p>
                <p className="text-xl font-bold text-slate-800">{restaurants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Synagogues</p>
                <p className="text-xl font-bold text-slate-800">{synagogues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Minyans</p>
                <p className="text-xl font-bold text-slate-800">{minyans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <BookUser className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Directory Contacts</p>
                <p className="text-xl font-bold text-slate-800">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Stories */}
      {topStories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Stories by Views</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topStories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Favorite Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Favorite Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={favoriteTypes}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {favoriteTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Favorited */}
      {topFavorited.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Favorited Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFavorited.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500"
                        style={{ width: `${(item.count / maxFavoriteCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-800 w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Growth */}
      {userGrowthData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}