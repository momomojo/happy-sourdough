import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts } from '@/lib/supabase/products';
import { ProductCard } from '@/components/products/product-card';

export default async function HomePage() {
    const featuredProducts = await getFeaturedProducts(4);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Background - In production use a real image, for now a nice gradient/placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-stone-900 dark:to-stone-800 -z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay -z-10" />

                <div className="container px-4 text-center z-10 animate-fade-in">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 tracking-wide uppercase">
                        Artisan Bakery
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 drop-shadow-sm">
                        Wild Yeast. <br className="hidden md:block" />
                        <span className="text-primary">Slow Fermentation.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Handcrafted sourdough breads and pastries, baked fresh daily in our local kitchen.
                        Use only organic flour, water, and salt.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                            <Link href="/products">
                                Shop Our Breads
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2">
                            <Link href="/about">
                                Our Story
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-background">
                <div className="container px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4 p-6 rounded-2xl hover:bg-accent/20 transition-colors">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold">48-Hour Fermentation</h3>
                            <p className="text-muted-foreground">
                                Our dough rests for two full days to develop complex flavors and improve digestibility using natural wild yeast.
                            </p>
                        </div>
                        <div className="space-y-4 p-6 rounded-2xl hover:bg-accent/20 transition-colors">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold">Organic Local Grains</h3>
                            <p className="text-muted-foreground">
                                We source our heritage grains from local mills, ensuring the highest nutrient content and supporting local farmers.
                            </p>
                        </div>
                        <div className="space-y-4 p-6 rounded-2xl hover:bg-accent/20 transition-colors">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold">Fresh Daily</h3>
                            <p className="text-muted-foreground">
                                Baked every morning before the sun comes up. From our ovens straight to your table or doorstep.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24 bg-muted/30">
                <div className="container px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Customer Favorites</h2>
                            <p className="text-muted-foreground">Our most popular daily bakes.</p>
                        </div>
                        <Link href="/products" className="hidden md:flex items-center text-primary font-medium hover:underline">
                            View all products <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            // Fallback if no products seeded or fetch fails (graceful degradation)
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                <p>Starting the ovens... products coming soon!</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/products">View All Products</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-primary text-primary-foreground">
                <div className="container px-4 text-center">
                    <h2 className="text-3xl font-bold mb-16">Community Love</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-primary-foreground/5 p-8 rounded-2xl backdrop-blur-sm">
                            <div className="flex justify-center mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-5 w-5 fill-accent text-accent" />
                                ))}
                            </div>
                            <p className="text-lg italic mb-6">"The best sourdough I've had outside of San Francisco. The crust is perfect."</p>
                            <div className="font-semibold">- Sarah M.</div>
                        </div>
                        <div className="bg-primary-foreground/5 p-8 rounded-2xl backdrop-blur-sm">
                            <div className="flex justify-center mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-5 w-5 fill-accent text-accent" />
                                ))}
                            </div>
                            <p className="text-lg italic mb-6">"My weekly staple. The olive rosemary loaf is absolutely addictive."</p>
                            <div className="font-semibold">- David K.</div>
                        </div>
                        <div className="bg-primary-foreground/5 p-8 rounded-2xl backdrop-blur-sm">
                            <div className="flex justify-center mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-5 w-5 fill-accent text-accent" />
                                ))}
                            </div>
                            <p className="text-lg italic mb-6">"Love the delivery service. Fresh warm bread on Sunday morning is a game changer."</p>
                            <div className="font-semibold">- Emily R.</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
