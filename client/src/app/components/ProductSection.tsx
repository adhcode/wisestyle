import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState } from 'react';

export interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    slug: string;
    isLimited?: boolean;
}

interface ProductSectionProps {
    heading?: string;
    products: Product[];
    buttonText?: string;
    buttonHref?: string;
}

export default function ProductSection({ heading, products, buttonText, buttonHref }: ProductSectionProps) {
    const [likedProducts, setLikedProducts] = useState<string[]>([]);

    const toggleLike = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        setLikedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    return (
        <section className="bg-white py-12 sm:py-16">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                {heading && (
                    <div className="mb-8 sm:mb-12 text-left">
                        <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-agrandir font-semibold mb-1 sm:mb-2 md:mb-3 tracking-tight text-gray-900">
                            {heading}
                        </h2>
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {products.map((product) => (
                        <Link
                            href={`/product/${product.slug}`}
                            key={product.id}
                            className="group relative block bg-white overflow-hidden"
                        >
                            <div className="relative w-full pb-[125%] bg-gray-100">
                                <Image
                                    src={product.image || '/placeholder-product.png'}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg rounded-b-lg"
                                    priority
                                />
                            </div>
                            {product.isLimited && (
                                <span className="absolute top-4 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-1.5 py-1 rounded-full font-medium">
                                    Limited Edition
                                </span>
                            )}
                            <div className="p-4 pl-0">
                                <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mb-1.5 line-clamp-1 text-left">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-start gap-2">
                                    <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
                                        ₦{(product.price).toLocaleString()}
                                    </p>
                                    <button
                                        onClick={(e) => toggleLike(e, product.id)}
                                        className="flex items-center justify-center w-8 h-8"
                                    >
                                        <Heart
                                            className={`w-4 h-4 ${likedProducts.includes(product.id)
                                                ? 'fill-red-500 stroke-red-500'
                                                : 'stroke-gray-600'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {buttonText && buttonHref && (
                    <div className="text-left mt-8 sm:mt-12">
                        <Link
                            href={buttonHref}
                            className="inline-block bg-black text-white px-5 py-2 text-sm rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200"
                        >
                            {buttonText}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
} 