import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { getSocialLinks, getBusinessInfo } from '@/lib/business-settings';

// Helper function to safely convert address to string
function formatAddress(address: unknown): string {
    if (typeof address === 'string') {
        return address;
    }
    if (typeof address === 'object' && address !== null) {
        const addr = address as { street?: string; city?: string; state?: string; zip?: string };
        const parts = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Address unavailable';
    }
    return 'Address unavailable';
}

// Custom icons for TikTok and Yelp (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

function YelpIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.986-4.403c.272-.4.788-.504 1.19-.238l2.576 1.706c.503.334.59 1.06.175 1.513l-.756.62zm-4.15 3.33l4.995 1.433c.96.276 1.176 1.63.213 2.03l-2.576 1.706c-.402.266-.918.162-1.19-.238l-2.986-4.403c-.564-.83.217-1.906 1.176-1.63l.37.102zM11.49 8.27V2.36c0-.55.447-1 1-1h2.58c.55 0 1 .45 1 1v5.908c0 .44-.28.82-.69.95l-.02.006-4.16 1.12c-.55.148-1.07-.247-1.07-.814l.36-1.26zm-5.5 4.87l2.98-4.4c.563-.83 1.74-.8 2.176.076l.36 1.26c.148.55-.247 1.07-.814 1.07l-4.17-1.12c-.96-.258-1.434-1.517-.68-2.12l.148-.1z" />
        </svg>
    );
}

export async function Footer() {
    const [socialLinks, businessInfo] = await Promise.all([
        getSocialLinks(),
        getBusinessInfo(),
    ]);

    // Check if any social links are configured
    const hasSocialLinks = socialLinks.instagram || socialLinks.facebook ||
        socialLinks.twitter || socialLinks.tiktok || socialLinks.yelp;

    return (
        <footer className="bg-gradient-to-br from-muted/80 via-muted to-muted/90 text-muted-foreground border-t border-border/40 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand - Uses business name from settings */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5 group">
                            <span className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:rotate-6">
                                {businessInfo.business_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </span>
                            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                {businessInfo.business_name}
                            </span>
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground/90">
                            Artisan sourdough breads and pastries, handcrafted with wild yeast and love.
                        </p>
                        {/* Contact Info from settings */}
                        <div className="text-sm space-y-1">
                            <p>{formatAddress(businessInfo.business_address)}</p>
                            <p><a href={`tel:${businessInfo.business_phone}`} className="hover:text-primary transition-colors">{businessInfo.business_phone}</a></p>
                            <p><a href={`mailto:${businessInfo.business_email}`} className="hover:text-primary transition-colors">{businessInfo.business_email}</a></p>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Shop</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/products?category=bread" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">Breads</Link></li>
                            <li><Link href="/products?category=pastry" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">Pastries</Link></li>
                            <li><Link href="/products?category=cake" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">Cakes</Link></li>
                            <li><Link href="/products" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">All Products</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Support</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/about" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">About Us</Link></li>
                            <li><Link href="/track" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">Track Order</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-all duration-200 hover:translate-x-0.5 inline-block">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social - Uses social_links from settings */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Connect</h4>
                        <div className="flex space-x-3">
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="Instagram">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="Facebook">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.twitter && (
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="Twitter">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.tiktok && (
                                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="TikTok">
                                    <TikTokIcon className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.yelp && (
                                <a href={socialLinks.yelp} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="Yelp">
                                    <YelpIcon className="h-5 w-5" />
                                </a>
                            )}
                            {/* Fallback if no social links configured */}
                            {!hasSocialLinks && (
                                <>
                                    <span className="p-2 rounded-full text-muted-foreground/50" aria-label="Instagram (not configured)">
                                        <Instagram className="h-5 w-5" />
                                    </span>
                                    <span className="p-2 rounded-full text-muted-foreground/50" aria-label="Facebook (not configured)">
                                        <Facebook className="h-5 w-5" />
                                    </span>
                                    <span className="p-2 rounded-full text-muted-foreground/50" aria-label="Twitter (not configured)">
                                        <Twitter className="h-5 w-5" />
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="mt-6">
                            <p className="text-sm font-medium text-foreground mb-2">Stay in the loop</p>
                            <form className="mt-2 flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 shadow-sm focus:shadow-md"
                                />
                                <button className="rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 py-2 text-xs font-bold text-primary-foreground hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shadow-sm">
                                    Join
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/30 text-center text-sm">
                    <p className="text-muted-foreground/80" suppressHydrationWarning>
                        © {new Date().getFullYear()} {businessInfo.business_name}. Baked with love, every single day.
                    </p>
                </div>
            </div>
        </footer>
    );
}
