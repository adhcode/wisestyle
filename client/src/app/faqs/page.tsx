'use client';

import Link from 'next/link';
import { ChevronRight, Phone, Mail, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

export default function FAQsPage() {
    const [openItems, setOpenItems] = useState<number[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const faqs: FAQItem[] = [
        // Ordering
        {
            question: "How do I place an order?",
            answer: "You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. You'll need to create an account or sign in, provide shipping and billing information, and complete payment to confirm your order.",
            category: "ordering"
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept credit/debit cards (Visa, Mastercard), bank transfers, and mobile money payments. All payments are processed securely through our trusted payment partners like Paystack and Flutterwave.",
            category: "ordering"
        },
        {
            question: "Can I modify or cancel my order after placing it?",
            answer: "Orders can only be modified or cancelled within 1 hour of placement, and only if they haven't been processed for shipping yet. Please contact our customer service team immediately if you need to make changes.",
            category: "ordering"
        },
        {
            question: "Do you offer discounts or promotions?",
            answer: "Yes! We regularly offer discounts, seasonal sales, and promotional codes. Follow us on social media and subscribe to our newsletter to stay updated on the latest offers and exclusive deals.",
            category: "ordering"
        },

        // Shipping & Delivery
        {
            question: "How long does shipping take?",
            answer: "Local deliveries within Lagos take 24-48 hours, while interstate deliveries take 3-5 business days. Delivery times may vary during peak seasons or holidays. You'll receive tracking information once your order ships.",
            category: "shipping"
        },
        {
            question: "How much does shipping cost?",
            answer: "Shipping costs vary based on your location and the shipping method selected. Local deliveries typically cost ₦500-₦1,000, while interstate deliveries cost ₦1,500-₦3,000. Free shipping is available on orders above ₦50,000.",
            category: "shipping"
        },
        {
            question: "Do you ship internationally?",
            answer: "Currently, we only ship within Nigeria. We're working on expanding our delivery options to serve customers worldwide. Sign up for our newsletter to be notified when international shipping becomes available.",
            category: "shipping"
        },
        {
            question: "Can I track my order?",
            answer: "Yes! Once your order is shipped, you'll receive a confirmation email with tracking information. You can track your package directly on the carrier's website using the provided tracking number.",
            category: "shipping"
        },
        {
            question: "What if my package is lost or damaged?",
            answer: "If your package is lost or damaged during delivery, please contact us immediately with your order number and photos of the damage. We'll work with the shipping carrier to resolve the issue and ensure you receive a replacement or refund.",
            category: "shipping"
        },

        // Returns & Refunds
        {
            question: "What is your return policy?",
            answer: "We offer a 14-day return policy for items in original condition, unworn, unwashed, and with all original tags attached. Sale and clearance items are final sale and cannot be returned. See our Returns & Refunds Policy for complete details.",
            category: "returns"
        },
        {
            question: "How do I return an item?",
            answer: "To return an item, contact our customer service team with your order number and reason for return. We'll provide you with a return authorization number and shipping instructions. You're responsible for return shipping costs unless the item is defective.",
            category: "returns"
        },
        {
            question: "How long does it take to process a refund?",
            answer: "Refunds are processed within 5-7 business days after we receive your return. Your bank may take an additional 3-5 business days to credit your account. You'll receive an email confirmation once the refund is processed.",
            category: "returns"
        },
        {
            question: "Can I exchange an item for a different size or color?",
            answer: "Yes! You can exchange an item for a different size or color within the 14-day return window, subject to availability. If the desired item is not available, we'll process a refund instead. Follow the same return process and specify your exchange preference.",
            category: "returns"
        },

        // Product Information
        {
            question: "Are your products authentic?",
            answer: "Yes, all our products are 100% authentic. We source directly from authorized manufacturers and distributors to ensure the highest quality and authenticity of every item we sell.",
            category: "products"
        },
        {
            question: "What if an item is out of stock?",
            answer: "If an item becomes out of stock after you place your order, we'll notify you immediately and offer alternatives or a full refund. You can also sign up for restock notifications on product pages.",
            category: "products"
        },
        {
            question: "Do you offer size guides?",
            answer: "Yes! We provide detailed size guides for all our clothing items. You can find size charts on individual product pages to help you choose the perfect fit. If you're unsure about sizing, our customer service team is happy to help.",
            category: "products"
        },
        {
            question: "Can I request a specific item that's not on your website?",
            answer: "We're always looking to expand our product selection! If you're looking for a specific item we don't currently carry, please contact our customer service team. We'll do our best to source it for you or suggest similar alternatives.",
            category: "products"
        },

        // Account & Technical
        {
            question: "How do I create an account?",
            answer: "You can create an account by clicking the 'Sign Up' button in the top navigation. You'll need to provide your email address, create a password, and verify your email address. You can also create an account during checkout.",
            category: "account"
        },
        {
            question: "I forgot my password. How do I reset it?",
            answer: "Click the 'Forgot Password' link on the sign-in page. Enter your email address, and we'll send you a password reset link. Make sure to check your spam folder if you don't receive the email within a few minutes.",
            category: "account"
        },
        {
            question: "How do I update my account information?",
            answer: "Sign in to your account and go to the 'Profile' section. You can update your personal information, shipping addresses, and account preferences there. Changes are saved automatically.",
            category: "account"
        },
        {
            question: "Is my personal information secure?",
            answer: "Yes! We take data security seriously and use industry-standard encryption to protect your personal information. We never share your data with third parties for marketing purposes. See our Privacy Policy for more details.",
            category: "account"
        }
    ];

    const categories = [
        { id: 'all', name: 'All Questions' },
        { id: 'ordering', name: 'Ordering' },
        { id: 'shipping', name: 'Shipping & Delivery' },
        { id: 'returns', name: 'Returns & Refunds' },
        { id: 'products', name: 'Product Information' },
        { id: 'account', name: 'Account & Technical' }
    ];

    const filteredFaqs = activeCategory === 'all'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    const toggleItem = (index: number) => {
        setOpenItems(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">Frequently Asked Questions</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Frequently Asked Questions</h1>
                        <p className="text-lg text-[#3B2305]">
                            Find answers to common questions about our products, services, and policies.
                            Can't find what you're looking for? Contact our customer service team.
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

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === category.id
                                    ? 'bg-[#C97203] text-white'
                                    : 'bg-[#F9F5F0] text-[#3B2305] hover:bg-[#E5E1D8]'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => (
                            <div key={index} className="bg-white border border-[#E5E1D8] rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#F9F5F0] transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-[#1E1E1E] pr-4">
                                        {faq.question}
                                    </h3>
                                    {openItems.includes(index) ? (
                                        <ChevronUp className="w-5 h-5 text-[#C97203] flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-[#C97203] flex-shrink-0" />
                                    )}
                                </button>
                                {openItems.includes(index) && (
                                    <div className="px-6 pb-4">
                                        <p className="text-[#3B2305] leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Still Have Questions */}
                    <section className="space-y-6">
                        <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-lg p-6 text-center space-y-4">
                            <div className="bg-[#C97203] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <HelpCircle className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#1E1E1E]">Still Have Questions?</h2>
                            <p className="text-[#3B2305]">
                                Can't find the answer you're looking for? Our customer service team is here to help!
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

                    {/* Related Links */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-[#1E1E1E] text-center">Related Information</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Link
                                href="/shipping-policy"
                                className="bg-[#F9F5F0] p-4 rounded-lg text-center hover:bg-[#E5E1D8] transition-colors"
                            >
                                <h3 className="font-semibold text-[#1E1E1E] mb-2">Shipping Policy</h3>
                                <p className="text-sm text-[#3B2305]">Learn about our shipping options and delivery times</p>
                            </Link>
                            <Link
                                href="/returns-policy"
                                className="bg-[#F0F9FF] border border-[#E0F2FE] p-4 rounded-lg text-center hover:bg-[#E0F2FE] transition-colors"
                            >
                                <h3 className="font-semibold text-[#1E1E1E] mb-2">Returns & Refunds</h3>
                                <p className="text-sm text-[#3B2305]">Understand our return process and refund policy</p>
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-[#FFF7F0] border border-[#F4EFE8] p-4 rounded-lg text-center hover:bg-[#F4EFE8] transition-colors"
                            >
                                <h3 className="font-semibold text-[#1E1E1E] mb-2">Contact Us</h3>
                                <p className="text-sm text-[#3B2305]">Get in touch with our customer service team</p>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
} 