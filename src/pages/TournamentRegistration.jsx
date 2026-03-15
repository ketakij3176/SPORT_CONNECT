import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';

async function registerForTournament(payload) {
  console.log('registerForTournament payload', payload);
  return { success: true };
}
async function followOrganizer({ organizerId }) {
  console.log('followOrganizer', { organizerId });
  return { success: true };
}
async function messageOrganizer({ organizerId, message }) {
  console.log('messageOrganizer', { organizerId, message });
  return { success: true };
}

const TOURNAMENTS = {
  'tour-1': {
    id: 'tour-1',
    name: 'Virar Champions Trophy',
    ground: 'Virar Premier Cricket Ground',
    organizerId: 'org-cricket-1',
    description: 'Flagship leather-ball cricket tournament for local clubs around Virar.',
    schedule: [
      { day: 'Day 1', date: '2026-05-10', focus: 'Group Stage – League matches' },
      { day: 'Day 2', date: '2026-05-11', focus: 'Quarter & Semi Finals' },
      { day: 'Day 3', date: '2026-05-12', focus: 'Grand Final & Closing ceremony' },
    ],
    categories: [
      { id: 'u-19', label: 'Under 19', type: 'Age' },
      { id: 'open', label: 'Open Category', type: 'Skill' },
      { id: 'veterans', label: '30+ Veterans', type: 'Age' },
    ],
    teamSizes: [11],
    feeInfo: 'Entry fee ₹4,000 per team • White kit mandatory',
  },
  'tour-2': {
    id: 'tour-2',
    name: 'Monsoon Football League',
    ground: 'Virar Football Arena',
    organizerId: 'org-football-1',
    description: 'Fast-paced 5‑a‑side league played under lights over 3 evenings.',
    schedule: [
      { day: 'Day 1', date: '2026-06-02', focus: 'League matches – Group A & B' },
      { day: 'Day 2', date: '2026-06-03', focus: 'Knockouts & semi‑finals' },
      { day: 'Day 3', date: '2026-06-04', focus: 'Final, awards & photoshoot' },
    ],
    categories: [
      { id: 'open', label: 'Open 5‑a‑side', type: 'Team' },
      { id: 'corporate', label: 'Corporate Teams', type: 'Team' },
    ],
    teamSizes: [5, 7],
    feeInfo: 'Entry fee ₹3,000 per team • Turf studs only',
  },
};

const DEFAULT_TOURNAMENT = TOURNAMENTS['tour-1'];

export default function TournamentRegistration() {
  const { id } = useParams();
  const tournament = TOURNAMENTS[id] || DEFAULT_TOURNAMENT;

  const [selectedCategory, setSelectedCategory] = useState(
    tournament.categories[0]?.id || ''
  );
  const [teamSize, setTeamSize] = useState(tournament.teamSizes[0] || 5);
  const [selectedDays, setSelectedDays] = useState(
    tournament.schedule.map(s => s.day)
  );
  const [message, setMessage] = useState('');

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleRegister = async () => {
    if (!selectedCategory || !teamSize || selectedDays.length === 0) {
      toast.error('Please complete all registration details.');
      return;
    }
    const result = await registerForTournament({
      tournamentId: tournament.id,
      category: selectedCategory,
      teamSize,
      days: selectedDays,
    });
    if (result?.success) {
      const message = `Registration successful for ${tournament.name} (${selectedCategory}, ${teamSize}-a-side).`;
      toast.success(message);
      window.alert(message);
    } else {
      toast.error('Registration failed. Please try again.');
      window.alert('Registration failed. Please try again.');
    }
  };

  const handleFollow = async () => {
    const result = await followOrganizer({ organizerId: tournament.organizerId });
    if (result?.success) {
      const message = 'You are now following the organizer.';
      toast.success(message);
      window.alert(message);
    }
  };

  const handleMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error('Please enter a message for the organizer.');
      return;
    }
    const result = await messageOrganizer({
      organizerId: tournament.organizerId,
      message: trimmed,
    });
    if (result?.success) {
      const messageText = 'Message sent to the organizer.';
      toast.success(messageText);
      window.alert(messageText);
      setMessage('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              {tournament.name}
            </h1>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {tournament.ground}
          </p>
          {tournament.description && (
            <p className="mt-2 text-xs text-muted-foreground max-w-xl">
              {tournament.description}
            </p>
          )}
        </div>
        <Badge className="bg-primary/10 text-primary text-xs">
          Tournament
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr,1.2fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h2 className="font-semibold flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                3-day Schedule
              </h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                {tournament.schedule.map(item => (
                  <div
                    key={item.day}
                    className="flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium">{item.day}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.focus}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.date}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                Categories
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {tournament.categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={[
                      'border rounded-lg px-3 py-2 text-left text-sm transition-all',
                      selectedCategory === cat.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted',
                    ].join(' ')}
                  >
                    <p className="font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.type} category
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-semibold text-lg mb-1">
                Register for tournament
              </h2>

              <div className="space-y-2">
                <Label>Team size</Label>
                <div className="flex flex-wrap gap-2">
                  {tournament.teamSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamSize(size)}
                      className={[
                        'px-3 py-1.5 rounded-full text-xs border transition-all',
                        teamSize === size
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted',
                      ].join(' ')}
                    >
                      {size}-a-side
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Days</Label>
                <div className="flex flex-wrap gap-2">
                  {tournament.schedule.map(item => (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => toggleDay(item.day)}
                      className={[
                        'px-3 py-1.5 rounded-full text-xs border transition-all',
                        selectedDays.includes(item.day)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted',
                      ].join(' ')}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full mt-2"
                onClick={handleRegister}
              >
                Register
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-semibold text-lg mb-1">
                Organizer actions
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleFollow}
                >
                  Follow Organizer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleMessage}
                >
                  Message Organizer
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Message (optional)</Label>
                <Input
                  placeholder="Ask about rules, fees, or timings..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Only tournament details and organizer actions are shown on this
                page for a focused experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

