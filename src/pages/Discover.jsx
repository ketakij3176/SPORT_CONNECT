import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon
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

export default function Discover() {
  const [userPos, setUserPos] = useState([28.6139, 77.2090]); // Default Delhi
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  const { data: grounds = [] } = useQuery({
    queryKey: ['grounds-map'],
    queryFn: () => base44.entities.Ground.list('-created_date', 50),
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments-map'],
    queryFn: () => base44.entities.Tournament.list('-created_date', 50),
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs-map'],
    queryFn: () => base44.entities.Club.list('-created_date', 50),
  });

  const allMarkers = [
    ...grounds.filter(g => g.latitude && g.longitude).map(g => ({ ...g, markerType: 'ground' })),
    ...tournaments.filter(t => t.latitude && t.longitude).map(t => ({ ...t, markerType: 'tournament' })),
    ...clubs.filter(c => c.latitude && c.longitude).map(c => ({ ...c, markerType: 'club' })),
  ];

  const filtered = filter === 'all' ? allMarkers : allMarkers.filter(m => m.markerType === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discover Nearby</h1>
          <p className="text-muted-foreground text-sm">Find sports facilities, tournaments & clubs near you</p>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ground">Grounds</TabsTrigger>
            <TabsTrigger value="tournament">Tournaments</TabsTrigger>
            <TabsTrigger value="club">Clubs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[60vh] sm:h-[70vh]">
          <MapContainer center={userPos} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSetter position={userPos} />
            
            {/* User location */}
            <Marker position={userPos}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">You are here</p>
                </div>
              </Popup>
            </Marker>

            {filtered.map((item, i) => (
              <Marker key={`${item.markerType}-${item.id || i}`} position={[item.latitude, item.longitude]}>
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.markerType} • {item.sport_type || item.sports_offered?.[0] || ''}</p>
                    {item.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs">{item.rating}</span>
                      </div>
                    )}
                    {item.address && <p className="text-xs text-gray-500 mt-1">{item.address}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* List view */}
      {filtered.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 9).map((item, i) => (
            <Card key={`list-${item.id || i}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="text-xs capitalize mb-2">{item.markerType}</Badge>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{item.sport_type || item.sports_offered?.[0] || ''}</p>
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  )}
                </div>
                {item.address && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.address}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}