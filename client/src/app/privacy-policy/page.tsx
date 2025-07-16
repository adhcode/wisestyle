'use client';

import Link from 'next/link';
import { ChevronRight, Phone, Mail, Shield, Eye, Lock, Database, Users, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">Privacy Policy</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Privacy Policy</h1>
                        <p className="text-lg text-[#3B2305]">
                            At WiseStyle, we are committed to protecting your privacy and ensuring the security of your personal information.
                            This policy explains how we collect, use, and safeguard your data.
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

                    {/* Information We Collect */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Database className="w-6 h-6 text-[#C97203]" />
                            Information We Collect
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Personal Information</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Name and contact information (email, phone number)</li>
                                    <li>• Shipping and billing addresses</li>
                                    <li>• Payment information (processed securely by our payment partners)</li>
                                    <li>• Account credentials and preferences</li>
                                    <li>• Order history and purchase behavior</li>
                                </ul>
                            </div>

                            <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Automatically Collected Information</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Device information (IP address, browser type, operating system)</li>
                                    <li>• Website usage data (pages visited, time spent, clicks)</li>
                                    <li>• Cookies and similar tracking technologies</li>
                                    <li>• Location data (if you enable location services)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Eye className="w-6 h-6 text-[#C97203]" />
                            How We Use Your Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Order Processing</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Process and fulfill your orders</li>
                                    <li>• Send order confirmations and updates</li>
                                    <li>• Handle returns and refunds</li>
                                    <li>• Provide customer support</li>
                                </ul>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Website Improvement</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Analyze website usage and performance</li>
                                    <li>• Improve user experience</li>
                                    <li>• Personalize content and recommendations</li>
                                    <li>• Detect and prevent fraud</li>
                                </ul>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Communication</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Send marketing communications (with consent)</li>
                                    <li>• Provide product updates and news</li>
                                    <li>• Respond to inquiries and feedback</li>
                                    <li>• Send important service notifications</li>
                                </ul>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Legal Compliance</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Comply with legal obligations</li>
                                    <li>• Protect our rights and property</li>
                                    <li>• Prevent fraud and abuse</li>
                                    <li>• Maintain security and safety</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Users className="w-6 h-6 text-[#C97203]" />
                            Information Sharing
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">We Do Not Sell Your Data</h3>
                                <p className="text-[#3B2305]">
                                    WiseStyle does not sell, rent, or trade your personal information to third parties for marketing purposes.
                                </p>
                            </div>

                            <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Service Providers</h3>
                                <p className="text-[#3B2305] mb-3">
                                    We may share your information with trusted service providers who help us operate our business:
                                </p>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Payment processors (Paystack, Flutterwave)</li>
                                    <li>• Shipping and delivery partners</li>
                                    <li>• Email service providers</li>
                                    <li>• Website analytics and security services</li>
                                </ul>
                            </div>

                            <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">Legal Requirements</h3>
                                <p className="text-[#3B2305]">
                                    We may disclose your information if required by law, court order, or government request,
                                    or to protect our rights, property, or safety.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Lock className="w-6 h-6 text-[#C97203]" />
                            Data Security
                        </h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">Protection Measures</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-[#1E1E1E] mb-2">Technical Security</h4>
                                    <ul className="space-y-1 text-sm text-[#3B2305]">
                                        <li>• SSL encryption for data transmission</li>
                                        <li>• Secure servers and databases</li>
                                        <li>• Regular security audits</li>
                                        <li>• Access controls and authentication</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#1E1E1E] mb-2">Operational Security</h4>
                                    <ul className="space-y-1 text-sm text-[#3B2305]">
                                        <li>• Employee training on data protection</li>
                                        <li>• Limited access to personal data</li>
                                        <li>• Secure disposal of data</li>
                                        <li>• Incident response procedures</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Shield className="w-6 h-6 text-[#C97203]" />
                            Your Rights
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Access and Control</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Access your personal information</li>
                                    <li>• Update or correct your data</li>
                                    <li>• Request deletion of your data</li>
                                    <li>• Opt-out of marketing communications</li>
                                </ul>
                            </div>

                            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">Data Portability</h3>
                                <ul className="space-y-2 text-sm text-[#3B2305]">
                                    <li>• Request a copy of your data</li>
                                    <li>• Transfer data to another service</li>
                                    <li>• Export your order history</li>
                                    <li>• Download your account information</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6">
                            <p className="text-[#3B2305]">
                                To exercise any of these rights, please contact us at{' '}
                                <a href="mailto:hello@wisestyleshop.com" className="text-[#C97203] hover:underline">
                                    hello@wisestyleshop.com
                                </a>
                                . We will respond to your request within 30 days.
                            </p>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Cookies and Tracking</h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-[#1E1E1E]">How We Use Cookies</h3>
                            <p className="text-[#3B2305] mb-4">
                                We use cookies and similar technologies to enhance your browsing experience, analyze website traffic,
                                and personalize content.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-[#1E1E1E] mb-2">Essential Cookies</h4>
                                    <p className="text-sm text-[#3B2305]">
                                        Required for website functionality, security, and basic operations.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#1E1E1E] mb-2">Analytics Cookies</h4>
                                    <p className="text-sm text-[#3B2305]">
                                        Help us understand how visitors use our website and improve performance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* International Transfers */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-3">
                            <Globe className="w-6 h-6 text-[#C97203]" />
                            International Data Transfers
                        </h2>

                        <div className="bg-[#FFF7F0] border border-[#F4EFE8] rounded-lg p-6">
                            <p className="text-[#3B2305]">
                                Your information may be transferred to and processed in countries other than your own.
                                We ensure that such transfers comply with applicable data protection laws and implement
                                appropriate safeguards to protect your information.
                            </p>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Children's Privacy</h2>

                        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-6">
                            <p className="text-red-800">
                                Our website is not intended for children under 13 years of age. We do not knowingly collect
                                personal information from children under 13. If you are a parent or guardian and believe your
                                child has provided us with personal information, please contact us immediately.
                            </p>
                        </div>
                    </section>

                    {/* Policy Updates */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Policy Updates</h2>

                        <div className="bg-[#F9F5F0] p-6 rounded-lg">
                            <p className="text-[#3B2305]">
                                We may update this privacy policy from time to time. We will notify you of any material changes
                                by posting the new policy on this page and updating the "Last updated" date. We encourage you
                                to review this policy periodically.
                            </p>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#1E1E1E]">Contact Us</h2>

                        <div className="bg-[#1E1E1E] text-white rounded-lg p-6 text-center space-y-4">
                            <p className="text-lg">Questions about our privacy policy?</p>
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