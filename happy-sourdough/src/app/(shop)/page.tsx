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
            {/* Hero Section - Artisanal & Warm */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Layered Background with Depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-accent/20 -z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.15] mix-blend-multiply -z-10" />

                {/* Warm gradient overlays for depth */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }} />
                </div>

                <div className="container px-4 py-16 z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Badge */}
                        <div className="animate-fade-in">
                            <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-accent/15 border border-accent/30 text-primary font-medium text-sm tracking-wide backdrop-blur-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Est. 2024 • Artisan Bakery
                            </span>
                        </div>

                        {/* Headline with Improved Typography */}
                        <h1 className="animate-slide-up stagger-1 font-heading">
                            <span className="block text-foreground mb-3">Wild Yeast.</span>
                            <span className="block text-foreground mb-3">Time-Honored Craft.</span>
                            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-accent text-5xl md:text-7xl italic font-light">
                                Slow Fermentation.
                            </span>
                        </h1>

                        {/* Description with Better Spacing */}
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up stagger-2">
                            We bake with purpose. Each loaf takes 48 hours to ferment, using only organic flour, water, salt, and our
                            <span className="text-foreground font-medium"> century-old sourdough starter</span>.
                        </p>

                        {/* CTA Buttons with Enhanced Style */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up stagger-3">
                            <Button asChild size="lg" className="h-14 px-10 text-base font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-primary hover:bg-primary/90">
                                <Link href="/products">
                                    Explore Our Breads
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-base font-medium rounded-xl border-2 border-border hover:bg-accent/10 hover:border-accent transition-all duration-300">
                                <Link href="/about">
                                    Our Story
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid - Enhanced Visual Design */}
            <section className="py-20 md:py-28 relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background -z-10" />

                <div className="container px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Feature 1 */}
                        <div className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute -top-6 left-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center text-primary shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <h3 className="text-2xl font-heading font-semibold text-foreground">48-Hour Fermentation</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our dough rests for two full days to develop complex flavors and improve digestibility using natural wild yeast.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute -top-6 left-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center text-primary shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <h3 className="text-2xl font-heading font-semibold text-foreground">Organic Local Grains</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We source our heritage grains from local mills, ensuring the highest nutrient content and supporting local farmers.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute -top-6 left-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent via-accent to-secondary rounded-2xl flex items-center justify-center text-primary shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <h3 className="text-2xl font-heading font-semibold text-foreground">Fresh Daily</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Baked every morning before the sun comes up. From our ovens straight to your table or doorstep.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 md:py-28 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background -z-10" />

                <div className="container px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-accent tracking-wider uppercase">Baked Fresh Daily</p>
                            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">Customer Favorites</h2>
                            <p className="text-muted-foreground text-lg">Our most popular daily bakes, crafted with care.</p>
                        </div>
                        <Link href="/products" className="hidden md:flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all group">
                            View all products
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map((product, index) => (
                                <div key={product.id} className={`animate-scale-in stagger-${Math.min(index + 1, 4)}`}>
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/50 border border-border">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-muted-foreground font-medium">Starting the ovens... products coming soon!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center md:hidden">
                        <Button asChild variant="outline" size="lg" className="w-full max-w-sm rounded-xl border-2">
                            <Link href="/products">View All Products</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Testimonials - Warm & Premium Feel */}
            <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

                <div className="container px-4 relative z-10">
                    <div className="text-center mb-16 space-y-3">
                        <p className="text-sm font-medium text-accent tracking-wider uppercase">Testimonials</p>
                        <h2 className="text-3xl md:text-4xl font-heading font-semibold text-primary-foreground">Community Love</h2>
                        <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                            What our neighbors are saying about their favorite loaves
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Testimonial 1 */}
                        <div className="group bg-primary-foreground/10 backdrop-blur-md p-8 rounded-3xl border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300">
                            <div className="flex gap-1 mb-5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-5 w-5 fill-accent text-accent" />
                                ))}
                            </div>
                            <blockquote className="text-lg text-primary-foreground/90 leading-relaxed mb-6 font-accent italic">
                                "The best sourdough I've had outside of San Francisco. The crust is perfect, and the crumb is beautifully open."
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                                    S
                                </div>
                                <div>
                                    <div className="font-semibold text-primary-foreground">Sarah M.</div>
                                    <div className="text-sm text-primary-foreground/60">Regular Customer</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="group bg-primary-foreground/10 backdrop-blur-md p-8 rounded-3xl border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300">
                            <div className="flex gap-1 mb-5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-5 w-5 fill-accent text-accent" />
                                ))}
                            </div>
                            <blockquote className="text-lg text-primary-foreground/90 leading-relaxed mb-6 font-accent italic">
                                "My weekly staple. The olive rosemary loaf is absolutely addictive. Can't start my weekend without it."
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                                    D
                                </div>
                                <div>
                                    <div className="font-semibold text-primary-foreground">David K.</div>
                                    <div className="text-sm text-primary-foreground/60">Local Chef</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="group bg-primary-foreground/10 backdrop-blur-md p-8 rounded-3xl border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300">
                            <div className="flex gap-1 mb-5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-5 w-5 fill-accent text-accent" />
                                ))}
                            </div>
                            <blockquote className="text-lg text-primary-foreground/90 leading-relaxed mb-6 font-accent italic">
                                "Love the delivery service. Fresh warm bread on Sunday morning is a game changer for our family brunch."
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                                    E
                                </div>
                                <div>
                                    <div className="font-semibold text-primary-foreground">Emily R.</div>
                                    <div className="text-sm text-primary-foreground/60">Food Blogger</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
