'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <div className="relative w-full h-[248px] sm:h-[85vh] md:h-[90vh]">
            <Image
                src="/images/hero-men-fashion.png"
                alt="Men's fashion hero image"
                fill
                className="object-cover object-center"
                priority
            />
            {/* Gradient Overlay */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background: 'linear-gradient(269.77deg, rgba(255, 255, 255, 0) 42.24%, rgba(153, 129, 99, 0.153637) 61.12%, rgba(91, 53, 4, 0.246591) 72.54%, rgba(31, 10, 10, 0.4) 99.79%)'
                }}
            />
            <div className="absolute inset-0 flex top-1/2 items-end sm:items-center">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                    <div className="text-left pb-6 sm:py-8 relative z-20 bg-transparent">
                        <h1 className="font-macaw text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
                            Men's fashion
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-white w-[193px] sm:w-[310px] mb-3 sm:mb-8 max-w-md">
                            Explore the latest modern fashion clothing for men.
                        </p>
                        <Link
                            href="/products"
                            className="inline-block bg-[#C97203] hover:bg-[#C97203] text-white px-8 py-3 text-lg rounded-[4px] font-[400] shadow-lg transition-colors duration-200 font-inter text-center"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
