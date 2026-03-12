import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Trophy, Users, ShoppingBag, Dumbbell, MessageCircle, 
  Calendar, ArrowRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const quickActions = {
  player: [
    { label: 'Find Players', path: '/Players', icon: Users },
    { label: 'Tournaments', path: '/Tournaments', icon: Trophy },
    { label: 'Book Ground', path: '/Grounds', icon: Dumbbell },
    { label: 'Equipment', path: '/Equipment', icon: ShoppingBag },
    { label: 'Discover', path: '/Discover', icon: MapPin },
    { label: 'Messages', path: '/Messages', icon: MessageCircle },
  ],
  coach: [
    { label: 'My Profile', path: '/Profile', icon: Users },
    { label: 'Tournaments', path: '/Tournaments', icon: Trophy },
    { label: 'Messages', path: '/Messages', icon: MessageCircle },
    { label: 'Discover', path: '/Discover', icon: MapPin },
  ],
  organizer: [
    { label: 'Tournaments', path: '/Tournaments', icon: Trophy },
    { label: 'Discover', path: '/Discover', icon: MapPin },
    { label: 'Messages', path: '/Messages', icon: MessageCircle },
  ],
  club_owner: [
    { label: 'Grounds', path: '/Grounds', icon: Dumbbell },
    { label: 'Discover', path: '/Discover', icon: MapPin },
    { label: 'Messages', path: '/Messages', icon: MessageCircle },
  ],
  supplier: [
    { label: 'Equipment', path: '/Equipment', icon: ShoppingBag },
    { label: 'Messages', path: '/Messages', icon: MessageCircle },
  ],
};

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const role = user?.user_role || 'player';

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ user_email: user?.email }, '-created_date', 5),
    enabled: !!user?.email,
  });

  const { data: tournamentRegs = [] } = useQuery({
    queryKey: ['my-tournament-regs', user?.email],
    queryFn: () => base44.entities.TournamentRegistration.filter({ user_email: user?.email }, '-created_date', 5),
    enabled: !!user?.email,
  });

  const { data: clubMemberships = [] } = useQuery({
    queryKey: ['my-club-memberships', user?.email],
    queryFn: () => base44.entities.ClubMembership.filter({ user_email: user?.email }, '-created_date', 5),
    enabled: !!user?.email,
  });

  const actions = quickActions[role] || quickActions.player;
  const allActivities = [
    ...bookings.map(b => ({ ...b, type: 'Booking', name: b.ground_name })),
    ...tournamentRegs.map(t => ({ ...t, type: 'Tournament', name: t.tournament_name })),
    ...clubMemberships.map(c => ({ ...c, type: 'Club', name: c.club_name })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, <span className="text-primary">{user?.full_name?.split(' ')[0] || 'Player'}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {!user?.user_role ? (
            <Link to="/RoleSelect" className="text-primary underline">Select your role to get started →</Link>
          ) : (
            `Here's your ${role.replace('_', ' ')} dashboard`
          )}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={action.path}>
                <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* My Activities */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">My Activities</h2>
        {allActivities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No activities yet. Start exploring!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {allActivities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {activity.type === 'Booking' && <Dumbbell className="w-5 h-5 text-primary" />}
                      {activity.type === 'Tournament' && <Trophy className="w-5 h-5 text-primary" />}
                      {activity.type === 'Club' && <Users className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{activity.name || activity.type}</p>
                      <p className="text-xs text-muted-foreground">{activity.type}</p>
                    </div>
                    <Badge className={statusColors[activity.status] || 'bg-muted text-muted-foreground'}>
                      {activity.status || 'pending'}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}