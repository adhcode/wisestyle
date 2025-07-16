'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Review {
    id: number;
    name: string;
    rating: number;
    comment: string;
    date: string;
    avatar?: string;
    verified: boolean;
}

const reviews: Review[] = [
    {
        id: 1,
        name: "Adebayo Johnson",
        rating: 5,
        comment: "This is my third order and everything has been smooth. Quality is solid and the fashion is clean and current.",
        date: "2 weeks ago",
        verified: true
    },
    {
        id: 2,
        name: "Emeka Okechukwu",
        rating: 5,
        comment: "The drip is real.” It’s rare to find a fashion store that gets both style and authenticity right. WiseStyle did both.",
        date: "1 month ago",
        verified: true
    },
    {
        id: 3,
        name: "Kwame Mensah",
        rating: 5,
        comment: "Amazing experience from start to finish. The website is easy to navigate, product selection is great, and the quality exceeded my expectations.",
        date: "3 weeks ago",
        verified: true
    },
    {
        id: 4,
        name: "Fatima Hassan",
        rating: 5,
        comment: "Customer service is unmatched. I had a sizing issue and they sorted it fast, no stress. The fact that they care about customers really shows.",
        date: "1 week ago",
        verified: true
    },
    {
        id: 5,
        name: "David Okonkwo",
        rating: 5,
        comment: "Clean fit, clean delivery. Ordered Friday, got it Monday. Packaging was neat, and the shirt slapped harder than I expected.",
        date: "2 months ago",
        verified: true
    },
    {
        id: 6,
        name: "Aisha Bello",
        rating: 5,
        comment: "I'm impressed with the quality and authenticity of the products. The customer support team was very helpful with sizing questions. My order arrived on time and in perfect condition.",
        date: "1 month ago",
        verified: true
    }
];

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-start justify-start align-left gap-1">
            {[...Array(5)].map((_, index) => (
                <svg
                    key={index}
                    className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

export default function ReviewSection() {
    const [activeTab, setActiveTab] = useState<'all' | 'verified'>('all');

    const filteredReviews = activeTab === 'verified'
        ? reviews.filter(review => review.verified)
        : reviews;

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    const totalReviews = reviews.length;

    return (
        <section className="bg-[#FEFBF4] py-16 px-4 sm:px-8 lg:px-[120px]">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="text-left mb-12">
                    <h2 className="font-macaw text-3xl md:text-4xl lg:text-5xl font-bold text-[#3B2305] mb-4 text-left">
                        What Our Customers Say
                    </h2>
                    <p className="text-lg md:text-xl text-[#6B4F3A]  text-left">
                        Don’t just take our word for it. See why WiseStyle is trusted for bold, original, and 100% authentic fashion.



                    </p>
                </div>

                {/* Rating Summary */}
                <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-[#E5E1D8]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#3B2305]">{averageRating.toFixed(1)}</div>
                                <StarRating rating={Math.round(averageRating)} />
                                <div className="text-sm text-[#6B4F3A] mt-1">out of 5</div>
                            </div>
                            <div className="text-left">
                                <div className="text-lg font-semibold text-[#3B2305]">Based on {totalReviews} reviews</div>
                                <div className="text-sm text-[#6B4F3A]">Verified customers</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
                                    ? 'bg-[#C97203] text-white'
                                    : 'bg-gray-100 text-[#6B4F3A] hover:bg-gray-200'
                                    }`}
                            >
                                All Reviews
                            </button>
                            <button
                                onClick={() => setActiveTab('verified')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'verified'
                                    ? 'bg-[#C97203] text-white'
                                    : 'bg-gray-100 text-[#6B4F3A] hover:bg-gray-200'
                                    }`}
                            >
                                Verified Only
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm border border-[#E5E1D8] hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#C97203] rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {review.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#3B2305]">{review.name}</div>
                                        {review.verified && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-xs text-green-600 font-medium">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>

                            <p className="text-[#6B4F3A] text-sm leading-relaxed mb-4">
                                "{review.comment}"
                            </p>

                            <div className="text-xs text-[#9B8A7A]">
                                {review.date}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                    <div className="bg-gradient-to-r from-[#C97203] to-[#E5A84A] rounded-lg p-8 text-white">
                        <h3 className="font-macaw text-2xl md:text-3xl font-bold mb-4">
                            Join Our Happy Customers
                        </h3>
                        <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                            Experience fashion that’s original, trusted, and always authentic, just like the people who wear it.
                        </p>
                        <button className="bg-white text-[#C97203] px-8 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors">
                            Shop Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
} 