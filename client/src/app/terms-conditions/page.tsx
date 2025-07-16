'use client';

import Link from 'next/link';
import { ChevronRight, Phone, Mail, FileText, AlertTriangle, CheckCircle, XCircle, Shield, Users } from 'lucide-react';

export default function TermsConditionsPage() {
    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">Terms & Conditions</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Terms & Conditions</h1>
                        <p className="text-lg text-[#3B2305]">
                            These terms and conditions govern your use of WiseStyle's website and services.
                            By using our website, you accept these terms in full.
                        </p>
                        <p className="text-sm text-[#666]">
                            Last updated: {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
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

                    {/* Acceptance of Terms */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-[#C97203]" />
                            Acceptance of Terms
                        </h2>

                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6">
                            <p className="text-[#3B2305]">
                                By accessing and using the WiseStyle website, you acknowledge that you have read, understood,
                                and agree to be bound by these terms and conditions. If you do not agree with any part of these terms,
                                please do not use our website.
                            </p>
                        </div>
                    </section>

                    {/* Account Registration */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Users className="w-6 h-6 text-[#C97203]" />
                            Account Registration
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Account Requirements</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• You must be at least 18 years old to create an account</li>
                                    <li>• Provide accurate and complete information</li>
                                    <li>• Maintain the security of your account credentials</li>
                                    <li>• Notify us immediately of any unauthorized use</li>
                                    <li>• You are responsible for all activities under your account</li>
                                </ul>
                            </div>

                            <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">Account Termination</h3>
                                <p className="text-[#3B2305]">
                                    We reserve the right to terminate or suspend your account at any time for violation of these terms,
                                    fraudulent activity, or any other reason at our sole discretion.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Product Information */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Product Information</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Product Descriptions</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• We strive for accurate product descriptions</li>
                                    <li>• Images are representative but may vary</li>
                                    <li>• Colors may appear differently on screens</li>
                                    <li>• Sizes and measurements are approximate</li>
                                </ul>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Pricing</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• All prices are in Nigerian Naira (₦)</li>
                                    <li>• Prices are subject to change without notice</li>
                                    <li>• Sales tax may apply where applicable</li>
                                    <li>• Shipping costs are additional</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Product Availability</h3>
                                    <p className="text-red-800">
                                        Product availability is subject to change. We reserve the right to discontinue products
                                        or modify specifications without prior notice. If a product becomes unavailable after
                                        your order, we will notify you and provide a refund or alternative.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ordering and Payment */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Ordering and Payment</h2>

                        <div className="space-y-4">
                            <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Order Process</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Orders are subject to acceptance and availability</li>
                                    <li>• We reserve the right to refuse any order</li>
                                    <li>• Orders are confirmed via email</li>
                                    <li>• Payment must be completed before processing</li>
                                </ul>
                            </div>

                            <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Payment Methods</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Credit/Debit cards (Visa, Mastercard)</li>
                                    <li>• Bank transfers</li>
                                    <li>• Mobile money</li>
                                    <li>• Other payment methods as available</li>
                                </ul>
                                <p className="text-sm text-[#3B2305]">
                                    All payments are processed securely through our trusted payment partners.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Shipping and Delivery */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Shipping and Delivery</h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">Delivery Terms</h3>
                            <ul className="space-y-2 text-sm text-[#3B2305]">
                                <li>• Delivery times are estimates only</li>
                                <li>• Risk of loss transfers upon delivery</li>
                                <li>• You are responsible for providing accurate delivery information</li>
                                <li>• Additional charges may apply for failed deliveries</li>
                            </ul>
                            <p className="text-sm text-[#3B2305]">
                                For detailed shipping information, please refer to our{' '}
                                <Link href="/shipping-policy" className="text-[#C97203] hover:underline">
                                    Shipping & Delivery Policy
                                </Link>.
                            </p>
                        </div>
                    </section>

                    {/* Returns and Refunds */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Returns and Refunds</h2>

                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6">
                            <p className="text-[#3B2305]">
                                Returns and refunds are subject to our{' '}
                                <Link href="/returns-policy" className="text-[#C97203] hover:underline">
                                    Returns & Refunds Policy
                                </Link>.
                                By placing an order, you agree to the terms outlined in that policy.
                            </p>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Intellectual Property</h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">Ownership</h3>
                            <p className="text-[#3B2305] mb-4">
                                All content on this website, including text, graphics, logos, images, and software,
                                is the property of WiseStyle or its licensors and is protected by copyright laws.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-[#1E1E1E] mb-2">Permitted Use</h4>
                                    <ul className="space-y-1 text-sm text-[#3B2305]">
                                        <li>• Personal, non-commercial use</li>
                                        <li>• Viewing and purchasing products</li>
                                        <li>• Legitimate business purposes</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#1E1E1E] mb-2">Prohibited Use</h4>
                                    <ul className="space-y-1 text-sm text-[#3B2305]">
                                        <li>• Copying or reproducing content</li>
                                        <li>• Commercial use without permission</li>
                                        <li>• Reverse engineering</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Prohibited Activities */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Prohibited Activities</h2>

                        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">You agree not to:</h3>
                            <ul className="space-y-2 text-sm text-red-800">
                                <li>• Use the website for illegal purposes</li>
                                <li>• Attempt to gain unauthorized access to our systems</li>
                                <li>• Interfere with website functionality</li>
                                <li>• Submit false or misleading information</li>
                                <li>• Engage in fraudulent activities</li>
                                <li>• Violate any applicable laws or regulations</li>
                            </ul>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Shield className="w-6 h-6 text-[#C97203]" />
                            Limitation of Liability
                        </h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                            <p className="text-[#3B2305]">
                                To the maximum extent permitted by law, WiseStyle shall not be liable for any indirect,
                                incidental, special, consequential, or punitive damages arising from your use of our website
                                or services.
                            </p>
                            <p className="text-[#3B2305]">
                                Our total liability for any claims arising from these terms shall not exceed the amount
                                you paid for the specific product or service giving rise to the claim.
                            </p>
                        </div>
                    </section>

                    {/* Privacy */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Privacy</h2>

                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6">
                            <p className="text-[#3B2305]">
                                Your privacy is important to us. Please review our{' '}
                                <Link href="/privacy-policy" className="text-[#C97203] hover:underline">
                                    Privacy Policy
                                </Link>,
                                which also governs your use of our website and services.
                            </p>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Governing Law</h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg">
                            <p className="text-[#3B2305]">
                                These terms and conditions are governed by and construed in accordance with the laws of Nigeria.
                                Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the
                                courts of Nigeria.
                            </p>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Changes to Terms</h2>

                        <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-6">
                            <p className="text-[#3B2305]">
                                We reserve the right to modify these terms at any time. Changes will be effective immediately
                                upon posting on our website. Your continued use of our website after changes constitutes
                                acceptance of the new terms.
                            </p>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Questions?</h2>

                        <div className="bg-[#1E1E1E] text-white rounded-lg p-6 text-center space-y-4">
                            <p className="text-lg">Need clarification on our terms and conditions?</p>
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