import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Grounds() {
  const [grounds, setGrounds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('grounds').select('*').then(({ data }) => setGrounds(data || []));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book a Ground</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        {grounds.map(g => (
          <Card key={g.id}>
            <CardContent>
              <h3 className="font-semibold">{g.name}</h3>
              <p>₹{g.price_per_hour}/hr</p>
              <Button className="mt-2" onClick={() => navigate(`/ground-booking/${g.id}`)}>Book Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
