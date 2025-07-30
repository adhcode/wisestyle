'use client';

interface Review {
    id: number;
    name: string;
    rating: number;
    comment: string;
    date: string;
}

const reviews: Review[] = [
    {
        id: 1,
        name: "Adebayo Johnson",
        rating: 5,
        comment: "This is my third order and everything has been smooth. Quality is solid and the fashion is clean and current.",
        date: "2 weeks ago",
    },
    {
        id: 2,
        name: "Emeka Okechukwu",
        rating: 5,
        comment: "The drip is real. It's rare to find a fashion store that gets both style and authenticity right. WiseStyle did both.",
        date: "1 month ago",
    },
    {
        id: 3,
        name: "Kwame Mensah",
        rating: 5,
        comment: "Amazing experience from start to finish. The website is easy to navigate, product selection is great, and the quality exceeded my expectations.",
        date: "3 weeks ago",
    },
    {
        id: 4,
        name: "Fatima Hassan",
        rating: 5,
        comment: "Customer service is unmatched. I had a sizing issue and they sorted it fast, no stress. The fact that they care about customers really shows.",
        date: "1 week ago",
    },
    {
        id: 5,
        name: "David Okonkwo",
        rating: 5,
        comment: "Clean fit, clean delivery. Ordered Friday, got it Monday. Packaging was neat, and the shirt slapped harder than I expected.",
        date: "2 months ago",
    },
    {
        id: 6,
        name: "Aisha Bello",
        rating: 5,
        comment: "I'm impressed with the quality and authenticity of the products. The customer support team was very helpful with sizing questions. My order arrived on time and in perfect condition.",
        date: "1 month ago",
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
    return (
        <section className="bg-[#FEFBF4] py-16 px-4 sm:px-8 lg:px-[120px]">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="text-left mb-12">
                    <h2 className="font-macaw text-3xl md:text-4xl lg:text-5xl font-bold text-[#3B2305] mb-4 text-left">
                        What Our Customers Say
                    </h2>
                    <p className="text-lg md:text-xl text-[#6B4F3A] text-left">
                        Don't just take our word for it. See why WiseStyle is trusted for bold, original, and 100% authentic fashion.
                    </p>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
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
                            Experience fashion that's original, trusted, and always authentic, just like the people who wear it.
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