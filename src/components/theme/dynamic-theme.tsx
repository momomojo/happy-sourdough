import { getBranding } from '@/lib/business-settings';

/**
 * Converts a hex color to HSL format for CSS variables
 */
function hexToHSL(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    // Convert to CSS format (h s% l% without commas for Tailwind v4)
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Server component that injects custom CSS variables based on admin branding settings
 * These override the default theme colors from globals.css
 */
export async function DynamicTheme() {
    const branding = await getBranding();

    // Only inject custom styles if colors are explicitly set (not default)
    const hasCustomPrimary = branding.primary_color && branding.primary_color !== '#8B4513';
    const hasCustomAccent = branding.accent_color && branding.accent_color !== '#D4A574';

    if (!hasCustomPrimary && !hasCustomAccent) {
        // No custom branding, use default theme
        return null;
    }

    // Build CSS custom properties
    const cssVars: string[] = [];

    if (hasCustomPrimary) {
        const primaryHSL = hexToHSL(branding.primary_color);
        cssVars.push(`--primary: ${primaryHSL};`);
    }

    if (hasCustomAccent) {
        const accentHSL = hexToHSL(branding.accent_color);
        cssVars.push(`--accent: ${accentHSL};`);
    }

    const cssContent = `:root { ${cssVars.join(' ')} }`;

    return (
        <style
            dangerouslySetInnerHTML={{ __html: cssContent }}
        />
    );
}
