'use client';

import Link from 'next/link';
import { ChevronRight, Phone, Mail, Truck, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">Shipping Policy</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Shipping & Delivery Policy</h1>
                        <p className="text-lg text-[#3B2305]">
                            This document outlines our shipping policy for customers making purchases at WiseStyle.
                            For any questions, please contact our customer service team.
                        </p>
                    </div>

                    {/* Contact Info Banner */}
                    <div className="bg-[#F9F5F0] p-6 rounded-lg flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-[#C97203]" />
                            <a href="tel:+2348148331000" className="text-[#1E1E1E] font-medium hover:text-[#C97203]">
                                +234 814 833 1000
                            </a>
                        </div>
                        <div className="hidden md:block text-[#3B2305]">|</div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-[#C97203]" />
                            <a href="mailto:info@wisestyle.com" className="text-[#1E1E1E] font-medium hover:text-[#C97203]">
                                info@wisestyle.com
                            </a>
                        </div>
                    </div>

                    {/* Shipping Options */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Truck className="w-6 h-6 text-[#C97203]" />
                            Shipping Options & Delivery Costs
                        </h2>

                        <p className="text-[#3B2305]">
                            We offer the following shipping options - you will be asked to select a shipping method at checkout:
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#C97203]" />
                                    <h3 className="text-lg font-semibold text-[#1E1E1E]">Local Delivery</h3>
                                </div>
                                <p className="text-[#3B2305]">Deliveries within Lagos State</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-[#C97203]" />
                                    <span className="font-medium">24-48 hours</span>
                                </div>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-[#C97203]" />
                                    <h3 className="text-lg font-semibold text-[#1E1E1E]">Interstate Delivery</h3>
                                </div>
                                <p className="text-[#3B2305]">States outside Lagos State</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-[#C97203]" />
                                    <span className="font-medium">3-5 working days</span>
                                </div>
                                <p className="text-xs text-[#3B2305] opacity-80">Fulfilled by DHL or GIGL (God Is Good Logistics)</p>
                            </div>
                        </div>

                        <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#C97203] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-[#1E1E1E] mb-1">International Delivery</h4>
                                    <p className="text-sm text-[#3B2305]">Coming soon! We're working on expanding our delivery options to serve customers worldwide.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Processing Time */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Clock className="w-6 h-6 text-[#C97203]" />
                            Order Processing Time
                        </h2>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-[#F9F5F0] p-4 rounded-lg">
                                    <h3 className="font-semibold text-[#1E1E1E] mb-2">Lagos Deliveries</h3>
                                    <p className="text-sm text-[#3B2305]">
                                        After payment and processing, expect delivery within <strong>24-48 hours</strong>.
                                    </p>
                                </div>
                                <div className="bg-[#F9F5F0] p-4 rounded-lg">
                                    <h3 className="font-semibold text-[#1E1E1E] mb-2">Interstate Deliveries</h3>
                                    <p className="text-sm text-[#3B2305]">
                                        After payment and processing, expect delivery within <strong>3-5 working days</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-4">
                                <p className="text-sm text-[#3B2305]">
                                    <strong>Note:</strong> Orders placed during weekends or public holidays will be sent from our warehouse on Monday or the next business day.
                                </p>
                            </div>

                            <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-4">
                                <p className="text-sm text-[#1E1E1E]">
                                    <strong>Express Delivery Available:</strong> Need your order urgently? Contact us on any of our platforms. We can provide you with express delivery costs and discuss the urgency of your delivery.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Address */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Delivery Address & Restrictions</h2>

                        <div className="space-y-4">
                            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-2 text-sm">
                                        <p className="text-red-800">
                                            <strong>Important:</strong> We are unable to modify the delivery address once you have placed your order.
                                        </p>
                                        <p className="text-red-700">
                                            We do not deliver to P.O. boxes. Please provide a physical address for delivery.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* International Orders */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">International Orders</h2>

                        <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-6 space-y-3">
                            <p className="text-[#3B2305]">
                                Your package may be subject to import duties and taxes. As the customer, you are responsible for paying these fees.
                            </p>
                            <p className="text-[#3B2305]">
                                We recommend checking with your local customs office before placing an order, as these fees can sometimes be significant and we are unable to calculate them for you.
                            </p>
                        </div>
                    </section>

                    {/* Order Tracking */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Tracking Your Order</h2>

                        <div className="bg-[#F9F5F0] rounded-lg p-6">
                            <p className="text-[#3B2305]">
                                Once your order has been dispatched, we will send you a confirmation email with tracking information.
                                You will be able to track your package directly on the carrier's website using the provided tracking number.
                            </p>
                        </div>
                    </section>

                    {/* Returns Info */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Returns, Refunds, and Exchanges</h2>

                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6">
                            <p className="text-[#1E1E1E] mb-3">
                                We want you to be completely happy with your purchase.
                            </p>
                            <p className="text-[#3B2305]">
                                Please read our{' '}
                                <Link href="/returns-policy" className="text-[#C97203] hover:underline font-medium">
                                    Returns & Refunds Policy
                                </Link>
                                {' '}for detailed information about our processes.
                            </p>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Questions?</h2>

                        <div className="bg-[#1E1E1E] text-white rounded-lg p-6 text-center space-y-4">
                            <p className="text-lg">Need help with your order or have shipping questions?</p>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                <a
                                    href="tel:+2348148331000"
                                    className="flex items-center gap-2 bg-[#C97203] text-white px-6 py-3 rounded-lg hover:bg-[#A85D02] transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call us: +234 814 833 1000
                                </a>
                                <a
                                    href="mailto:info@wisestyle.com"
                                    className="flex items-center gap-2 border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#1E1E1E] transition-colors"
                                >
                                    <Mail className="w-5 h-5" />
                                    Email: info@wisestyle.com
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
} 