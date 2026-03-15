import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

// Placeholder backend function
async function bookGround({ groundId, date, time, people }) {
  console.log('bookGround payload', { groundId, date, time, people });
  return { success: true };
}

const GROUNDS = {
  'virar-1': {
    id: 'virar-1',
    name: 'Virar Premier Cricket Ground',
    address: 'Near Arnala Road, Virar West',
    surface: 'Natural turf wicket with outfield',
    facilities: ['Floodlights', 'Dressing rooms', 'Scoreboard', 'Parking'],
    images: [
      'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
      'https://images.pexels.com/photos/164490/pexels-photo-164490.jpeg',
    ],
    rules: [
      'Arrive 20 minutes before your slot for warm‑up.',
      'Cricket spikes only on the wicket, non‑marking shoes in the outfield.',
      'No plastic bottles on the ground – use dug‑out area.',
      'Full payment required before play. No refunds on no‑shows.',
    ],
    rating: 4.7,
    ratingCount: 214,
    priceInfo: 'Weekdays ₹1,200/hr • Weekends ₹1,500/hr',
  },
  'virar-2': {
    id: 'virar-2',
    name: 'Virar Football Arena',
    address: 'Virar East Sports Complex',
    surface: '5‑a‑side artificial turf',
    facilities: ['Shower & lockers', 'Cafeteria', 'Free drinking water'],
    images: [
      'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
      'https://images.pexels.com/photos/3991870/pexels-photo-3991870.jpeg',
    ],
    rules: [
      'Non‑marking studs or turf shoes only.',
      'No sliding tackles during recreational bookings.',
      'Keep valuables in lockers – management not responsible for loss.',
      'Bookings are in 60‑minute blocks including warm‑up/cool‑down.',
    ],
    rating: 4.5,
    ratingCount: 167,
    priceInfo: 'Standard slot ₹1,000/hr • Night slot ₹1,300/hr',
  },
};

const DEFAULT_GROUND = GROUNDS['virar-1'];

export default function GroundBooking() {
  const { id } = useParams();
  const ground = GROUNDS[id] || DEFAULT_GROUND;

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [people, setPeople] = useState(2);

  const handleConfirm = async () => {
    if (!date || !timeSlot || !people) {
      toast.error('Please fill all booking details.');
      return;
    }

    const result = await bookGround({
      groundId: ground.id,
      date,
      time: timeSlot,
      people,
    });

    if (result?.success) {
      const message = `Booking successful! ${ground.name} on ${date} at ${timeSlot} for ${people} player(s).`;
      toast.success(message);
      window.alert(message);
    } else {
      toast.error('Booking failed. Please try again.');
      window.alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid gap-8 lg:grid-cols-[2fr,1.3fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-[2fr,1.3fr] mb-6">
            <div className="h-60 sm:h-72 rounded-xl overflow-hidden bg-muted">
              <img
                src={ground.images[0]}
                alt={ground.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid gap-3">
              {ground.images.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  className="h-28 rounded-xl overflow-hidden bg-muted"
                >
                  <img
                    src={img}
                    alt={`${ground.name} ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {ground.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {ground.address}
              </p>
              {ground.surface && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Surface: {ground.surface}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="flex items-center gap-1 bg-amber-100 text-amber-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{ground.rating.toFixed(1)}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                ({ground.ratingCount} ratings)
              </span>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-3">Ground Rules</h2>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                {ground.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
              {ground.facilities && (
                <div className="mt-4">
                  <h3 className="font-semibold text-sm mb-1">Facilities</h3>
                  <p className="text-xs text-muted-foreground">
                    {ground.facilities.join(' • ')}
                  </p>
                </div>
              )}
              {ground.priceInfo && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {ground.priceInfo}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-semibold text-lg mb-1">Book your slot</h2>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  placeholder="e.g. 7:00 AM - 8:00 AM"
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Number of players</Label>
                <Input
                  type="number"
                  min={1}
                  value={people}
                  onChange={e =>
                    setPeople(
                      Number.isNaN(parseInt(e.target.value, 10))
                        ? 1
                        : parseInt(e.target.value, 10)
                    )
                  }
                />
              </div>

              <Button
                className="w-full mt-4"
                onClick={handleConfirm}
              >
                Confirm Booking
              </Button>

              <p className="text-xs text-muted-foreground mt-2">
                You will receive a confirmation with your booking details.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

