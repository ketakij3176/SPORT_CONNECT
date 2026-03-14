import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Trophy, ShoppingBag, Dumbbell, Star, Calendar, ArrowRight, ChevronRight
} from 'lucide-react';

const SPORT_TABS = [
  { id: 'all', label: 'All' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'basketball', label: 'Basketball' },
];

const sportIcons = {
  cricket: '🏏', football: '⚽', basketball: '🏀', badminton: '🏸', other: '🎯',
};

// Fallback demo data when DB is empty
const demoGrounds = [
  { id: 'dg1', name: 'Emerald Cricket Academy', sport_type: 'cricket', address: 'Sector 15, Noida', price_per_hour: 800, rating: 4.8, image_url: null },
  { id: 'dg2', name: 'Kickstart Football Arena', sport_type: 'football', address: 'Koramangala, Bangalore', price_per_hour: 1200, rating: 4.5, image_url: null },
  { id: 'dg3', name: 'Shuttle Zone Badminton', sport_type: 'badminton', address: 'Andheri West, Mumbai', price_per_hour: 600, rating: 4.5, image_url: null },
  { id: 'dg4', name: 'Champions Basketball Court', sport_type: 'basketball', address: 'Salt Lake, Kolkata', price_per_hour: 500, rating: 4.2, image_url: null },
];

const demoTournaments = [
  { id: 'dt1', name: '5-a-Side Football League', sport_type: 'football', start_date: '2026-04-01', location: 'Koramangala, Bangalore', entry_fee: 1500, status: 'upcoming', image_url: null },
  { id: 'dt2', name: 'Badminton Open Singles', sport_type: 'badminton', start_date: '2026-03-25', location: 'Andheri West, Mumbai', entry_fee: 500, status: 'upcoming', image_url: null },
  { id: 'dt3', name: 'Community Cricket Cup', sport_type: 'cricket', start_date: '2026-04-10', location: 'Sector 15, Noida', entry_fee: 2000, status: 'upcoming', image_url: null },
];

const demoEquipment = [
  { id: 'de1', name: 'Yonex Astrox 99 Racquet', sport_type: 'badminton', buy_price: 8500, rent_price_per_day: 0, condition: 'like_new', available_for: 'buy', image_url: null },
  { id: 'de2', name: 'Full Cricket Kit Set', sport_type: 'cricket', buy_price: 0, rent_price_per_day: 500, condition: 'good', available_for: 'rent', image_url: null },
  { id: 'de3', name: 'Wilson Tennis Racket', sport_type: 'tennis', buy_price: 12000, rent_price_per_day: 0, condition: 'new', available_for: 'buy', image_url: null },
  { id: 'de4', name: 'Spalding NBA Basketball', sport_type: 'basketball', buy_price: 1800, rent_price_per_day: 0, condition: 'new', available_for: 'buy', image_url: null },
];

function filterBySport(list, sportKey, sportFilter) {
  if (!sportFilter || sportFilter === 'all') return list;
  return list.filter(item => (item[sportKey] || '').toLowerCase() === sportFilter);
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [sportFilter, setSportFilter] = useState('all');

  const { data: groundsRaw = [] } = useQuery({
    queryKey: ['grounds'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('grounds').select('*').order('rating', { ascending: false }).limit(20);
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    },
    staleTime: 3 * 60 * 1000,
  });

  const { data: tournamentsRaw = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('tournaments').select('*').order('start_date', { ascending: true }).limit(20);
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    },
    staleTime: 3 * 60 * 1000,
  });

  const { data: equipmentRaw = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      try {
        const list = await base44.entities.Equipment.list('-created_date', 20);
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 3 * 60 * 1000,
  });

  const grounds = groundsRaw.length > 0 ? groundsRaw : demoGrounds;
  const tournaments = tournamentsRaw.length > 0 ? tournamentsRaw : demoTournaments;
  const equipment = equipmentRaw.length > 0 ? equipmentRaw : demoEquipment;

  const filteredGrounds = filterBySport(grounds, 'sport_type', sportFilter).slice(0, 4);
  const filteredEvents = filterBySport(tournaments, 'sport_type', sportFilter).slice(0, 3);
  const filteredEquipment = filterBySport(equipment, 'sport_type', sportFilter).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 via-primary/10 to-secondary/20 border shadow-md"
      >
        <div className="p-6 sm:p-8 md:p-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Find Your Game 🏆
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Discover grounds, events & gear near you
          </p>
          <Link to="/Discover">
            <Button size="lg" className="mt-4 rounded-full px-6 h-11">
              Explore Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Sport Category Tabs */}
      <div className="mt-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max sm:flex-wrap">
          {SPORT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSportFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                sportFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Grounds */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Nearby Grounds</h2>
            <p className="text-sm text-muted-foreground">Book a pitch and play</p>
          </div>
          <Link to="/Grounds" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGrounds.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/Grounds">
                <Card className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all h-full border">
                  <div className="h-32 relative">
                    {g.image_url ? (
                      <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-4xl">
                        {sportIcons[g.sport_type] || sportIcons.other}
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
                      ₹{g.price_per_hour || 0}/hr
                    </div>
                    <Badge className="absolute top-2 left-2 capitalize text-xs" variant="secondary">
                      {g.sport_type}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate">{g.name}</h3>
                    {g.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {g.address}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-medium">{g.rating || '—'}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Upcoming Events</h2>
            <p className="text-sm text-muted-foreground">Tournaments & matches</p>
          </div>
          <Link to="/Tournaments" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/Tournaments">
                <Card className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all h-full border">
                  <div className="h-28 relative">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-primary/40" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 capitalize text-xs" variant="secondary">
                      {t.sport_type}
                    </Badge>
                    <Badge className="absolute top-2 right-2 text-xs bg-emerald-100 text-emerald-700 border-0">
                      {t.status || 'upcoming'}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{t.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {formatDate(t.start_date || t.date)}
                    </p>
                    {t.entry_fee > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">Entry: ₹{t.entry_fee}</p>
                    )}
                    {t.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {t.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Equipment Shop */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Equipment Shop</h2>
            <p className="text-sm text-muted-foreground">Buy or rent gear</p>
          </div>
          <Link to="/Equipment" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredEquipment.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/Equipment">
                <Card className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all h-full border">
                  <div className="h-28 relative">
                    {e.image_url ? (
                      <img src={e.image_url} alt={e.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-primary/30" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 capitalize text-xs" variant="secondary">
                      {e.sport_type}
                    </Badge>
                    <Badge className="absolute top-2 right-2 text-xs bg-primary/90 text-primary-foreground border-0">
                      {e.rent_price_per_day > 0 ? 'Rent' : 'Buy'}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{e.name}</h3>
                    <div className="mt-1">
                      {e.buy_price > 0 && (
                        <span className="text-sm font-semibold text-primary">₹{e.buy_price}</span>
                      )}
                      {e.rent_price_per_day > 0 && (
                        <span className="text-xs text-muted-foreground"> ₹{e.rent_price_per_day}/day</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {e.condition === 'like_new' ? 'Like New' : (e.condition || 'Good')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Optional: welcome for logged-in user */}
      {user && (
        <p className="text-center text-sm text-muted-foreground mt-8">
          Welcome back, <span className="font-medium text-foreground">{user.full_name?.split(' ')[0] || 'Player'}</span>
          {!user.user_role && (
            <> · <Link to="/RoleSelect" className="text-primary underline">Set your role</Link></>
          )}
        </p>
      )}
    </div>
  );
}
