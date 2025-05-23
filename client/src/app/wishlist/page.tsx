'use client';
import { useLikes } from '@/contexts/LikesContext';
import Link from 'next/link';
import Image from 'next/image';

const allProducts = [
    // This should be replaced with a real product fetch in a real app
    { id: 1, name: 'Kaftan', slug: 'kaftan', price: 25000, image: '/images/trending/kaftant.png' },
    { id: 2, name: 'Black Tshirt', slug: 'black-tshirt', price: 22000, image: '/images/trending/blacktshirt.png' },
    { id: 3, name: 'Watch', slug: 'watch', price: 15000, image: '/images/trending/watches.png' },
    { id: 4, name: 'Jean', slug: 'jean', price: 25000, image: '/images/trending/jean.png' },
    { id: 5, name: 'Agbada', slug: 'agbada', price: 30000, image: '/images/new-arrivals/agbada.png' },
    { id: 6, name: 'Sunglass', slug: 'sunglass', price: 20000, image: '/images/trending/sunglass.png' },
    { id: 7, name: 'White Tshirt', slug: 'white-tshirt', price: 12000, image: '/images/trending/white-shirt.png' },
    { id: 8, name: 'Chinos', slug: 'chinos', price: 27000, image: '/images/new-arrivals/chinos-trouser.png' },
    { id: 9, name: 'Hats', slug: 'hats', price: 8000, image: '/images/trending/hat.png' },
    { id: 10, name: 'Black Tshirt', slug: 'black-tshirt', price: 16000, image: '/images/trending/blacktshirt.png' },
    { id: 11, name: 'White Tshirt', slug: 'white-tshirt', price: 24000, image: '/images/trending/white-shirt.png' },
    { id: 12, name: 'Bracelet', slug: 'bracelet', price: 21000, image: '/images/trending/wristband.png' },
];

export default function WishlistPage() {
    const { state: { likedProducts } } = useLikes();
    const liked = allProducts.filter(p => likedProducts.includes(p.id));

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-8 text-[#3B2305]">Your Wishlist</h1>
                {liked.length === 0 ? (
                    <div className="text-center text-gray-500">No products in your wishlist yet.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {liked.map(product => (
                            <Link key={product.id} href={`/product/${product.slug}`} className="block group bg-[#FEFBF4] rounded-lg overflow-hidden shadow hover:shadow-md transition">
                                <div className="relative w-full aspect-[211/300] bg-gray-100">
                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="p-3 flex flex-col items-start">
                                    <span className="text-[16px] font-[600] text-[#3B2305]">{product.name}</span>
                                    <span className="text-[16px] font-[500] text-[#3B2305]">₦{product.price.toLocaleString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 