# Happy Sourdough - Animation & Micro-interaction Guide

This document outlines all the subtle animations and micro-interactions added to enhance the user experience of the Happy Sourdough bakery website.

## Design Philosophy

All animations follow these principles:
- **Subtle & Warm**: Animations enhance, not distract
- **Performant**: CSS-based animations with GPU acceleration
- **Organic Feel**: Easing curves mimic natural motion (cubic-bezier(0.16, 1, 0.3, 1))
- **Accessible**: Respects user preferences (prefers-reduced-motion)
- **Delightful**: Small touches that make the experience feel polished

## Animation Classes

### Core Animations

#### Fade & Slide
- `.animate-fade-in` - Gentle fade in (0.5s)
- `.animate-slide-up` - Slide up with fade (0.6s)
- `.animate-slide-in-left` - Slide in from left (0.5s)
- `.animate-slide-in-right` - Slide in from right (0.5s)

#### Scale & Transform
- `.animate-scale-in` - Scale in with fade (0.4s)
- `.animate-bounce-subtle` - Gentle bounce effect (0.6s)
- `.animate-float` - Floating motion for decorative elements (6s loop)
- `.animate-rotate-gentle` - Slow rotation (20s loop)
- `.animate-heartbeat` - Heartbeat pulse (1.5s loop)

#### Loading States
- `.animate-spin` - Standard spinner rotation (1s linear)
- `.animate-shimmer` - Shimmer effect (2s loop)
- `.skeleton-pulse` - Warm gradient pulse for loading skeletons

### Staggered Animations

`.animate-stagger` - Apply to container for staggered children animations
- Child 1: 0.05s delay
- Child 2: 0.1s delay
- Child 3: 0.15s delay
- Child 4: 0.2s delay
- etc. (up to 8 children)

**Usage:**
```tsx
<div className="grid grid-cols-4 animate-stagger">
  <ProductCard /> {/* Appears first */}
  <ProductCard /> {/* Appears second */}
  <ProductCard /> {/* Appears third */}
  <ProductCard /> {/* Appears fourth */}
</div>
```

### Scroll Reveal

`.scroll-reveal` - Elements with this class fade in when scrolled into view
- Add `.revealed` class when in viewport (via Intersection Observer)

**Component Usage:**
```tsx
import { ScrollReveal } from '@/components/ui/scroll-reveal';

<ScrollReveal delay={100} threshold={0.1}>
  <h2>This will fade in on scroll</h2>
</ScrollReveal>
```

### Hover Effects

#### Lift Effect
`.hover-lift` - Gentle upward lift on hover with shadow enhancement
- Transform: -4px translateY
- Enhanced shadow on hover

**Usage on Product Cards:**
```tsx
<Card className="hover-lift">
  {/* Card content */}
</Card>
```

#### Button Effects
All buttons automatically get:
- Subtle upward lift on hover (-0.5px)
- Scale down on active press (0.97)
- Shadow enhancement
- Smooth color transitions

### Interactive Element Transitions

#### Smooth Transitions
`.transition-smooth` - Smooth all-property transition (0.3s)
`.transition-bounce` - Bouncy transform transition (0.3s)

#### Built-in Micro-interactions

**Product Cards:**
- Image scales and rotates slightly on hover (110% scale, 1deg rotate)
- Gradient overlay fades in
- Title changes color to primary
- Price scales up subtly
- Border color changes to accent

**Buttons:**
- Press effect (scale 0.96)
- Lift on hover
- Shadow depth increases
- All variants have consistent feel

**Form Inputs:**
- Subtle scale up on focus (1.01)
- Ring appears smoothly
- Shadow enhancement
- Hover state with lighter ring

**Cards:**
- Shadow enhancement on hover
- Smooth border color transition

## Component Enhancements

### /src/components/ui/button.tsx
- Active press animation (scale-95)
- Hover lift effect (-0.5px translate)
- Shadow transitions
- All variants enhanced

### /src/components/ui/input.tsx
- Focus scale effect (1.01)
- Hover border preview
- Smooth ring transitions
- Shadow on focus

### /src/components/ui/card.tsx
- Shadow transitions on hover
- Rounded corners (2xl)
- Subtle border glow

### /src/components/ui/skeleton.tsx
- Custom shimmer pulse
- Warm gradient animation
- Bakery-themed colors

### /src/components/products/product-card.tsx
- Image zoom and rotate on hover
- Gradient overlay fade
- Price animation
- Title color shift
- Badge scale animation

## Page Animations

### Homepage (/(shop)/page.tsx)

**Hero Section:**
- Badge: scale-in animation
- Headline: slide-up with stagger
- Description: fade-in with delay
- CTA buttons: fade-in with delay
- Floating background gradients

**Features Section:**
- Icon containers scale on hover
- Cards lift on hover with border color change

**Product Grid:**
- Staggered fade-in for product cards

**Testimonials:**
- Staggered entry
- Scale on hover
- Star icons scale individually

## CSS Custom Properties

All animations use warm, bakery-themed colors:
- Primary: Espresso brown
- Secondary: Warm crust orange
- Accent: Golden honey

Easing functions:
- Standard: `cubic-bezier(0.16, 1, 0.3, 1)` - Smooth deceleration
- Bounce: `cubic-bezier(0.34, 1.56, 0.64, 1)` - Gentle bounce

## Performance Notes

- All animations use `transform` and `opacity` for GPU acceleration
- No expensive layout thrashing
- CSS-based animations (not JavaScript)
- Smooth 60fps on modern devices
- Graceful degradation on older browsers

## Accessibility

- All animations respect `prefers-reduced-motion`
- Enhanced focus states with visible outlines
- Keyboard navigation fully supported
- Color contrast maintained during animations
- Touch targets meet WCAG guidelines (44px minimum on mobile)

## Future Enhancements

Potential additions:
- View transitions API for page navigation
- Success toast animations
- Cart item add animation
- Order progress animations
- Parallax scrolling effects (subtle)
- Confetti on order completion

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile Safari 14+
- Chrome Android 90+

All animations gracefully degrade in older browsers.
