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
import { ShoppingBag, Search, Plus, MapPin, Tag, ArrowDownUp } from 'lucide-react';
import { toast } from 'sonner';

const conditionLabels = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair' };
const conditionColors = { new: 'bg-emerald-100 text-emerald-700', like_new: 'bg-blue-100 text-blue-700', good: 'bg-amber-100 text-amber-700', fair: 'bg-gray-100 text-gray-600' };

export default function Equipment() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState('all');
  const [newItem, setNewItem] = useState({ name: '', brand: '', sport_type: '', condition: 'new', buy_price: 0, rent_price_per_day: 0, description: '', available_for: 'both' });
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 100),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment listed!');
      setShowAdd(false);
    },
  });

  let filtered = equipment.filter(e => {
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) || e.brand?.toLowerCase().includes(search.toLowerCase());
    const matchSport = sportFilter === 'all' || e.sport_type?.toLowerCase() === sportFilter;
    const matchTab = tab === 'all' || e.available_for === tab || e.available_for === 'both';
    return matchSearch && matchSport && matchTab;
  });

  if (sortBy === 'price_low') filtered = [...filtered].sort((a, b) => (a.buy_price || 0) - (b.buy_price || 0));
  if (sortBy === 'price_high') filtered = [...filtered].sort((a, b) => (b.buy_price || 0) - (a.buy_price || 0));

  // Price comparison grouping
  const grouped = {};
  filtered.forEach(e => {
    const key = e.name?.toLowerCase().trim();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });
  const comparisons = Object.entries(grouped).filter(([, items]) => items.length > 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Equipment Hub</h1>
          <p className="text-muted-foreground text-sm">Buy, rent, or sell sports equipment</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" /> List Equipment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Sport" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {['cricket','football','basketball','tennis','badminton'].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Price Comparison */}
      {comparisons.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><ArrowDownUp className="w-5 h-5" /> Price Comparison</h2>
          {comparisons.map(([name, items]) => (
            <Card key={name} className="mb-3">
              <CardContent className="p-4">
                <h3 className="font-semibold capitalize mb-2">{name}</h3>
                <div className="space-y-2">
                  {items.sort((a, b) => (a.buy_price || 0) - (b.buy_price || 0)).map((item, idx) => (
                    <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg ${idx === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-muted'}`}>
                      <div>
                        <p className="text-sm font-medium">{item.seller_name || item.brand || 'Seller'}</p>
                        <p className="text-xs text-muted-foreground">{item.seller_location}</p>
                      </div>
                      <div className="text-right">
                        {item.buy_price > 0 && <p className="text-sm font-semibold">₹{item.buy_price} {idx === 0 && <Badge className="ml-1 bg-emerald-100 text-emerald-700 text-xs">Best</Badge>}</p>}
                        {item.rent_price_per_day > 0 && <p className="text-xs text-muted-foreground">₹{item.rent_price_per_day}/day</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No equipment listed yet.</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="overflow-hidden hover:shadow-lg transition-all">
                <div className="h-36 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-primary/30" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                    </div>
                    <Badge className={conditionColors[item.condition] || 'bg-muted'}>{conditionLabels[item.condition] || item.condition}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    {item.buy_price > 0 && <p className="text-sm font-semibold text-primary">₹{item.buy_price}</p>}
                    {item.rent_price_per_day > 0 && <p className="text-xs text-muted-foreground">₹{item.rent_price_per_day}/day rent</p>}
                  </div>
                  {item.seller_location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3" /> {item.seller_location}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Equipment Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>List Equipment</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            <div><Label>Equipment Name</Label><Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Cricket Bat" /></div>
            <div><Label>Brand</Label><Input value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} placeholder="e.g. MRF, Nike" /></div>
            <div><Label>Sport</Label><Input value={newItem.sport_type} onChange={e => setNewItem({...newItem, sport_type: e.target.value})} placeholder="e.g. Cricket" /></div>
            <div><Label>Condition</Label>
              <Select value={newItem.condition} onValueChange={v => setNewItem({...newItem, condition: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(conditionLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Available For</Label>
              <Select value={newItem.available_for} onValueChange={v => setNewItem({...newItem, available_for: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy Only</SelectItem>
                  <SelectItem value="rent">Rent Only</SelectItem>
                  <SelectItem value="both">Buy & Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Buy Price (₹)</Label><Input type="number" value={newItem.buy_price} onChange={e => setNewItem({...newItem, buy_price: parseFloat(e.target.value)})} /></div>
              <div><Label>Rent/Day (₹)</Label><Input type="number" value={newItem.rent_price_per_day} onChange={e => setNewItem({...newItem, rent_price_per_day: parseFloat(e.target.value)})} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => addMutation.mutate({...newItem, seller_email: user?.email, seller_name: user?.full_name})} disabled={!newItem.name || addMutation.isPending}>
              {addMutation.isPending ? 'Listing...' : 'List Equipment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}