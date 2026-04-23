'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-500 
                 border border-glass-border flex items-center justify-center group overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative z-10 transition-transform duration-500 group-hover:rotate-12">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-foreground animate-fade-in" />
        ) : (
          <Sun className="w-5 h-5 text-primary animate-fade-in" />
        )}
      </div>
      
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
    </button>
  );
}
