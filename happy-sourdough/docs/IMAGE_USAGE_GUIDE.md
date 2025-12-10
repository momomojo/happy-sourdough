# Image Usage Guide - Happy Sourdough

Quick reference for using organized images in the Happy Sourdough application.

---

## Import the Mapping

```typescript
import {
  LOGO,
  HERO,
  PRODUCTS,
  CATEGORIES,
  LIFESTYLE,
  UI,
  SOCIAL,
  getProductImage,
  getCategoryHeader,
  getRandomUIVariant
} from '@/data/image-mapping'
```

---

## Common Use Cases

### 1. Logo in Header

```tsx
import Image from 'next/image'
import { LOGO } from '@/data/image-mapping'

export function Header() {
  return (
    <header>
      <Image
        src={LOGO.PRIMARY}
        alt="Happy Sourdough Artisan Bakery"
        width={200}
        height={80}
        priority
      />
    </header>
  )
}
```

### 2. Favicon/Icon

```tsx
// In app/layout.tsx or metadata
import { LOGO } from '@/data/image-mapping'

export const metadata = {
  icons: {
    icon: LOGO.ICON,
  },
}
```

### 3. Hero Section

```tsx
import { HERO } from '@/data/image-mapping'

export function HeroSection() {
  return (
    <section className="hero">
      <Image
        src={HERO.HOMEPAGE}
        alt="Welcome to Happy Sourdough Bakery"
        width={1920}
        height={600}
        priority
      />
    </section>
  )
}
```

### 4. Product Display

```tsx
import { PRODUCTS } from '@/data/image-mapping'

export function ProductCard() {
  return (
    <div className="product-card">
      <Image
        src={PRODUCTS.BREADS.CLASSIC_SOURDOUGH}
        alt="Classic Sourdough Loaf"
        width={400}
        height={400}
      />
      <h3>Classic Sourdough</h3>
      <p>$8.00</p>
    </div>
  )
}
```

### 5. Category Page Header

```tsx
import { CATEGORIES, getCategoryHeader } from '@/data/image-mapping'

export function CategoryHeader({ category }: { category: string }) {
  // Option 1: Direct access
  return <Image src={CATEGORIES.BREADS} alt="Breads" />

  // Option 2: Using helper function
  const imageSrc = getCategoryHeader(category.toUpperCase() as any)
  return <Image src={imageSrc} alt={`${category} Category`} />
}
```

### 6. Dynamic Product Image Lookup

```tsx
import { getProductImage } from '@/data/image-mapping'

export function DynamicProductCard({ category, productName }: Props) {
  const imageSrc = getProductImage(
    category.toUpperCase() as any,
    productName
  )

  return (
    <Image
      src={imageSrc || '/images/placeholder.png'}
      alt={productName}
      width={400}
      height={400}
    />
  )
}
```

### 7. Empty Cart State (Random Variant)

```tsx
import { getRandomUIVariant } from '@/data/image-mapping'

export function EmptyCart() {
  const emptyCartImage = getRandomUIVariant('EMPTY_CART')

  return (
    <div className="empty-cart">
      <Image
        src={emptyCartImage}
        alt="Your cart is empty"
        width={300}
        height={300}
      />
      <p>Your cart is empty. Start shopping!</p>
    </div>
  )
}
```

### 8. Order Status Images

```tsx
import { UI } from '@/data/image-mapping'

export function OrderStatus({ status }: { status: string }) {
  const getStatusImage = () => {
    switch (status) {
      case 'baking':
      case 'decorating':
        return UI.BAKING_IN_PROGRESS.VARIANT_1
      case 'ready':
      case 'delivered':
        return UI.ORDER_CONFIRMED.VARIANT_1
      default:
        return null
    }
  }

  const imageSrc = getStatusImage()
  if (!imageSrc) return null

  return (
    <Image
      src={imageSrc}
      alt={`Order ${status}`}
      width={400}
      height={300}
    />
  )
}
```

### 9. Lifestyle/Marketing Images

```tsx
import { LIFESTYLE } from '@/data/image-mapping'

export function AboutSection() {
  return (
    <section className="about">
      <div className="grid grid-cols-2 gap-4">
        <Image
          src={LIFESTYLE.KITCHEN.SCENE_1}
          alt="Our bakers at work"
          width={600}
          height={400}
        />
        <Image
          src={LIFESTYLE.CAFE.SCENE_1}
          alt="Our cozy bakery"
          width={600}
          height={400}
        />
      </div>
    </section>
  )
}
```

### 10. Social Media Preview

```tsx
import { SOCIAL } from '@/data/image-mapping'

// In app/layout.tsx or page metadata
export const metadata = {
  openGraph: {
    images: [
      {
        url: SOCIAL.FACEBOOK.COVER,
        width: 1200,
        height: 630,
        alt: 'Happy Sourdough Bakery',
      },
    ],
  },
  twitter: {
    images: [SOCIAL.INSTAGRAM.POST_1],
  },
}
```

---

## Image Paths Reference

### Quick Copy-Paste

