import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44, isBase44Configured } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Users, Award, Trophy, Building2, ShoppingBag, GraduationCap, Dumbbell, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const roles = [
  { id: 'player', label: 'Player', desc: 'Find games, teammates & tournaments', icon: Users },
  { id: 'coach', label: 'Coach', desc: 'Offer training sessions & manage trainees', icon: Award },
  { id: 'organizer', label: 'Tournament Organizer', desc: 'Create & manage tournaments', icon: Trophy },
  { id: 'club_owner', label: 'Sports Club Owner', desc: 'Manage clubs & accept bookings', icon: Building2 },
  { id: 'supplier', label: 'Equipment Supplier', desc: 'List equipment for sale or rent', icon: ShoppingBag },
  { id: 'academy', label: 'Sports Academy', desc: 'Manage academy programs & enrollments', icon: GraduationCap },
  { id: 'trainer', label: 'Fitness Trainer', desc: 'Offer fitness & training programs', icon: Dumbbell },
];

export default function RoleSelect() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.user_role) setSelected(u.user_role);
    }).catch(() => {});
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    setSaving(true);
    if (isBase44Configured && base44?.auth?.updateMe) {
      try {
        base44.auth.updateMe({ user_role: selected });
      } catch (err) {
        console.error('Failed to persist role (ignored in demo):', err);
      }
    }
    toast.success('Role selected!');
    navigate('/Dashboard');
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to SportConnect</h1>
          <p className="text-muted-foreground mt-2">Select your role to personalize your experience</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(role.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{role.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{role.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="rounded-full px-10 h-12"
            disabled={!selected || saving}
            onClick={handleContinue}
          >
            {saving ? 'Saving...' : 'Continue'} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}