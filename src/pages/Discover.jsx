import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Star, ExternalLink, Search, Calendar, Users, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationSetter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position, map]);
  return null;
}

const VIRAR_CENTER = [19.466, 72.811];

const demoData = {
  grounds: [
    {
      id: 'virar-1',
      name: 'Virar Premier Cricket Ground',
      markerType: 'ground',
      sport_type: 'cricket',
      rating: 4.7,
      address: 'Near Arnala Road, Virar West',
      latitude: 19.47,
      longitude: 72.81,
    },
    {
      id: 'virar-2',
      name: 'Virar Football Arena',
      markerType: 'ground',
      sport_type: 'football',
      rating: 4.5,
      address: 'Virar East Sports Complex',
      latitude: 19.465,
      longitude: 72.82,
    },
  ],
  tournaments: [
    {
      id: 'tour-1',
      name: 'Virar Champions Trophy',
      markerType: 'tournament',
      sport_type: 'cricket',
      date: 'Next weekend',
      address: 'Virar Premier Cricket Ground',
      latitude: 19.471,
      longitude: 72.812,
    },
    {
      id: 'tour-2',
      name: 'Monsoon Football League',
      markerType: 'tournament',
      sport_type: 'football',
      date: 'Coming in 2 weeks',
      address: 'Virar Football Arena',
      latitude: 19.464,
      longitude: 72.818,
    },
  ],
  stores: [
    {
      id: 'store-1',
      name: 'Virar Sports House',
      markerType: 'store',
      category: 'equipment',
      address: 'Station Road, Virar West',
      latitude: 19.455,
      longitude: 72.808,
    },
    {
      id: 'store-2',
      name: 'Pro Sports & Fitness',
      markerType: 'store',
      category: 'equipment',
      address: 'Global City, Virar West',
      latitude: 19.47,
      longitude: 72.803,
    },
  ],
  players: [
    {
      id: 'player-1',
      name: 'Rohan Desai',
      markerType: 'player',
      primary_sport: 'cricket',
      status: 'Available this evening',
      latitude: 19.468,
      longitude: 72.809,
    },
    {
      id: 'player-2',
      name: 'Aisha Khan',
      markerType: 'player',
      primary_sport: 'football',
      status: 'Looking for weekend matches',
      latitude: 19.462,
      longitude: 72.815,
    },
  ],
};

