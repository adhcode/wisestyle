import Link from 'next/link';
import ProductCard, { Product } from '@/components/ProductCard';

interface ProductSectionProps {
    heading?: string;
    products: Product[];
    buttonText?: string;
    buttonHref?: string;
}

export default function ProductSection({ heading, products, buttonText, buttonHref }: ProductSectionProps) {
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
                        <ProductCard key={product.id} product={product} />
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