'use client';

import Link from 'next/link';
import { ChevronRight, Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">Contact Us</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Contact Us</h1>
                        <p className="text-lg text-[#3B2305]">
                            We're here to help! Get in touch with our customer service team for any questions,
                            concerns, or support you need.
                        </p>
                    </div>

                    {/* Contact Methods Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Phone */}
                        <div className="bg-[#F9F5F0] p-6 rounded-lg text-center space-y-4">
                            <div className="bg-[#C97203] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">Call Us</h3>
                            <p className="text-[#3B2305] text-sm">Speak directly with our team</p>
                            <a
                                href="tel:+2348148331000"
                                className="block text-[#C97203] font-semibold hover:text-[#A85D02] transition-colors"
                            >
                                +234 814 833 1000
                            </a>
                        </div>

                        {/* Email */}
                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] p-6 rounded-lg text-center space-y-4">
                            <div className="bg-[#C97203] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">Email Us</h3>
                            <p className="text-[#3B2305] text-sm">Send us a detailed message</p>
                            <a
                                href="mailto:hello@wisestyleshop.com"
                                className="block text-[#C97203] font-semibold hover:text-[#A85D02] transition-colors"
                            >
                                hello@wisestyleshop.com
                            </a>
                        </div>

                        {/* WhatsApp */}
                        <div className="bg-[#FFF7F0] border border-[#F4EFE8] p-6 rounded-lg text-center space-y-4">
                            <div className="bg-[#25D366] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">WhatsApp</h3>
                            <p className="text-[#3B2305] text-sm">Chat with us on WhatsApp</p>
                            <a
                                href="https://wa.me/2348148331000?text=Hello%20WiseStyle!%20I%20need%20help%20with%20my%20order."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[#25D366] font-semibold hover:text-[#128C7E] transition-colors"
                            >
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Clock className="w-6 h-6 text-[#C97203]" />
                            Business Hours
                        </h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">Customer Service</h3>
                                    <div className="space-y-2 text-sm text-[#3B2305]">
                                        <div className="flex justify-between">
                                            <span>Monday - Friday:</span>
                                            <span className="font-medium">8:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Saturday:</span>
                                            <span className="font-medium">9:00 AM - 4:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sunday:</span>
                                            <span className="font-medium">Closed</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">Online Orders</h3>
                                    <p className="text-sm text-[#3B2305]">
                                        Our website is available 24/7 for browsing and placing orders.
                                        Orders placed outside business hours will be processed the next business day.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Form */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Send className="w-6 h-6 text-[#C97203]" />
                            Send Us a Message
                        </h2>

                        <div className="bg-white border border-[#E5E1D8] rounded-lg p-6">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            required
                                            className="w-full px-4 py-3 border border-[#E5E1D8] rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203] outline-none transition-colors"
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            required
                                            className="w-full px-4 py-3 border border-[#E5E1D8] rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203] outline-none transition-colors"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            className="w-full px-4 py-3 border border-[#E5E1D8] rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203] outline-none transition-colors"
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className="w-full px-4 py-3 border border-[#E5E1D8] rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203] outline-none transition-colors"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        required
                                        className="w-full px-4 py-3 border border-[#E5E1D8] rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203] outline-none transition-colors"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="order-inquiry">Order Inquiry</option>
                                        <option value="product-question">Product Question</option>
                                        <option value="return-refund">Return & Refund</option>
                                        <option value="shipping-delivery">Shipping & Delivery</option>
                                        <option value="technical-support">Technical Support</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-[#E5E1D8] rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203] outline-none transition-colors resize-none"
                                        placeholder="Please describe your inquiry in detail..."
                                    ></textarea>
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        name="newsletter"
                                        className="mt-1 w-4 h-4 text-[#C97203] rounded focus:ring-[#C97203] focus:ring-2"
                                    />
                                    <label htmlFor="newsletter" className="text-sm text-[#3B2305]">
                                        I would like to receive updates about new products, sales, and promotions from WiseStyle.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#C97203] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#A85D02] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            <div className="bg-[#F9F5F0] p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                                    How long does shipping take?
                                </h3>
                                <p className="text-sm text-[#3B2305]">
                                    Local deliveries within Lagos take 24-48 hours, while interstate deliveries take 3-5 business days.
                                    For more details, see our{' '}
                                    <Link href="/shipping-policy" className="text-[#C97203] hover:underline">
                                        Shipping Policy
                                    </Link>
                                </p>
                            </div>

                            <div className="bg-[#F0F9FF] border border-[#E0F2FE] p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                                    What is your return policy?
                                </h3>
                                <p className="text-sm text-[#3B2305]">
                                    We offer a 7-day return policy for items in original condition.
                                    See our{' '}
                                    <Link href="/returns-policy" className="text-[#C97203] hover:underline">
                                        Returns & Refunds Policy
                                    </Link> for complete details.
                                </p>
                            </div>

                            <div className="bg-[#FFF7F0] border border-[#F4EFE8] p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                                    Do you ship internationally?
                                </h3>
                                <p className="text-sm text-[#3B2305]">
                                    Currently, we ship within Nigeria only. International shipping is coming soon!
                                </p>
                            </div>

                            <div className="bg-[#F9F5F0] p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                                    What payment methods do you accept?
                                </h3>
                                <p className="text-sm text-[#3B2305]">
                                    We accept credit/debit cards, bank transfers, and mobile money payments through secure payment processors.
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/faqs"
                                className="inline-flex items-center gap-2 text-[#C97203] font-semibold hover:text-[#A85D02] transition-colors"
                            >
                                View All FAQs
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>

                    {/* Social Media */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] text-center">Follow Us</h2>

                        <div className="flex justify-center space-x-6">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#C97203] text-white p-4 rounded-full hover:bg-[#A85D02] transition-colors"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#C97203] text-white p-4 rounded-full hover:bg-[#A85D02] transition-colors"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="https://tiktok.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#C97203] text-white p-4 rounded-full hover:bg-[#A85D02] transition-colors"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                </svg>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
} 