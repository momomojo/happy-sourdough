import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gradient-to-br from-muted/80 via-muted to-muted/90 text-muted-foreground border-t border-border/40 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5 group">
                            <span className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:rotate-6">HS</span>
                            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Happy Sourdough</span>
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground/90">
                            Artisan sourdough breads and pastries, handcrafted with wild yeast and love.
                        </p>
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

                    {/* Social */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Connect</h4>
                        <div className="flex space-x-3">
                            <a href="#" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 inline-block p-2 rounded-full hover:bg-accent/50" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </a>
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
                    <p className="text-muted-foreground/80">© {new Date().getFullYear()} Happy Sourdough. Baked with love, every single day.</p>
                </div>
            </div>
        </footer>
    );
}
