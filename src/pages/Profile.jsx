import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Trophy, Dumbbell, Users, ShoppingBag, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const roleLabels = {
  player: 'Player', coach: 'Coach', organizer: 'Tournament Organizer',
  club_owner: 'Club Owner', supplier: 'Equipment Supplier', academy: 'Sports Academy', trainer: 'Fitness Trainer',
};

export default function Profile() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['profile-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ user_email: user?.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: tournamentRegs = [] } = useQuery({
    queryKey: ['profile-tournament-regs', user?.email],
    queryFn: () => base44.entities.TournamentRegistration.filter({ user_email: user?.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: clubMemberships = [] } = useQuery({
    queryKey: ['profile-memberships', user?.email],
    queryFn: () => base44.entities.ClubMembership.filter({ user_email: user?.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{user.full_name}</h1>
              <p className="text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge variant="secondary" className="capitalize">{roleLabels[user.user_role] || 'Player'}</Badge>
                {user.created_date && (
                  <Badge variant="outline">Joined {format(new Date(user.created_date), 'MMM yyyy')}</Badge>
                )}
              </div>
            </div>
            <Link to="/RoleSelect">
              <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit Role</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Ground Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{tournamentRegs.length}</p>
            <p className="text-xs text-muted-foreground">Tournament Registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{clubMemberships.length}</p>
            <p className="text-xs text-muted-foreground">Club Memberships</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg">Recent Bookings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">{b.ground_name}</p>
                  <p className="text-xs text-muted-foreground">{b.date} • {b.time_slot}</p>
                </div>
                <Badge className={statusColors[b.status]}>{b.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Tournament Registrations */}
      {tournamentRegs.length > 0 && (
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg">Tournament Registrations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tournamentRegs.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t.tournament_name}</p>
                  <p className="text-xs text-muted-foreground">Team: {t.team_name}</p>
                </div>
                <Badge className={statusColors[t.status]}>{t.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center mt-8">
        <Button variant="destructive" onClick={() => base44.auth.logout()}>Logout</Button>
      </div>
    </div>
  );
}