```typescript
// Logos
LOGO.PRIMARY              // /images/logo/primary-logo.png
LOGO.ICON                 // /images/logo/icon-favicon.png

// Hero
HERO.HOMEPAGE             // /images/hero/homepage-hero.png
HERO.ABOUT                // /images/hero/about-section.png

// Products - Breads
PRODUCTS.BREADS.CLASSIC_SOURDOUGH       // /images/products/breads/classic-sourdough-loaf.png
PRODUCTS.BREADS.OLIVE_ROSEMARY          // /images/products/breads/olive-rosemary-sourdough.png
PRODUCTS.BREADS.WHOLE_WHEAT             // /images/products/breads/whole-wheat-sourdough.png
PRODUCTS.BREADS.CINNAMON_RAISIN         // /images/products/breads/cinnamon-raisin-sourdough.png

// Products - Pastries
PRODUCTS.PASTRIES.SOURDOUGH_CROISSANT   // /images/products/pastries/sourdough-croissant.png
PRODUCTS.PASTRIES.ALMOND_CROISSANT      // /images/products/pastries/almond-croissant.png
PRODUCTS.PASTRIES.PAIN_AU_CHOCOLAT      // /images/products/pastries/pain-au-chocolat.png
PRODUCTS.PASTRIES.CINNAMON_ROLL         // /images/products/pastries/cinnamon-roll.png

// Categories
CATEGORIES.BREADS         // /images/categories/breads-header.png
CATEGORIES.PASTRIES       // /images/categories/pastries-header.png
CATEGORIES.CAKES          // /images/categories/cakes-header.png
CATEGORIES.COOKIES        // /images/categories/cookies-header.png

// Lifestyle
LIFESTYLE.DELIVERY.SCENE_1  // /images/lifestyle/delivery-scene-1.png
LIFESTYLE.DELIVERY.SCENE_2  // /images/lifestyle/delivery-scene-2.png
LIFESTYLE.KITCHEN.SCENE_1   // /images/lifestyle/kitchen-scene-1.png
LIFESTYLE.KITCHEN.SCENE_2   // /images/lifestyle/kitchen-scene-2.png
LIFESTYLE.CAFE.SCENE_1      // /images/lifestyle/cafe-scene-1.png
LIFESTYLE.CAFE.SCENE_2      // /images/lifestyle/cafe-scene-2.png
LIFESTYLE.CAFE.SCENE_3      // /images/lifestyle/cafe-scene-3.png
LIFESTYLE.PICNIC            // /images/lifestyle/picnic-scene.png

// UI States
UI.EMPTY_CART.VARIANT_1           // /images/ui/empty-cart-1.png
UI.EMPTY_CART.VARIANT_2           // /images/ui/empty-cart-2.png
UI.ORDER_CONFIRMED.VARIANT_1      // /images/ui/order-confirmed-1.png
UI.ORDER_CONFIRMED.VARIANT_2      // /images/ui/order-confirmed-2.png
UI.BAKING_IN_PROGRESS.VARIANT_1   // /images/ui/baking-in-progress-1.png
UI.BAKING_IN_PROGRESS.VARIANT_2   // /images/ui/baking-in-progress-2.png

// Social Media
SOCIAL.INSTAGRAM.POST_1    // /images/social/instagram-post-1.png
SOCIAL.INSTAGRAM.POST_2    // /images/social/instagram-post-2.png
SOCIAL.INSTAGRAM.STORY_1   // /images/social/instagram-story-1.png
SOCIAL.INSTAGRAM.STORY_2   // /images/social/instagram-story-2.png
SOCIAL.FACEBOOK.COVER      // /images/social/facebook-cover.png
```

---

## Best Practices

### 1. Always Use Next.js Image Component

```tsx
// ✅ Good
import Image from 'next/image'
<Image src={LOGO.PRIMARY} alt="Logo" width={200} height={80} />

// ❌ Bad
<img src={LOGO.PRIMARY} alt="Logo" />
```

### 2. Provide Width and Height

```tsx
// ✅ Good - prevents layout shift
<Image src={HERO.HOMEPAGE} width={1920} height={600} alt="Hero" />

// ⚠️ Acceptable for fill layouts
<div className="relative w-full h-96">
  <Image src={HERO.HOMEPAGE} fill alt="Hero" />
</div>
```

### 3. Use Priority for Above-Fold Images

```tsx
// ✅ Good for hero images, logos
<Image src={LOGO.PRIMARY} priority alt="Logo" />

// ✅ Good for below-fold images (default behavior)
<Image src={PRODUCTS.BREADS.CLASSIC_SOURDOUGH} alt="Product" />
```

### 4. Always Provide Descriptive Alt Text

```tsx
// ✅ Good
<Image src={PRODUCTS.BREADS.CLASSIC_SOURDOUGH} alt="Classic sourdough loaf, sliced to show open crumb structure" />

// ❌ Bad
<Image src={PRODUCTS.BREADS.CLASSIC_SOURDOUGH} alt="bread" />
```

### 5. Use Placeholder for Large Images

```tsx
<Image
  src={HERO.HOMEPAGE}
  alt="Bakery interior"
  width={1920}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..." // generate this
/>
```

### 6. Handle Missing Images Gracefully

```tsx
const imageSrc = getProductImage(category, productName)

<Image
  src={imageSrc || '/images/placeholder.png'}
  alt={productName}
  onError={(e) => {
    e.currentTarget.src = '/images/placeholder.png'
  }}
/>
```

---

## Image Optimization TODO

1. Convert all PNG images to WebP format
2. Generate responsive image sizes (320w, 640w, 1024w, 1920w)
3. Create blur data URLs for placeholders
4. Set up automated optimization pipeline
5. Configure Next.js image optimization in `next.config.js`

---

## Adding New Images

When adding new product or category images:

1. Save image to appropriate folder in `public/images/`
2. Update `src/data/image-mapping.ts` with new constant
3. Add entry to `IMAGE_ORGANIZATION_SUMMARY.md`
4. Update this usage guide with new examples if needed

Example:

```typescript
// In src/data/image-mapping.ts
export const PRODUCTS = {
  BREADS: {
    // ... existing
    MULTIGRAIN: '/images/products/breads/multigrain-sourdough.png', // NEW
  },
  // ...
}
```
