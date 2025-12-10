/**
 * Image Mapping for Happy Sourdough Bakery
 *
 * Centralized constants for all image paths in the application.
 * All paths are relative to the public directory.
 *
 * Usage:
 * import { LOGO, PRODUCTS, HERO } from '@/data/image-mapping'
 * <Image src={LOGO.PRIMARY} alt="Happy Sourdough" />
 */

// ==================== LOGOS ====================
export const LOGO = {
  PRIMARY: '/images/logo/primary-logo.png',
  ICON: '/images/logo/icon-favicon.png',
} as const;

// ==================== HERO IMAGES ====================
export const HERO = {
  HOMEPAGE: '/images/hero/homepage-hero.png',
  ABOUT: '/images/hero/about-section.png',
} as const;

// ==================== PRODUCT IMAGES ====================
export const PRODUCTS = {
  BREADS: {
    CLASSIC_SOURDOUGH: '/images/products/breads/classic-sourdough-loaf.png',
    OLIVE_ROSEMARY: '/images/products/breads/olive-rosemary-sourdough.png',
    WHOLE_WHEAT: '/images/products/breads/whole-wheat-sourdough.png',
    CINNAMON_RAISIN: '/images/products/breads/cinnamon-raisin-sourdough.png',
  },
  PASTRIES: {
    SOURDOUGH_CROISSANT: '/images/products/pastries/sourdough-croissant.png',
    ALMOND_CROISSANT: '/images/products/pastries/almond-croissant.png',
    PAIN_AU_CHOCOLAT: '/images/products/pastries/pain-au-chocolat.png',
    CINNAMON_ROLL: '/images/products/pastries/cinnamon-roll.png',
  },
  CAKES: {
    BIRTHDAY_CAKE: '/images/products/cakes/sourdough-birthday-cake.png',
    CHOCOLATE_CAKE: '/images/products/cakes/chocolate-sourdough-cake.png',
  },
  COOKIES: {
    CHOCOLATE_CHIP: '/images/products/cookies/sourdough-chocolate-chip-cookies.png',
    SNICKERDOODLE: '/images/products/cookies/sourdough-snickerdoodle-cookies.png',
  },
} as const;

// ==================== CATEGORY HEADERS ====================
export const CATEGORIES = {
  BREADS: '/images/categories/breads-header.png',
  PASTRIES: '/images/categories/pastries-header.png',
  CAKES: '/images/categories/cakes-header.png',
  COOKIES: '/images/categories/cookies-header.png',
} as const;

// ==================== LIFESTYLE/SCENE IMAGES ====================
export const LIFESTYLE = {
  DELIVERY: {
    SCENE_1: '/images/lifestyle/delivery-scene-1.png',
    SCENE_2: '/images/lifestyle/delivery-scene-2.png',
  },
  KITCHEN: {
    SCENE_1: '/images/lifestyle/kitchen-scene-1.png',
    SCENE_2: '/images/lifestyle/kitchen-scene-2.png',
  },
  CAFE: {
    SCENE_1: '/images/lifestyle/cafe-scene-1.png',
    SCENE_2: '/images/lifestyle/cafe-scene-2.png',
    SCENE_3: '/images/lifestyle/cafe-scene-3.png',
  },
  PICNIC: '/images/lifestyle/picnic-scene.png',
} as const;

// ==================== UI ELEMENTS ====================
export const UI = {
  EMPTY_CART: {
    VARIANT_1: '/images/ui/empty-cart-1.png',
    VARIANT_2: '/images/ui/empty-cart-2.png',
  },
  ORDER_CONFIRMED: {
    VARIANT_1: '/images/ui/order-confirmed-1.png',
    VARIANT_2: '/images/ui/order-confirmed-2.png',
  },
  BAKING_IN_PROGRESS: {
    VARIANT_1: '/images/ui/baking-in-progress-1.png',
    VARIANT_2: '/images/ui/baking-in-progress-2.png',
  },
} as const;

// ==================== SOCIAL MEDIA IMAGES ====================
export const SOCIAL = {
  INSTAGRAM: {
    POST_1: '/images/social/instagram-post-1.png',
    POST_2: '/images/social/instagram-post-2.png',
    STORY_1: '/images/social/instagram-story-1.png',
    STORY_2: '/images/social/instagram-story-2.png',
  },
  FACEBOOK: {
    COVER: '/images/social/facebook-cover.png',
  },
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get product image by category and product name
 * @param category - Product category (breads, pastries, cakes, cookies)
 * @param productName - Specific product name
 * @returns Image path or undefined if not found
 */
export function getProductImage(
  category: 'BREADS' | 'PASTRIES' | 'CAKES' | 'COOKIES',
  productName: string
): string | undefined {
  const categoryImages = PRODUCTS[category];
  const productKey = productName
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_') as keyof typeof categoryImages;

  return categoryImages[productKey];
}

/**
 * Get category header image
 * @param category - Category name
 * @returns Category header image path
 */
export function getCategoryHeader(
  category: 'BREADS' | 'PASTRIES' | 'CAKES' | 'COOKIES'
): string {
  return CATEGORIES[category];
}

/**
 * Get random UI variant
 * @param uiType - Type of UI element
 * @returns Random variant image path
 */
export function getRandomUIVariant(
  uiType: 'EMPTY_CART' | 'ORDER_CONFIRMED' | 'BAKING_IN_PROGRESS'
): string {
  const variants = Object.values(UI[uiType]);
  return variants[Math.floor(Math.random() * variants.length)];
}

// ==================== TYPE EXPORTS ====================

export type LogoKey = keyof typeof LOGO;
export type HeroKey = keyof typeof HERO;
export type CategoryKey = keyof typeof CATEGORIES;
export type ProductCategory = keyof typeof PRODUCTS;
export type BreadProduct = keyof typeof PRODUCTS.BREADS;
export type PastryProduct = keyof typeof PRODUCTS.PASTRIES;
