import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, Plus, MessageCircle, User, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Players() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newRequest, setNewRequest] = useState({ sport: '', message: '', players_needed: 2, date: '', location: '' });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: teamRequests = [], isLoading } = useQuery({
    queryKey: ['team-requests'],
    queryFn: () => base44.entities.TeamRequest.filter({ status: 'open' }, '-created_date', 50),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      toast.success('Team request posted!');
      setShowCreate(false);
      setNewRequest({ sport: '', message: '', players_needed: 2, date: '', location: '' });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, responses }) => base44.entities.TeamRequest.update(id, { responses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      toast.success('Response sent!');
    },
  });

  const handleRespond = (request) => {
    const existing = request.responses || [];
    if (existing.some(r => r.email === user?.email)) {
      toast.info('You already responded');
      return;
    }
    respondMutation.mutate({
      id: request.id,
      responses: [...existing, { email: user?.email, name: user?.full_name, message: "I'm interested!" }],
    });
  };

  const playerUsers = users.filter(u => 
    u.email !== user?.email && 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || !search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Find Players & Teams</h1>
          <p className="text-muted-foreground text-sm">Connect with nearby players or find teammates</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Need Players
        </Button>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Team Requests</TabsTrigger>
          <TabsTrigger value="players">All Players</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : teamRequests.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No open team requests. Be the first to post!</p>
            </CardContent></Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {teamRequests.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{req.requester_name || 'Player'}</p>
                            <Badge variant="secondary" className="text-xs capitalize mt-0.5">{req.sport}</Badge>
                          </div>
                        </div>
                        <Badge variant="outline">{req.players_needed} needed</Badge>
                      </div>
                      <p className="text-sm mt-3">{req.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {req.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.date}</span>}
                        {req.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</span>}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 rounded-lg" onClick={() => handleRespond(req)}>
                          I'm In!
                        </Button>
                        {req.responses?.length > 0 && (
                          <Badge variant="secondary" className="self-center">{req.responses.length} responses</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="players">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerUsers.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.user_role?.replace('_', ' ') || 'Player'}</p>
                    </div>
                    <Link to={`/Messages?to=${p.email}&name=${p.full_name}`}>
                      <Button size="icon" variant="outline" className="shrink-0 rounded-full">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create request dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Post Team Request</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Sport</Label>
              <Select value={newRequest.sport} onValueChange={v => setNewRequest({...newRequest, sport: v})}>
                <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                <SelectContent>
                  {['cricket','football','basketball','tennis','badminton','volleyball','hockey'].map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Message</Label><Textarea value={newRequest.message} onChange={e => setNewRequest({...newRequest, message: e.target.value})} placeholder="e.g. Need 3 players for Sunday football..." /></div>
            <div><Label>Players Needed</Label><Input type="number" min={1} value={newRequest.players_needed} onChange={e => setNewRequest({...newRequest, players_needed: parseInt(e.target.value)})} /></div>
            <div><Label>Date</Label><Input type="date" value={newRequest.date} onChange={e => setNewRequest({...newRequest, date: e.target.value})} /></div>
            <div><Label>Location</Label><Input value={newRequest.location} onChange={e => setNewRequest({...newRequest, location: e.target.value})} placeholder="Where?" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ ...newRequest, requester_email: user?.email, requester_name: user?.full_name })} disabled={!newRequest.sport || !newRequest.message || createMutation.isPending}>
              {createMutation.isPending ? 'Posting...' : 'Post Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}