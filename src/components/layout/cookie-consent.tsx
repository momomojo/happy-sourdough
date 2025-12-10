'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'happy-sourdough-cookie-consent';

type ConsentStatus = 'all' | 'essential' | null;

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (!savedConsent) {
      // Show banner after a brief delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    if (status) {
      localStorage.setItem(COOKIE_CONSENT_KEY, status);
    }

    // Animate out
    setIsAnimating(false);

    // Remove from DOM after animation
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-300 ease-out',
        'md:bottom-4 md:left-4 md:right-auto md:max-w-md',
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <Card className="shadow-2xl border-2 border-primary/20 bg-background/98 backdrop-blur-md">
        <CardContent className="p-5 md:p-6 gap-0">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl transition-transform duration-200 hover:rotate-12" aria-hidden="true">🍪</span>
              <h3 className="font-bold text-base text-foreground">We use cookies</h3>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleConsent('essential')}
              className="h-7 w-7 -mt-1 -mr-1 hover:bg-accent/50"
              aria-label="Decline non-essential cookies"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            We use cookies to enhance your browsing experience and analyze our traffic.
            Essential cookies are required for the site to function properly.{' '}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-semibold underline-offset-2 hover:text-primary/80 transition-colors duration-200"
            >
              Learn more
            </Link>
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              onClick={() => handleConsent('all')}
              className="flex-1 min-h-[44px] shadow-md hover:shadow-lg"
            >
              Accept All
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConsent('essential')}
              className="flex-1 min-h-[44px]"
            >
              Essential Only
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
