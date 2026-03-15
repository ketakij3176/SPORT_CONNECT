import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, UserMinus, UserPlus, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

async function followPlayer({ playerId }) {
  console.log('followPlayer', { playerId });
  return { success: true };
}
async function messagePlayer({ playerId, message }) {
  console.log('messagePlayer', { playerId, message });
  return { success: true };
}
async function removePlayer({ playerId }) {
  console.log('removePlayer', { playerId });
  return { success: true };
}
async function blockPlayer({ playerId }) {
  console.log('blockPlayer', { playerId });
  return { success: true };
}

const PLAYERS = {
  'player-1': {
    id: 'player-1',
    name: 'Rohan Desai',
    avatar: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg',
    role: 'Cricket all‑rounder',
    skills: ['Right‑hand bat', 'Medium pace', 'Finisher', 'Team strategist'],
    achievements: [
      'Top scorer – Virar Premier League 2025',
      'Player of the tournament – Monsoon Cup',
    ],
    availability: [
      'Weekdays: 7:00 PM – 9:00 PM',
      'Sundays: 7:00 AM – 10:00 AM',
    ],
  },
  'player-2': {
    id: 'player-2',
    name: 'Aisha Khan',
    avatar: 'https://images.pexels.com/photos/1080884/pexels-photo-1080884.jpeg',
    role: 'Football winger',
    skills: ['Left‑wing', 'Dribbling', 'Crossing', 'High work‑rate'],
    achievements: [
      'Best midfielder – Inter‑college Football 2024',
      'Captain – City Women FC',
    ],
    availability: [
      'Weekdays: 6:00 AM – 8:00 AM',
      'Weekends: 5:00 PM – 8:30 PM',
    ],
  },
};

const DEFAULT_PLAYER = PLAYERS['player-1'];

export default function PlayerConnection() {
  const { id } = useParams();
  const player = PLAYERS[id] || DEFAULT_PLAYER;

  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');

  const handleFollow = async () => {
    const result = await followPlayer({ playerId: player.id });
    if (result?.success) {
      setIsFollowing(true);
      const text = 'Connection successful! You are now following this player.';
      toast.success(text);
      window.alert(text);
    }
  };

  const handleMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error('Please enter a message.');
      return;
    }
    const result = await messagePlayer({ playerId: player.id, message: trimmed });
    if (result?.success) {
      const text = 'Connection successful! Message sent privately.';
      toast.success(text);
      window.alert(text);
      setMessage('');
    }
  };

  const handleRemove = async () => {
    const result = await removePlayer({ playerId: player.id });
    if (result?.success) {
      setIsFollowing(false);
      const text = 'Player removed from your connections.';
      toast.success(text);
      window.alert(text);
    }
  };

  const handleBlock = async () => {
    const result = await blockPlayer({ playerId: player.id });
    if (result?.success) {
      const text = 'Player blocked. You will no longer see their activity.';
      toast.success(text);
      window.alert(text);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={player.avatar} alt={player.name} />
              <AvatarFallback>
                {player.name
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{player.name}</h1>
              {player.role && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {player.role}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {player.skills.slice(0, 2).map(skill => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-semibold mb-2">Skills</h2>
              <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
                {player.skills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-2">Achievements</h2>
              <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
                {player.achievements.map(ach => (
                  <li key={ach}>{ach}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Availability</h2>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              {player.availability.map(slot => (
                <li key={slot}>{slot}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Button
                className="flex items-center gap-2"
                disabled={isFollowing}
                onClick={handleFollow}
              >
                <UserPlus className="w-4 h-4" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleMessage}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleRemove}
              >
                <UserMinus className="w-4 h-4" />
                Remove
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2 text-red-700 border-red-200 hover:bg-red-50"
                onClick={handleBlock}
              >
                <ShieldAlert className="w-4 h-4" />
                Block
              </Button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Private message
              </label>
              <textarea
                className="w-full min-h-[80px] text-sm rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                placeholder="Introduce yourself, share your position, or propose a game time..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                All actions here are private. Only this connection page is
                visible while you interact with the player.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

