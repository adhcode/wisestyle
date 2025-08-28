'use client';

import Link from 'next/link';
import { ChevronRight, Phone, Mail, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, Package } from 'lucide-react';

export default function ReturnsPolicyPage() {
    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">Returns & Refunds Policy</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Returns & Refunds Policy</h1>
                        <p className="text-lg text-[#3B2305]">
                            We want you to be completely satisfied with your purchase. This policy outlines our returns and refunds process.
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
                            <a href="mailto:hello@wisestyleshop.com" className="text-[#1E1E1E] font-medium hover:text-[#C97203]">
                                hello@wisestyleshop.com
                            </a>
                        </div>
                    </div>

                    {/* Return Window */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Clock className="w-6 h-6 text-[#C97203]" />
                            Return Window
                        </h2>

                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">7-Day Return Policy</h3>
                            </div>
                            <p className="text-[#3B2305]">
                                You have <strong>7 days</strong> from the date of delivery to return your item(s) for a refund or exchange.
                                The item must be in its original condition, unworn, unwashed, and with all original tags attached.
                            </p>
                        </div>
                    </section>

                    {/* Return Conditions */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Package className="w-6 h-6 text-[#C97203]" />
                            Return Conditions
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white border border-green-200 rounded-lg p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg font-semibold text-[#1E1E1E]">What We Accept</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Items in original condition</li>
                                    <li>• Unworn and unwashed items</li>
                                    <li>• All original tags attached</li>
                                    <li>• Original packaging included</li>
                                    <li>• Within 7 days of delivery</li>
                                </ul>
                            </div>

                            <div className="bg-white border border-red-200 rounded-lg p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <h3 className="text-lg font-semibold text-[#1E1E1E]">What We Don't Accept</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Worn or damaged items</li>
                                    <li>• Items without original tags</li>
                                    <li>• Items outside return window</li>
                                    <li>• Sale or clearance items</li>
                                    <li>• Personalized or custom items</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Return Process */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <RefreshCw className="w-6 h-6 text-[#C97203]" />
                            How to Return an Item
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Step-by-Step Process</h3>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-[#C97203] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-[#1E1E1E]">Contact Customer Service</h4>
                                            <p className="text-sm text-[#3B2305]">
                                                Email us at hello@wisestyleshop.com or call +234 814 833 1000 with your order number and reason for return.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-[#C97203] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-[#1E1E1E]">Get Return Authorization</h4>
                                            <p className="text-sm text-[#3B2305]">
                                                We'll provide you with a return authorization number and shipping instructions.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-[#C97203] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-[#1E1E1E]">Package Your Return</h4>
                                            <p className="text-sm text-[#3B2305]">
                                                Securely package the item with all original tags and packaging. Include the return authorization number.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-[#C97203] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                            4
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-[#1E1E1E]">Ship Your Return</h4>
                                            <p className="text-sm text-[#3B2305]">
                                                Ship the package to our returns address. You are responsible for return shipping costs unless the item is defective.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-[#C97203] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                            5
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-[#1E1E1E]">Receive Refund</h4>
                                            <p className="text-sm text-[#3B2305]">
                                                Once we receive and inspect your return, we'll process your refund within 5-7 business days.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Refund Information */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Refund Information</h2>

                        <div className="space-y-4">
                            <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Refund Timeline</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-[#1E1E1E] mb-2">Processing Time</h4>
                                        <p className="text-sm text-[#3B2305]">
                                            Refunds are processed within <strong>5-7 business days</strong> after we receive your return.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[#1E1E1E] mb-2">Bank Processing</h4>
                                        <p className="text-sm text-[#3B2305]">
                                            Your bank may take an additional <strong>3-5 business days</strong> to credit your account.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">What Gets Refunded</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Full purchase price of returned items</li>
                                    <li>• Original shipping cost (if item is defective)</li>
                                    <li>• Return shipping cost (if item is defective)</li>
                                </ul>
                                <div className="mt-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded">
                                    <p className="text-sm text-red-800">
                                        <strong>Note:</strong> Return shipping costs are not refunded unless the item is defective or we made an error.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Exchanges */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Exchanges</h2>

                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">Size or Color Exchanges</h3>
                            <p className="text-[#3B2305]">
                                If you need a different size or color, you can exchange your item within the 7-day return window.
                                Exchanges are subject to availability. If the desired item is not available, we'll process a refund instead.
                            </p>
                            <p className="text-[#3B2305]">
                                <strong>Exchange Process:</strong> Follow the same return process, but specify that you want an exchange and include your preferred size/color.
                            </p>
                        </div>
                    </section>

                    {/* Defective Items */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Defective or Damaged Items</h2>

                        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Report Immediately</h3>
                                    <p className="text-sm text-red-800 mb-3">
                                        If you receive a defective or damaged item, please contact us within <strong>48 hours</strong> of delivery.
                                    </p>
                                    <ul className="space-y-1 text-sm text-red-700">
                                        <li>• Take photos of the damage/defect</li>
                                        <li>• Include your order number</li>
                                        <li>• We'll provide a prepaid return label</li>
                                        <li>• Full refund including shipping costs</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Need Help?</h2>

                        <div className="bg-[#1E1E1E] text-white rounded-lg p-6 text-center space-y-4">
                            <p className="text-lg">Have questions about returns or refunds?</p>
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
                                    className="flex items-center gap-2 border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#1E1E1E] transition-colors"
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