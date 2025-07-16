'use client';

import Link from 'next/link';
import { ChevronRight, Heart, Users, Award, Truck, Shield, Star, Phone, Mail } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">Our Story</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-12">
                <div className="space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Our Story</h1>
                        <p className="text-lg text-[#3B2305] max-w-3xl mx-auto">
                            WiseStyle is more than just a fashion brand. We're a celebration of African style,
                            quality craftsmanship, and the confidence that comes from looking and feeling your best.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <section className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-[#F9F5F0] p-8 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <Heart className="w-8 h-8 text-[#C97203]" />
                                    <h2 className="text-2xl font-bold text-[#1E1E1E]">Our Mission</h2>
                                </div>
                                <p className="text-[#3B2305] leading-relaxed">
                                    To provide high-quality, stylish clothing that celebrates African heritage while
                                    embracing modern fashion trends. We believe everyone deserves to look and feel
                                    confident in what they wear, regardless of their background or budget.
                                </p>
                            </div>

                            <div className="bg-[#F0F9FF] border border-[#E0F2FE] p-8 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <Star className="w-8 h-8 text-[#C97203]" />
                                    <h2 className="text-2xl font-bold text-[#1E1E1E]">Our Vision</h2>
                                </div>
                                <p className="text-[#3B2305] leading-relaxed">
                                    To become the leading fashion destination for African-inspired clothing,
                                    known for quality, style, and exceptional customer service. We envision a world
                                    where African fashion is celebrated globally and accessible to everyone.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Our Story */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] text-center">How It All Began</h2>

                        <div className="bg-white border border-[#E5E1D8] rounded-lg p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">The Beginning</h3>
                                    <p className="text-[#3B2305] leading-relaxed mb-4">
                                        WiseStyle was founded in 2020 with a simple yet powerful idea: to create
                                        clothing that reflects the rich cultural heritage of Africa while meeting
                                        the demands of modern fashion. What started as a small local shop has grown
                                        into a beloved brand serving customers across Nigeria.
                                    </p>
                                    <p className="text-[#3B2305] leading-relaxed">
                                        Our founder, inspired by the vibrant colors, patterns, and styles of African
                                        fashion, wanted to create a brand that would make these beautiful designs
                                        accessible to everyone while maintaining the highest standards of quality.
                                    </p>
                                </div>
                                <div className="bg-[#F9F5F0] p-6 rounded-lg text-center">
                                    <div className="text-4xl font-bold text-[#C97203] mb-2">2020</div>
                                    <p className="text-[#3B2305]">The year WiseStyle was founded</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Our Values */}
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] text-center">Our Values</h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 text-center space-y-4">
                                <div className="bg-[#C97203] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Quality</h3>
                                <p className="text-sm text-[#3B2305]">
                                    We never compromise on quality. Every piece in our collection is carefully
                                    selected and crafted to meet the highest standards.
                                </p>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 text-center space-y-4">
                                <div className="bg-[#C97203] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Authenticity</h3>
                                <p className="text-sm text-[#3B2305]">
                                    We celebrate and preserve African cultural heritage through authentic designs
                                    that tell stories and connect people to their roots.
                                </p>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 text-center space-y-4">
                                <div className="bg-[#C97203] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Community</h3>
                                <p className="text-sm text-[#3B2305]">
                                    We believe in building strong relationships with our customers, suppliers,
                                    and the communities we serve.
                                </p>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 text-center space-y-4">
                                <div className="bg-[#C97203] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Sustainability</h3>
                                <p className="text-sm text-[#3B2305]">
                                    We're committed to sustainable practices and reducing our environmental impact
                                    while maintaining quality and style.
                                </p>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 text-center space-y-4">
                                <div className="bg-[#C97203] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Truck className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Service</h3>
                                <p className="text-sm text-[#3B2305]">
                                    Exceptional customer service is at the heart of everything we do. We're here
                                    to help you look and feel your best.
                                </p>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 text-center space-y-4">
                                <div className="bg-[#C97203] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Star className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Innovation</h3>
                                <p className="text-sm text-[#3B2305]">
                                    We continuously innovate and evolve, embracing new trends while staying true
                                    to our cultural roots and values.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* What Sets Us Apart */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] text-center">What Sets Us Apart</h2>

                        <div className="bg-[#F9F5F0] p-8 rounded-lg space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">Cultural Heritage</h3>
                                    <p className="text-[#3B2305] leading-relaxed mb-4">
                                        Our designs are inspired by the rich cultural heritage of Africa,
                                        incorporating traditional patterns, colors, and styles into modern,
                                        wearable fashion pieces.
                                    </p>
                                    <p className="text-[#3B2305] leading-relaxed">
                                        We work with local artisans and designers to create authentic pieces
                                        that celebrate African culture while appealing to contemporary tastes.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">Quality Assurance</h3>
                                    <p className="text-[#3B2305] leading-relaxed mb-4">
                                        Every item in our collection undergoes rigorous quality control to ensure
                                        it meets our high standards for durability, comfort, and style.
                                    </p>
                                    <p className="text-[#3B2305] leading-relaxed">
                                        We use premium fabrics and work with skilled craftsmen to create pieces
                                        that last and look great wear after wear.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Our Commitment */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] text-center">Our Commitment to You</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-[#F0F9FF] border border-[#E0F2FE] p-6 rounded-lg text-center">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">Quality Products</h3>
                                <p className="text-sm text-[#3B2305]">
                                    We promise to deliver only the highest quality clothing that meets your
                                    expectations and exceeds them.
                                </p>
                            </div>

                            <div className="bg-[#FFF7F0] border border-[#F4EFE8] p-6 rounded-lg text-center">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">Exceptional Service</h3>
                                <p className="text-sm text-[#3B2305]">
                                    Our customer service team is dedicated to providing you with the best
                                    shopping experience possible.
                                </p>
                            </div>

                            <div className="bg-[#F9F5F0] p-6 rounded-lg text-center">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">Fair Pricing</h3>
                                <p className="text-sm text-[#3B2305]">
                                    We believe quality fashion should be accessible to everyone, which is why
                                    we offer competitive pricing without compromising on quality.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Join Our Community */}
                    <section className="space-y-6">
                        <div className="bg-[#1E1E1E] text-white rounded-lg p-8 text-center space-y-6">
                            <h2 className="text-2xl font-bold">Join Our Community</h2>
                            <p className="text-lg opacity-90 max-w-2xl mx-auto">
                                Be part of the WiseStyle family! Follow us on social media for the latest updates,
                                styling tips, and exclusive offers.
                            </p>
                            <div className="flex justify-center space-x-6">
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#C97203] text-white p-3 rounded-full hover:bg-[#A85D02] transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#C97203] text-white p-3 rounded-full hover:bg-[#A85D02] transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://tiktok.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#C97203] text-white p-3 rounded-full hover:bg-[#A85D02] transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] text-center">Get in Touch</h2>

                        <div className="bg-[#F9F5F0] p-8 rounded-lg text-center space-y-4">
                            <p className="text-lg text-[#3B2305]">
                                Have questions about our story or want to learn more about WiseStyle?
                            </p>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                <a
                                    href="tel:+2348148331000"
                                    className="flex items-center gap-2 bg-[#C97203] text-white px-6 py-3 rounded-lg hover:bg-[#A85D02] transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call us: +234 814 833 1000
                                </a>
                                <a
                                    href="mailto:hello@wisestyleshop.com"
                                    className="flex items-center gap-2 border border-[#C97203] text-[#C97203] px-6 py-3 rounded-lg hover:bg-[#C97203] hover:text-white transition-colors"
                                >
                                    <Mail className="w-5 h-5" />
                                    Email: hello@wisestyleshop.com
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
} 