'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface NativeWear {
    id: number;
    name: string;
    category: string;
    image: string;
    price: string;
    description: string;
}

const categories = ["All", "Agbada", "Senator", "Kaftan", "2-Piece"];

const items: NativeWear[] = [
    {
        id: 1,
        name: "Classic Agbada",
        category: "Agbada",
        image: "/images/native1.jpg",
        price: "₦45,000",
        description: "Traditional Agbada with premium fabric and intricate embroidery"
    },
    {
        id: 2,
        name: "Modern Senator",
        category: "Senator",
        image: "/images/native2.jpg",
        price: "₦35,000",
        description: "Contemporary Senator suit with modern tailoring"
    },
    {
        id: 3,
        name: "Designer Kaftan",
        category: "Kaftan",
        image: "/images/native3.jpg",
        price: "₦32,000",
        description: "Elegant Kaftan with premium finish and modern patterns"
    },
    {
        id: 4,
        name: "Premium 2-Piece",
        category: "2-Piece",
        image: "/images/native4.jpg",
        price: "₦28,000",
        description: "Stylish 2-piece set with matching accessories"
    },
    {
        id: 5,
        name: "Royal Agbada",
        category: "Agbada",
        image: "/images/native5.jpg",
        price: "₦55,000",
        description: "Luxurious Agbada with royal embroidery and premium fabric"
    },
    {
        id: 6,
        name: "Executive Senator",
        category: "Senator",
        image: "/images/native6.jpg",
        price: "₦42,000",
        description: "Professional Senator suit perfect for formal occasions"
    }
];

export default function NativeWearPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredItems = selectedCategory === "All"
        ? items
        : items.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full overflow-hidden">
                <Image
                    src="/images/native-hero.jpg"
                    alt="Native Wear Collection"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="text-center text-white">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-3 sm:mb-4">Native Wear</h1>
                        <p className="text-sm sm:text-base md:text-xl font-light max-w-2xl mx-auto tracking-wide">
                            Discover our curated collection of contemporary African fashion
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-16">
                {/* Categories - Mobile Scrollable */}
                <div className="relative mb-6 sm:mb-8 md:mb-16">
                    <div className="flex overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex space-x-4 sm:space-x-8">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`text-xs sm:text-sm tracking-[0.2em] uppercase transition-colors whitespace-nowrap px-2 py-1 ${selectedCategory === category
                                        ? 'text-black border-b-2 border-black'
                                        : 'text-gray-400 hover:text-black/60'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-12">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="group">
                            <div className="relative aspect-[3/4] overflow-hidden mb-3 sm:mb-4">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>
                            <div className="space-y-1 sm:space-y-2 px-1 sm:px-2 md:px-0">
                                <h3 className="text-base sm:text-lg md:text-xl font-light tracking-wide">{item.name}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 tracking-wide">{item.description}</p>
                                <p className="text-xs sm:text-sm tracking-wider">{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom Design Section */}
                <div className="mt-12 sm:mt-16 md:mt-32 text-center px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4 sm:mb-6 md:mb-8">Custom Design Service</h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 tracking-wide">
                        Looking for something unique? Our expert tailors can create a custom piece just for you.
                    </p>
                    <Link
                        href="/book-fitting"
                        className="inline-block bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200"
                    >
                        Book a Fitting
                    </Link>
                </div>

                {/* FAQ Section */}
                <div className="mt-12 sm:mt-16 md:mt-32 max-w-3xl mx-auto px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-6 sm:mb-8 md:mb-16 tracking-tight">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
                        <AccordionItem value="sizing" className="border-b border-gray-200 pb-3 sm:pb-4">
                            <AccordionTrigger className="flex w-full justify-between text-left text-sm sm:text-base md:text-lg hover:text-gray-600 transition-colors">
                                How do I choose the right size?
                            </AccordionTrigger>
                            <AccordionContent className="pt-3 sm:pt-4 text-gray-600 text-xs sm:text-sm md:text-base">
                                We recommend booking a fitting session with our expert tailors who will take your measurements and help you choose the perfect size. You can also refer to our detailed size guide available on each product page.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="returns" className="border-b border-gray-200 pb-3 sm:pb-4">
                            <AccordionTrigger className="flex w-full justify-between text-left text-sm sm:text-base md:text-lg hover:text-gray-600 transition-colors">
                                What is your return policy?
                            </AccordionTrigger>
                            <AccordionContent className="pt-3 sm:pt-4 text-gray-600 text-xs sm:text-sm md:text-base">
                                We accept returns within 7 days of delivery. Items must be unworn and in their original condition with all tags attached. Custom-made pieces are not eligible for returns.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="customization" className="border-b border-gray-200 pb-3 sm:pb-4">
                            <AccordionTrigger className="flex w-full justify-between text-left text-sm sm:text-base md:text-lg hover:text-gray-600 transition-colors">
                                How long does custom tailoring take?
                            </AccordionTrigger>
                            <AccordionContent className="pt-3 sm:pt-4 text-gray-600 text-xs sm:text-sm md:text-base">
                                Custom pieces typically take 2-3 weeks to complete, depending on the complexity of the design. We'll provide you with a specific timeline during your fitting session.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="fabric" className="border-b border-gray-200 pb-3 sm:pb-4">
                            <AccordionTrigger className="flex w-full justify-between text-left text-sm sm:text-base md:text-lg hover:text-gray-600 transition-colors">
                                What types of fabric do you use?
                            </AccordionTrigger>
                            <AccordionContent className="pt-3 sm:pt-4 text-gray-600 text-xs sm:text-sm md:text-base">
                                We use premium quality fabrics sourced from trusted suppliers. Our collection includes traditional materials like Aso-oke, Guinea brocade, and high-quality cotton blends. We can also work with customer-provided fabrics for custom orders.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Contact Section */}
                <div className="mt-12 sm:mt-16 md:mt-32 text-center px-2 sm:px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-4 sm:mb-6 md:mb-8 tracking-tight">Still Have Questions?</h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 tracking-wide">
                        Contact our style consultants for personalized assistance with your native wear selection.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>

            {/* Add custom styles for hiding scrollbar */}
            <style jsx global>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
} 