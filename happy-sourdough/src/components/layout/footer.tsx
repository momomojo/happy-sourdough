import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-muted text-muted-foreground border-t">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">HS</span>
                            Happy Sourdough
                        </h3>
                        <p className="text-sm">
                            Artisan sourdough breads and pastries, handcrafted with wild yeast and love.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products?category=bread" className="hover:text-primary transition-colors">Breads</Link></li>
                            <li><Link href="/products?category=pastry" className="hover:text-primary transition-colors">Pastries</Link></li>
                            <li><Link href="/products?category=cake" className="hover:text-primary transition-colors">Cakes</Link></li>
                            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/track" className="hover:text-primary transition-colors">Track Order</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm">Stay in the loop</p>
                            <form className="mt-2 flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    className="flex-1 rounded-md border bg-background px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                                    Join
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center text-sm">
                    <p>© {new Date().getFullYear()} Happy Sourdough. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
