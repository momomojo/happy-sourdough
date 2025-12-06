# Shopping Cart Usage Guide

## Overview
The shopping cart system is now fully implemented and ready to use. Below are examples of how to integrate it into your product pages.

## Components Created

### 1. Cart Context (`src/contexts/cart-context.tsx`)
- Manages cart state with React Context
- Persists to localStorage automatically
- Provides `useCart()` hook

### 2. Cart Components (`src/components/cart/`)
- **CartButton** - Header cart icon with animated badge
- **CartSheet** - Slide-out cart panel
- **CartItem** - Individual cart item display
- **index.ts** - Convenience exports

## Usage Examples

### Adding the Cart Button to Header

```tsx
// src/components/layout/header.tsx
'use client';

import { CartButton } from '@/components/cart';

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        <h1>Happy Sourdough</h1>

        <nav className="flex items-center gap-4">
          <a href="/products">Products</a>
          <a href="/about">About</a>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
```

### Adding Products to Cart

```tsx
// Example product card or detail page
'use client';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';

export function ProductCard({ product, variant }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      unitPrice: variant.price,
      imageUrl: product.image_url,
      quantity: 1, // optional, defaults to 1
    });
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{variant.name}</p>
      <p className="price-display">${variant.price.toFixed(2)}</p>

      <Button onClick={handleAddToCart} className="btn-bakery">
        Add to Cart
      </Button>
    </div>
  );
}
```

### Using Cart Context Hook

```tsx
'use client';

import { useCart } from '@/contexts/cart-context';

export function MyComponent() {
  const {
    items,          // Array of cart items
    itemCount,      // Total number of items
    subtotal,       // Total price
    addItem,        // Add/update item
    removeItem,     // Remove item by variantId
    updateQuantity, // Update quantity by variantId
    clearCart       // Clear all items
  } = useCart();

  return (
    <div>
      <p>Items in cart: {itemCount}</p>
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
    </div>
  );
}
```

## Cart Item Interface

```typescript
interface CartItem {
  productId: string;      // Product ID from database
  variantId: string;      // Variant ID (unique identifier)
  productName: string;    // Display name
  variantName: string;    // Variant name (e.g., "Large", "6-pack")
  quantity: number;       // Quantity in cart
  unitPrice: number;      // Price per unit
  imageUrl?: string;      // Optional product image
}
```

## Features

### Automatic Persistence
- Cart is automatically saved to localStorage
- Survives page refreshes
- Loads on app initialization

### Toast Notifications
- Shows success messages when adding/removing items
- Uses the Toaster component from sonner

### Animated Badge
- Badge on cart button animates when items are added
- Shows item count (99+ for 100+)
- Only visible when cart has items

### Responsive Design
- Cart sheet slides in from right
- Mobile-optimized with proper touch targets
- Scrollable item list for many items

### Empty State
- Beautiful empty cart illustration
- Call-to-action to browse products
- Automatically shown when cart is empty

## Theme Integration

Uses Happy Sourdough theme colors:
- Primary buttons use `btn-bakery` class (espresso brown)
- Secondary buttons use `btn-bakery-secondary` (crust orange)
- Accent badge uses honey gold color
- Matches existing design system

## Next Steps

1. **Integrate with Product Pages**: Add "Add to Cart" buttons to product listings
2. **Create Checkout Flow**: Build checkout page that reads from cart context
3. **Add Delivery Zones**: Calculate delivery fees based on zone
4. **Connect to Stripe**: Process payments for cart items
5. **Order Creation**: Save cart items to database as order_items

## Files Modified/Created

Created:
- `/src/contexts/cart-context.tsx` - Cart state management
- `/src/components/cart/cart-button.tsx` - Header cart button
- `/src/components/cart/cart-item.tsx` - Cart item component
- `/src/components/cart/cart-sheet.tsx` - Slide-out cart panel
- `/src/components/cart/index.ts` - Export file

Modified:
- `/src/app/layout.tsx` - Added CartProvider and Toaster
