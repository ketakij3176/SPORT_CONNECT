import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { fetchNearbySportsGrounds, getEffectiveLocation } from '@/api/googlePlaces';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star, MapPin, Clock, Search, Dumbbell, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const sportIcons = {
  cricket: '🏏', football: '⚽', basketball: '🏀', tennis: '🎾',
  badminton: '🏸', volleyball: '🏐', hockey: '🏑', swimming: '🏊', athletics: '🏃', other: '🎯'
};

export default function Grounds() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [bookingGround, setBookingGround] = useState(null);
  const [bookingData, setBookingData] = useState({ date: '', time_slot: '', num_players: 2, contact_number: '' });
  const [locationInfo, setLocationInfo] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    getEffectiveLocation()
      .then((loc) => {
        if (!cancelled) setLocationInfo(loc);
      })
      .catch((err) => {
        if (!cancelled) setLocationError(err?.message || 'Unable to get location');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: grounds = [], isLoading } = useQuery({
    queryKey: ['grounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grounds')
        .select('*')
        .order('rating', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const {
    data: googleGrounds = [],
    isLoading: isLoadingGoogle,
    isFetching: isFetchingGoogle,
  } = useQuery({
    queryKey: ['google-grounds', locationInfo?.lat, locationInfo?.lng, sportFilter],
    enabled: !!locationInfo,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    queryFn: () =>
      fetchNearbySportsGrounds({
        lat: locationInfo.lat,
        lng: locationInfo.lng,
        sport: sportFilter,
      }),
  });

  const bookMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('bookings').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking request submitted!');
      setBookingGround(null);
      setBookingData({ date: '', time_slot: '', num_players: 2, contact_number: '' });
    },
    onError: (err) => {
      console.error('Booking failed:', err);
      toast.error('Could not submit booking. Check Supabase setup.');
    },
  });

  const filtered = grounds.filter(g => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase()) || g.address?.toLowerCase().includes(search.toLowerCase());
    const matchSport = sportFilter === 'all' || g.sport_type === sportFilter;
    return matchSearch && matchSport;
  });

  const handleBook = () => {
    bookMutation.mutate({
      ground_id: bookingGround.id,
      ground_name: bookingGround.name,
      user_email: user?.email,
      user_name: user?.full_name,
      ...bookingData,
      total_price: bookingGround.price_per_hour || 0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Sports Grounds</h1>
          <p className="text-muted-foreground text-sm">
            Find and book grounds near you. Auto-discovered grounds use free OpenStreetMap data (defaulting to Mumbai if location is unavailable).
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search grounds..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {Object.keys(sportIcons).map(s => (
              <SelectItem key={s} value={s}>{sportIcons[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid from app database (Base44) */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No grounds found. Check back later!</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ground, i) => (
            <motion.div key={ground.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="overflow-hidden hover:shadow-lg transition-all group">
                {ground.image_url ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={ground.image_url}
                      alt={ground.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-5xl">
                    {sportIcons[ground.sport_type] || '🎯'}
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{ground.name}</h3>
                      <Badge variant="secondary" className="text-xs capitalize mt-1">{ground.sport_type}</Badge>
                    </div>
                    {ground.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium">{ground.rating}</span>
                      </div>
                    )}
                  </div>
                  {ground.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3" /> {ground.address}
                    </p>
                  )}
                  {ground.price_per_hour > 0 && (
                    <p className="text-sm font-semibold text-primary mt-2">₹{ground.price_per_hour}/hr</p>
                  )}
                  <Button className="w-full mt-3 rounded-lg" size="sm" onClick={() => setBookingGround(ground)}>
                    <Calendar className="w-4 h-4 mr-2" /> Book Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Auto-discovered grounds from open data */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Auto-discovered grounds (OpenStreetMap)</h2>
            <p className="text-xs text-muted-foreground">
              Using free OpenStreetMap / Overpass data near your location{locationInfo?.isFallback ? ' (centered on Mumbai by default)' : ''}.
            </p>
            {locationError && (
              <p className="text-xs text-red-500 mt-1">
                {locationError}
              </p>
            )}
          </div>
          {(isLoadingGoogle || isFetchingGoogle) && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 animate-spin" /> Loading nearby grounds...
            </span>
          )}
        </div>

        {!locationInfo && !locationError && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {locationInfo && googleGrounds.length === 0 && !isLoadingGoogle && !isFetchingGoogle && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No nearby grounds found for the selected filters.</p>
            </CardContent>
          </Card>
        )}

        {googleGrounds.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {googleGrounds
              .filter((g) => {
                const matchSearch =
                  g.name?.toLowerCase().includes(search.toLowerCase()) ||
                  g.address?.toLowerCase().includes(search.toLowerCase());
                return matchSearch;
              })
              .map((ground, i) => (
                <motion.div
                  key={ground.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all group">
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-5xl">
                      {sportIcons[ground.sport_type] || '🎯'}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{ground.name}</h3>
                          <Badge variant="outline" className="text-xs capitalize mt-1">
                            Open data · {ground.sport_type}
                          </Badge>
                        </div>
                        {ground.rating > 0 && (
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-medium">{ground.rating}</span>
                            </div>
                            {ground.user_ratings_total > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                {ground.user_ratings_total} reviews
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {ground.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                          <MapPin className="w-3 h-3" /> {ground.address}
                        </p>
                      )}
                      {typeof ground.distance_km === 'number' && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Approx. {ground.distance_km.toFixed(1)} km from you
                        </p>
                      )}
                      <Button
                        className="w-full mt-3 rounded-lg"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const loc = ground.location;
                          if (!loc) return;
                          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${ground.name} ${loc.lat},${loc.lng}`,
                          )}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" /> View in Google Maps
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!bookingGround} onOpenChange={() => setBookingGround(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book {bookingGround?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} />
            </div>
            <div>
              <Label>Time Slot</Label>
              <Select value={bookingData.time_slot} onValueChange={v => setBookingData({...bookingData, time_slot: v})}>
                <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>
                  {['6:00 AM - 8:00 AM', '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'].map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Number of Players</Label>
              <Input type="number" min={1} value={bookingData.num_players} onChange={e => setBookingData({...bookingData, num_players: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input value={bookingData.contact_number} onChange={e => setBookingData({...bookingData, contact_number: e.target.value})} placeholder="Your phone number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingGround(null)}>Cancel</Button>
            <Button onClick={handleBook} disabled={!bookingData.date || !bookingData.time_slot || bookMutation.isPending}>
              {bookMutation.isPending ? 'Submitting...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}