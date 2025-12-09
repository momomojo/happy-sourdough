import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function AnimationsDemoPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-24">
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl font-bold">Animation System Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This page demonstrates all the subtle animations and micro-interactions
          added to the Happy Sourdough website.
        </p>
      </div>

      {/* Fade Animations */}
      <ScrollReveal>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Fade & Slide Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Fade In</CardTitle>
                <CardDescription>Simple opacity transition</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm">.animate-fade-in</code>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Slide Up</CardTitle>
                <CardDescription>Slide from bottom with fade</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm">.animate-slide-up</code>
              </CardContent>
            </Card>

            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Scale In</CardTitle>
                <CardDescription>Scale from center with fade</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm">.animate-scale-in</code>
              </CardContent>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Staggered Animations */}
      <ScrollReveal delay={100}>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Staggered Animations</h2>
          <p className="text-muted-foreground">
            Perfect for product grids - each item appears with a slight delay
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-stagger">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-2xl mb-3">
                    {i}
                  </div>
                  <p className="text-sm text-muted-foreground">Item {i}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Button States */}
      <ScrollReveal delay={200}>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Button Micro-interactions</h2>
          <p className="text-muted-foreground">
            All buttons have press, hover, and focus animations
          </p>
          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>
      </ScrollReveal>

      {/* Hover Effects */}
      <ScrollReveal delay={300}>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Hover Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Hover Lift</CardTitle>
                <CardDescription>Card lifts with enhanced shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm">.hover-lift</code>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hover over this card to see the effect
                </p>
              </CardContent>
            </Card>

            <Card className="transition-smooth hover:border-accent/50">
              <CardHeader>
                <CardTitle>Smooth Transition</CardTitle>
                <CardDescription>All properties transition smoothly</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm">.transition-smooth</code>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hover over this card to see border change
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Loading States */}
      <ScrollReveal delay={400}>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Loading States</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Pulse</CardTitle>
                <CardDescription>Warm gradient shimmer effect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Form Elements */}
      <ScrollReveal delay={500}>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Form Elements</h2>
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Focus States</CardTitle>
              <CardDescription>
                Click or tab into inputs to see enhanced focus effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Focus me to see the animation" />
              <Input placeholder="Hover over me first" />
              <Input placeholder="Tab through for keyboard focus" />
            </CardContent>
          </Card>
        </section>
      </ScrollReveal>

      {/* Continuous Animations */}
      <ScrollReveal delay={600}>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Continuous Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-float">
                  ⬆️
                </div>
                <h3 className="font-semibold mb-2">Float</h3>
                <code className="text-sm">.animate-float</code>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-rotate-gentle">
                  🔄
                </div>
                <h3 className="font-semibold mb-2">Gentle Rotation</h3>
                <code className="text-sm">.animate-rotate-gentle</code>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-heartbeat">
                  ❤️
                </div>
                <h3 className="font-semibold mb-2">Heartbeat</h3>
                <code className="text-sm">.animate-heartbeat</code>
              </CardContent>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Scroll Reveal */}
      <section className="min-h-screen flex items-center justify-center">
        <ScrollReveal delay={100} threshold={0.3}>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Scroll Reveal Component</CardTitle>
              <CardDescription>
                This card revealed when you scrolled it into view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The ScrollReveal component uses Intersection Observer to detect when
                elements enter the viewport and animates them in smoothly. It&apos;s
                configurable with delay and threshold options.
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      {/* Final Section */}
      <div className="text-center space-y-4 pb-16">
        <h2 className="text-3xl font-bold">All animations are performant</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Using CSS transforms and opacity for GPU acceleration, with organic
          easing curves for natural motion. The site feels polished and delightful
          without sacrificing performance.
        </p>
        <Button size="lg" className="mt-8">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
