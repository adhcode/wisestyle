'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, 
    MessageCircle, 
    Phone, 
    Mail, 
    Clock,
    ChevronDown,
    ChevronRight,
    Search,
    HelpCircle,
    Truck,
    CreditCard,
    RotateCcw,
    Shield
} from 'lucide-react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQ[] = [
    {
        id: '1',
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 3-5 business days within Nigeria. Express shipping is available for 1-2 business days delivery.',
        category: 'Shipping'
    },
    {
        id: '2',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, bank transfers, and mobile money payments including Paystack and Flutterwave.',
        category: 'Payment'
    },
    {
        id: '3',
        question: 'Can I return or exchange items?',
        answer: 'Yes, you can return items within 30 days of delivery. Items must be in original condition with tags attached.',
        category: 'Returns'
    },
    {
        id: '4',
        question: 'How do I track my order?',
        answer: 'You can track your order by logging into your account and visiting the "My Orders" section. You\'ll also receive tracking information via email.',
        category: 'Orders'
    },
    {
        id: '5',
        question: 'Do you offer international shipping?',
        answer: 'Currently, we only ship within Nigeria. We are working on expanding to other African countries soon.',
        category: 'Shipping'
    },
    {
        id: '6',
        question: 'How do I change or cancel my order?',
        answer: 'You can modify or cancel your order within 1 hour of placing it. Contact customer service immediately for assistance.',
        category: 'Orders'
    },
    {
        id: '7',
        question: 'What sizes do you offer?',
        answer: 'We offer sizes from XS to 3XL for most items. Check individual product pages for specific size charts and availability.',
        category: 'Products'
    },
    {
        id: '8',
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard SSL encryption and work with trusted payment processors to ensure your information is secure.',
        category: 'Security'
    }
];

const categories = [
    { name: 'Shipping', icon: Truck, color: 'text-blue-600' },
    { name: 'Payment', icon: CreditCard, color: 'text-green-600' },
    { name: 'Returns', icon: RotateCcw, color: 'text-orange-600' },
    { name: 'Orders', icon: HelpCircle, color: 'text-purple-600' },
    { name: 'Security', icon: Shield, color: 'text-red-600' },
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/profile" className="flex items-center text-gray-600">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span>Back</span>
                        </Link>
                        <h1 className="text-lg font-semibold text-gray-900">Help & Support</h1>
                        <div className="w-16"></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                                activeTab === 'faq'
                                    ? 'border-[#3B2305] text-[#3B2305]'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            FAQ
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                                activeTab === 'contact'
                                    ? 'border-[#3B2305] text-[#3B2305]'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto">
                {activeTab === 'faq' ? (
                    <div className="bg-white">
                        {/* Search */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for help..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                                        !selectedCategory
                                            ? 'bg-[#3B2305] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.name}
                                        onClick={() => setSelectedCategory(category.name)}
                                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                                            selectedCategory === category.name
                                                ? 'bg-[#3B2305] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FAQs */}
                        <div className="divide-y divide-gray-200">
                            {filteredFAQs.length === 0 ? (
                                <div className="p-8 text-center">
                                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No FAQs found matching your search.</p>
                                </div>
                            ) : (
                                filteredFAQs.map((faq) => (
                                    <div key={faq.id} className="p-4">
                                        <button
                                            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                            className="w-full text-left flex items-center justify-between"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 mb-1">{faq.question}</h3>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {faq.category}
                                                </span>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                                                expandedFAQ === faq.id ? 'rotate-180' : ''
                                            }`} />
                                        </button>
                                        {expandedFAQ === faq.id && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* Contact Tab */
                    <div className="bg-white">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Get in Touch</h2>
                            
                            <div className="space-y-4">
                                {/* Live Chat */}
                                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <MessageCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-medium text-gray-900">Live Chat</h3>
                                        <p className="text-sm text-gray-600">Chat with our support team</p>
                                        <div className="flex items-center mt-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-xs text-green-600">Online now</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>

                                {/* Phone */}
                                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-medium text-gray-900">Phone Support</h3>
                                        <p className="text-sm text-gray-600">+234 (0) 123 456 7890</p>
                                        <div className="flex items-center mt-1">
                                            <Clock className="w-3 h-3 text-gray-400 mr-1" />
                                            <span className="text-xs text-gray-500">Mon-Fri 9AM-6PM WAT</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-medium text-gray-900">Email Support</h3>
                                        <p className="text-sm text-gray-600">hello@wisestyleshop.com</p>
                                        <p className="text-xs text-gray-500 mt-1">We'll respond within 24 hours</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link
                                        href="/orders"
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-gray-900">Track an Order</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Link>
                                    <Link
                                        href="/returns"
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-gray-900">Start a Return</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Link>
                                    <Link
                                        href="/address-book"
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-gray-900">Update Address</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Link>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-3">Business Hours</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monday - Friday</span>
                                        <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Saturday</span>
                                        <span className="text-gray-900">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sunday</span>
                                        <span className="text-gray-900">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}