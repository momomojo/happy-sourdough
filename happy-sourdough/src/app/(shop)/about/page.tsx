import Link from 'next/link';
import { Clock, Heart, Users, Wheat, Leaf, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section - Bakery Story */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-stone-900 dark:to-stone-800 -z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay -z-10" />

                <div className="container px-4 text-center z-10 animate-fade-in">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 tracking-wide uppercase">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 drop-shadow-sm">
                        Crafted with Care, <br className="hidden md:block" />
                        <span className="text-primary">Baked with Love</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        At Happy Sourdough, we believe that great bread starts with time, patience, and the finest ingredients.
                        Our journey began with a simple sourdough starter and a passion for bringing authentic artisan bread
                        to our community.
                    </p>
                </div>
            </section>

            {/* Our Philosophy */}
            <section className="py-24 bg-background">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Philosophy</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Three core principles guide everything we bake
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center space-y-4 p-8 rounded-2xl hover:bg-accent/20 transition-colors">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Clock className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold">Slow Fermentation</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We never rush the process. Our sourdough undergoes a minimum 48-hour fermentation,
                                allowing natural wild yeast to work its magic. This creates complex flavors, better
                                digestibility, and bread that tastes like it should.
                            </p>
                        </div>

                        <div className="text-center space-y-4 p-8 rounded-2xl hover:bg-accent/20 transition-colors">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Wheat className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold">Organic Ingredients</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Every loaf starts with certified organic flour, filtered water, and sea salt. No additives,
                                no preservatives, no shortcuts. Just pure, wholesome ingredients that you can pronounce
                                and your body can recognize.
                            </p>
                        </div>

                        <div className="text-center space-y-4 p-8 rounded-2xl hover:bg-accent/20 transition-colors">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Leaf className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold">Local Sourcing</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We partner with regional mills and local farmers to source heritage grains and seasonal
                                ingredients. Supporting our community means fresher products for you and a sustainable
                                future for everyone.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet the Baker */}
            <section className="py-24 bg-muted/30">
                <div className="container px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-primary" />
                                <h2 className="text-3xl md:text-4xl font-bold">Meet the Baker</h2>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Happy Sourdough was founded by a passionate baker who discovered the art of sourdough
                                through years of dedication and countless loaves. What started as a weekend hobby in
                                a home kitchen has grown into a beloved local bakery.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Our head baker believes that bread is more than just food—it's a connection to tradition,
                                a labor of love, and a daily ritual that brings people together. Every morning before dawn,
                                our team arrives to shape dough that's been fermenting overnight, ensuring that each loaf
                                receives the attention it deserves.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We're proud to serve our community with bread that nourishes both body and soul.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Process */}
            <section className="py-24 bg-primary text-primary-foreground">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Baking Process</h2>
                        <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                            From starter to table, every step matters
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-primary-foreground/5 p-8 rounded-2xl backdrop-blur-sm space-y-4">
                            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-xl">
                                1
                            </div>
                            <h3 className="text-2xl font-bold">48-Hour Fermentation</h3>
                            <p className="text-primary-foreground/90 leading-relaxed">
                                Our dough begins its journey with a multi-day cold fermentation process. Natural wild
                                yeast and beneficial bacteria slowly break down the flour, developing deep flavors and
                                making the bread easier to digest.
                            </p>
                        </div>

                        <div className="bg-primary-foreground/5 p-8 rounded-2xl backdrop-blur-sm space-y-4">
                            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-xl">
                                2
                            </div>
                            <h3 className="text-2xl font-bold">Hand-Shaping</h3>
                            <p className="text-primary-foreground/90 leading-relaxed">
                                Each loaf is carefully shaped by hand, never by machine. This traditional technique
                                creates the perfect structure and texture, ensuring that beautiful open crumb and
                                crispy crust you love.
                            </p>
                        </div>

                        <div className="bg-primary-foreground/5 p-8 rounded-2xl backdrop-blur-sm space-y-4">
                            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-xl">
                                3
                            </div>
                            <h3 className="text-2xl font-bold">Stone Deck Ovens</h3>
                            <p className="text-primary-foreground/90 leading-relaxed">
                                We bake in professional stone deck ovens with steam injection, mimicking traditional
                                European hearth baking. The intense heat creates that signature golden crust while
                                keeping the interior moist and tender.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Local Commitment */}
            <section className="py-24 bg-background">
                <div className="container px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Heart className="w-8 h-8 text-primary" />
                                <h2 className="text-3xl md:text-4xl font-bold">Our Local Commitment</h2>
                            </div>
                            <p className="text-muted-foreground text-lg">
                                Building a better community, one loaf at a time
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-6 p-6 rounded-xl hover:bg-accent/10 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                                    <Wheat className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Supporting Local Farms</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        We source our flour from regional mills that work directly with local grain farmers.
                                        This ensures peak freshness and supports agricultural families in our area. When you
                                        buy our bread, you're supporting an entire network of local producers.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 p-6 rounded-xl hover:bg-accent/10 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                                    <Leaf className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Sustainable Practices</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        From composting our organic waste to using renewable energy in our kitchen, we're
                                        committed to minimizing our environmental impact. Our packaging is recyclable or
                                        compostable, and we encourage customers to bring reusable bags.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 p-6 rounded-xl hover:bg-accent/10 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Community Partnerships</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        At the end of each day, we donate unsold bread to local food banks and shelters.
                                        We also partner with schools and community organizations to teach breadmaking
                                        workshops, sharing the joy of baking with the next generation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visit Us */}
            <section className="py-24 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-stone-900 dark:to-stone-800">
                <div className="container px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Visit Us</h2>
                            <p className="text-muted-foreground text-lg">
                                Stop by to say hello and smell the fresh bread
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Location */}
                            <div className="bg-background p-8 rounded-2xl shadow-lg space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <MapPin className="w-6 h-6" />
                                    <h3 className="text-xl font-bold">Location</h3>
                                </div>
                                <div className="space-y-2 text-muted-foreground">
                                    <p className="font-medium text-foreground">Happy Sourdough Bakery</p>
                                    <p>123 Main Street</p>
                                    <p>Your Town, ST 12345</p>
                                </div>
                                <Button asChild variant="outline" className="w-full mt-4">
                                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                                        Get Directions
                                    </a>
                                </Button>
                            </div>

                            {/* Hours */}
                            <div className="bg-background p-8 rounded-2xl shadow-lg space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Clock className="w-6 h-6" />
                                    <h3 className="text-xl font-bold">Hours of Operation</h3>
                                </div>
                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Tuesday - Friday</span>
                                        <span className="font-medium">7:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span className="font-medium">8:00 AM - 5:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="font-medium">8:00 AM - 3:00 PM</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 mt-2">
                                        <span className="font-medium">Monday</span>
                                        <span className="font-medium text-destructive">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-8 bg-background p-8 rounded-2xl shadow-lg">
                            <h3 className="text-xl font-bold mb-6 text-center">Get In Touch</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <a href="tel:+15551234567" className="font-medium hover:text-primary transition-colors">
                                            (555) 123-4567
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <a href="mailto:hello@happysourdough.com" className="font-medium hover:text-primary transition-colors">
                                            hello@happysourdough.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-12 text-center">
                            <p className="text-muted-foreground mb-6">
                                Ready to taste the difference?
                            </p>
                            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                                <Link href="/products">
                                    Shop Our Breads
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