export default function Discover() {
  const [center, setCenter] = useState(VIRAR_CENTER);
  const [filter, setFilter] = useState('all');
  const [locationQuery, setLocationQuery] = useState('Virar, Mumbai');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    try {
      setIsSearching(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        locationQuery,
      )}&limit=1`;
      const resp = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const results = await resp.json();
      if (Array.isArray(results) && results[0]) {
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        setCenter([lat, lon]);
      }
    } catch {
      // ignore for demo
    } finally {
      setIsSearching(false);
    }
  };

  const allMarkers = [
    ...demoData.grounds,
    ...demoData.tournaments,
    ...demoData.stores,
    ...demoData.players,
  ];

  const filtered =
    filter === 'all'
      ? allMarkers
      : allMarkers.filter((m) => m.markerType === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discover Around You</h1>
          <p className="text-muted-foreground text-sm">
            Type any location (try <span className="font-semibold">Virar</span>) to explore nearby grounds, tournaments, stores and players.
          </p>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ground">Grounds</TabsTrigger>
            <TabsTrigger value="tournament">Tournaments</TabsTrigger>
            <TabsTrigger value="store">Equipment</TabsTrigger>
            <TabsTrigger value="player">Players</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3 space-y-4">
          <form onSubmit={handleSearchLocation} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter area or city (e.g. Virar, Mumbai)"
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={isSearching} className="whitespace-nowrap">
              {isSearching ? 'Locating...' : 'Set Location'}
            </Button>
          </form>

          <Card className="overflow-hidden">
            <div className="h-[55vh] sm:h-[60vh]">
              <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSetter position={center} />

                <Marker position={center}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Your chosen area</p>
                      <p className="text-xs text-muted-foreground">Move around and tap markers to explore.</p>
                    </div>
                  </Popup>
                </Marker>

                {filtered.map((item) => (
                  <Marker
                    key={`${item.markerType}-${item.id}`}
                    position={[item.latitude, item.longitude]}
                    eventHandlers={{
                      click: () => setSelectedItem(item),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.markerType}
                          {item.sport_type && ` • ${item.sport_type}`}
                          {item.primary_sport && ` • ${item.primary_sport}`}
                        </p>
                        {item.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs">{item.rating}</span>
                          </div>
                        )}
                        {item.address && (
                          <p className="text-xs text-gray-500 mt-1">{item.address}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>
        </div>

        <div className="md:w-1/3 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h2 className="text-sm font-semibold">Live Snapshot for Virar</h2>
              <p className="text-xs text-muted-foreground">
                See where you can play, buy equipment, join tournaments or find teammates around Virar right now.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" /> {demoData.grounds.length} grounds
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" /> {demoData.tournaments.length} tournaments
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-primary" /> {demoData.stores.length} stores
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-primary" /> {demoData.players.length} players
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold">Quick actions</h3>
              <Button asChild size="sm" className="w-full justify-start rounded-lg">
                <Link to="/Grounds">
                  <MapPin className="w-4 h-4 mr-2" /> Book a ground
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full justify-start rounded-lg">
                <Link to="/Tournaments">
                  <Calendar className="w-4 h-4 mr-2" /> Register for a tournament
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full justify-start rounded-lg">
                <Link to="/Players">
                  <Users className="w-4 h-4 mr-2" /> Find available players
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="w-full justify-start rounded-lg">
                <Link to="/Equipment">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Browse equipment stores
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 9).map((item) => (
            <Card
              key={`list-${item.id}`}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="text-xs capitalize mb-1">
                      {item.markerType}
                    </Badge>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    {item.sport_type && (
                      <p className="text-xs text-muted-foreground capitalize">{item.sport_type}</p>
                    )}
                    {item.primary_sport && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.primary_sport} player
                      </p>
                    )}
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  )}
                </div>
                {item.address && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.address}
                  </p>
                )}
                {item.date && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </p>
                )}
                {item.status && (
                  <p className="text-xs text-muted-foreground mt-1">{item.status}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {item.markerType === 'ground' && (
                    <Button asChild size="sm" className="flex-1 rounded-lg">
                      <Link to={`/ground-booking/${item.id}`}>
                        Book this ground
                      </Link>
                    </Button>
                  )}
                  {item.markerType === 'tournament' && (
                    <Button asChild size="sm" className="flex-1 rounded-lg">
                      <Link to={`/tournament-registration/${item.id}`}>
                        Register now
                      </Link>
                    </Button>
                  )}
                  {item.markerType === 'player' && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg"
                    >
                      <Link to={`/player-connection/${item.id}`}>
                        Connect with player
                      </Link>
                    </Button>
                  )}
                  {item.markerType === 'store' && (
                    <Button size="sm" variant="outline" className="flex-1 rounded-lg">
                      View store
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {selectedItem?.markerType && (
              <p className="capitalize text-muted-foreground">
                Type: {selectedItem.markerType}
                {selectedItem.sport_type && ` • ${selectedItem.sport_type}`}
                {selectedItem.primary_sport && ` • ${selectedItem.primary_sport}`}
              </p>
            )}
            {selectedItem?.address && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" /> {selectedItem.address}
              </p>
            )}
            {selectedItem?.date && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" /> {selectedItem.date}
              </p>
            )}
            {selectedItem?.status && <p>{selectedItem.status}</p>}
          </div>
          <DialogFooter className="mt-4">
            {selectedItem?.markerType === 'ground' && (
              <Button asChild className="flex-1 rounded-lg">
                <Link to="/Grounds">
                  <MapPin className="w-4 h-4 mr-2" /> Go to ground booking
                </Link>
              </Button>
            )}
            {selectedItem?.markerType === 'tournament' && (
              <Button asChild className="flex-1 rounded-lg">
                <Link to="/Tournaments">
                  <Calendar className="w-4 h-4 mr-2" /> Go to tournament registration
                </Link>
              </Button>
            )}
            {selectedItem?.markerType === 'player' && (
              <Button asChild className="flex-1 rounded-lg" variant="outline">
                <Link to="/Players">
                  <Users className="w-4 h-4 mr-2" /> Find more players
                </Link>
              </Button>
            )}
            {selectedItem?.markerType === 'store' && (
              <Button asChild className="flex-1 rounded-lg" variant="outline">
                <Link to="/Equipment">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Browse equipment
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
