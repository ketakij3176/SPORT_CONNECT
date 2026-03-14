import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { navigateToLogin, loginDemo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('player');

  const handleDemoLogin = (e) => {
    e.preventDefault();
    loginDemo({ name, email, role });
    navigate('/Dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-foreground">SportConnect</h1>
              <p className="text-xs text-muted-foreground">Sign in to explore your sports hub</p>
            </div>
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Virat Sharma"
                className="bg-slate-900/60 border-slate-700 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="virat@example.com"
                className="bg-slate-900/60 border-slate-700 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-slate-900/60 border-slate-700">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="club_owner">Club Owner</SelectItem>
                  <SelectItem value="supplier">Equipment Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full mt-2 rounded-full">
              <LogIn className="w-4 h-4 mr-2" /> Continue as Demo User
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 space-y-3">
            <p className="text-[11px] text-muted-foreground text-center uppercase tracking-wide">
              Have a real SportConnect / Base44 account?
            </p>
            <Button
              variant="outline"
              className="w-full rounded-full border-slate-700 text-xs"
              onClick={navigateToLogin}
            >
              Sign in with SportConnect account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

