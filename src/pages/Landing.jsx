import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Trophy, Users, ShoppingBag, Dumbbell, MessageCircle,
  ArrowRight, Zap, ChevronRight
} from 'lucide-react';

const features = [
  { icon: MapPin, title: 'Discover Nearby', desc: 'Find sports grounds, clubs, and tournaments near you using interactive maps.' },
  { icon: Trophy, title: 'Join Tournaments', desc: 'Compete in local tournaments. Register your team and track standings.' },
  { icon: Users, title: 'Find Players', desc: 'Connect with nearby players. Build your dream team for any sport.' },
  { icon: Dumbbell, title: 'Book Grounds', desc: 'Reserve sports grounds instantly. Choose your slot and play.' },
  { icon: ShoppingBag, title: 'Equipment Hub', desc: 'Buy or rent sports equipment. Compare prices across sellers.' },
  { icon: MessageCircle, title: 'Chat & Connect', desc: 'Message players, coaches, and organizers directly.' },
];

const stats = [
  { value: '10K+', label: 'Active Players' },
  { value: '500+', label: 'Sports Grounds' },
  { value: '200+', label: 'Tournaments' },
  { value: '50+', label: 'Cities' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SportConnect</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/landing">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>

            <Link to="/signup">
              <Button size="sm" className="rounded-full">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-28 relative">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Your Sports Hub — All in One Place
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Play. Compete.<br />
              <span className="text-primary">Connect.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Discover nearby sports grounds, join tournaments, find teammates, and gear up — all from one beautifully simple platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link to="/signup">
                <Button size="lg" className="rounded-full text-base px-8 h-12">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link to="/discover-map">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-12">
                  Explore Map
                </Button>
              </Link>

            </div>

          </motion.div>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
          >

            {stats.map((stat, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 text-center shadow-sm border">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}

          </motion.div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-muted/30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need to Play
            </h2>

            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              From discovering grounds to finding teammates, SportConnect brings the entire sports ecosystem to your fingertips.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {features.map((f, i) => {
              const Icon = f.icon;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-all duration-300 group"
                >

                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>

                </motion.div>
              );
            })}

          </div>
        </div>
      </section>

    </div>
  );
}