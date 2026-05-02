'use client';

import Link from 'next/link';
import { Play, Shield, Zap, Star } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden flex flex-col items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />
        
        <div className="container px-4 md:px-6 text-center animate-fade-in">
          <div className="inline-flex items-center rounded-full border border-glass-border bg-secondary/30 px-3 py-1 text-sm mb-6 backdrop-blur-sm">
            <Star className="mr-2 h-4 w-4 text-primary fill-primary" />
            <span className="text-foreground/80 font-medium">Next Generation Video Archival</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Experience Video <br /> 
            <span className="text-primary italic">Beyond the Horizon</span>
          </h1>
          
          <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl mb-10 leading-relaxed">
            ClipSphere delivers cinematic-grade archival and real-time streaming for industrial fleet management.
            Secure, fast, and engineered for the next decade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="premium-button flex items-center justify-center">
              <Play className="mr-2 h-5 w-5 fill-current" />
              Get Started
            </Link>
            <Link href="/sensors" className="px-6 py-3 rounded-full border border-glass-border hover:bg-secondary/30 transition-all font-semibold flex items-center justify-center">
              View Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Industrial Security",
              description: "End-to-end encryption for all your archival data and real-time streams.",
              icon: Shield,
              color: "text-blue-500"
            },
            {
              title: "Ultra Low Latency",
              description: "Optimized network stack for real-time WHIP/WHEP streaming across the globe.",
              icon: Zap,
              color: "text-yellow-500"
            },
            {
              title: "Cinematic Quality",
              description: "Presets and hardware acceleration for crystal clear video quality at any bitrate.",
              icon: Star,
              color: "text-primary"
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl group hover:-translate-y-2 transition-transform duration-300">
              <feature.icon className={`h-12 w-12 mb-6 ${feature.color}`} />
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
