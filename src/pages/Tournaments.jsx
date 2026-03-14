import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, MapPin, Calendar, Users, Search, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusBadge = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Tournaments() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [regTournament, setRegTournament] = useState(null);
  const [regData, setRegData] = useState({ phone: '', team_name: '', num_players: 5 });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const regMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('tournament_registrations').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tournament-regs'] });
      toast.success('Registration submitted!');
      setRegTournament(null);
    },
    onError: (err) => {
      console.error('Registration failed:', err);
      toast.error('Could not register. Check Supabase setup.');
    },
  });

  const filtered = tournaments.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase());
    const matchSport = sportFilter === 'all' || t.sport_type === sportFilter;
    return matchSearch && matchSport;
  });

  const handleRegister = () => {
    regMutation.mutate({
      tournament_id: regTournament.id,
      tournament_name: regTournament.name,
      user_email: user?.email,
      user_name: user?.full_name,
      ...regData,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <p className="text-muted-foreground text-sm">Compete and showcase your skills</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tournaments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Sport" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {['cricket','football','basketball','tennis','badminton','volleyball','hockey'].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No tournaments found.</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="overflow-hidden hover:shadow-lg transition-all">
                {t.image_url ? (
                  <div className="h-36 overflow-hidden">
                    <img
                      src={t.image_url}
                      alt={t.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-primary/40" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    <Badge className={statusBadge[t.status] || 'bg-muted text-muted-foreground'}>{t.status}</Badge>
                  </div>
                  <div className="space-y-1.5 mt-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 capitalize"><Trophy className="w-3 h-3" /> {t.sport_type}</p>
                    {t.date && <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {format(new Date(t.date), 'MMM d, yyyy')}</p>}
                    {t.location && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {t.location}</p>}
                    {t.entry_fee > 0 && <p className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Entry: ₹{t.entry_fee}</p>}
                  </div>
                  {t.prize_pool && <p className="text-sm font-semibold text-primary mt-2">Prize: {t.prize_pool}</p>}
                  <Button className="w-full mt-3 rounded-lg" size="sm" onClick={() => setRegTournament(t)} disabled={t.status === 'completed' || t.status === 'cancelled'}>
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!regTournament} onOpenChange={() => setRegTournament(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Register for {regTournament?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Phone</Label><Input value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} placeholder="Your phone" /></div>
            <div><Label>Team Name</Label><Input value={regData.team_name} onChange={e => setRegData({...regData, team_name: e.target.value})} placeholder="Your team name" /></div>
            <div><Label>Number of Players</Label><Input type="number" min={1} value={regData.num_players} onChange={e => setRegData({...regData, num_players: parseInt(e.target.value)})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegTournament(null)}>Cancel</Button>
            <Button onClick={handleRegister} disabled={regMutation.isPending}>{regMutation.isPending ? 'Submitting...' : 'Register'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}