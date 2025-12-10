-- Update product images to use the new organized image paths
-- Images are stored in public/images/products/{category}/{product-name}.png

-- Breads
UPDATE products SET image_url = '/images/products/breads/classic-sourdough-loaf.png'
WHERE slug = 'classic-sourdough-loaf';

UPDATE products SET image_url = '/images/products/breads/whole-wheat-sourdough.png'
WHERE slug = 'whole-wheat-sourdough';

UPDATE products SET image_url = '/images/products/breads/olive-rosemary-sourdough.png'
WHERE slug = 'olive-rosemary-sourdough';

UPDATE products SET image_url = '/images/products/breads/cinnamon-raisin-sourdough.png'
WHERE slug = 'cinnamon-raisin-sourdough';

-- jalapeno-cheddar image not available yet, using category header as placeholder
UPDATE products SET image_url = '/images/categories/breads-header.png'
WHERE slug = 'jalapeno-cheddar-sourdough';

-- Pastries
UPDATE products SET image_url = '/images/products/pastries/sourdough-croissant.png'
WHERE slug = 'sourdough-croissant';

UPDATE products SET image_url = '/images/products/pastries/pain-au-chocolat.png'
WHERE slug = 'pain-au-chocolat';

UPDATE products SET image_url = '/images/products/pastries/almond-croissant.png'
WHERE slug = 'almond-croissant';

UPDATE products SET image_url = '/images/products/pastries/cinnamon-roll.png'
WHERE slug = 'sourdough-cinnamon-roll';

-- Cakes (placeholder images until we get real ones)
UPDATE products SET image_url = '/images/categories/cakes-header.png'
WHERE slug = 'sourdough-birthday-cake';

UPDATE products SET image_url = '/images/categories/cakes-header.png'
WHERE slug = 'chocolate-sourdough-cake';

-- Cookies (placeholder images until we get real ones)
UPDATE products SET image_url = '/images/categories/cookies-header.png'
WHERE slug = 'sourdough-chocolate-chip';

UPDATE products SET image_url = '/images/categories/cookies-header.png'
WHERE slug = 'sourdough-snickerdoodle';
