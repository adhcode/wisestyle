'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, ChevronRight, Check, Truck, Shield, Star, Package } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import { ProductService } from '@/services/product.service';
import { RateLimitError, NotFoundError } from '@/utils/api-client';
import { Product, Size, Color } from '@/types/product';
import { getProductImageUrl, getProductImages } from '@/utils/image';
import CartButton from '@/app/components/CartButton';

interface ProductPageProps {
    params: {
        slug: string;
    };
}

// Interface for cart items
interface CustomCartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    color?: string;
}

export default function ProductPage({ params }: ProductPageProps) {
    const placeholderImage = '/images/products/placeholder-product.png';
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                setRateLimitError(null);

                const productData = await ProductService.getProductBySlug(params.slug);
                setProduct(productData as Product);

                // Handle image selection properly
                const productImages = getProductImages(productData);
                setSelectedImage(productImages[0]);

                if (productData?.sizes?.length > 0) {
                    setSelectedSize(productData.sizes[0].value);
                }

                if (productData?.colors?.length > 0) {
                    setSelectedColor(productData.colors[0].value);
                }

                // Fetch related products from other categories
                try {
                    const related = await ProductService.getRelatedProducts(productData.id);
                    setRelatedProducts(related);
                } catch (err) {
                    console.error('Error fetching related products', err);
                }

            } catch (err) {
                console.error('Error fetching product:', err);

                if (err instanceof NotFoundError) {
                    return notFound();
                } else if (err instanceof RateLimitError) {
                    setRateLimitError(`${err.message}. Please try again in ${Math.ceil(err.retryAfter)} seconds.`);
                    setTimeout(() => setRateLimitError(null), err.retryAfter * 1000);
                } else {
                    setError('Failed to load product details.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.slug]);

    const handleToggleLike = async () => {
        if (!product) return;

        try {
            await toggleLike(product.id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        // Create proper cart item structure matching CartItem interface
        const cartItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.salePrice || product.price,
            description: product.description || '',
            categoryId: product.categoryId,
            image: selectedImage || product.image || placeholderImage,
            images: productImages,
            isLimited: product.isLimited || false,
            sizes: product.sizes || [],
            colors: product.colors || [],
            tags: product.tags || [],
            inventory: product.inventory || [],
            displaySection: product.displaySection || 'NONE',
            createdAt: product.createdAt || new Date(),
            updatedAt: product.updatedAt || new Date(),
            quantity: quantity,
            selectedSize: selectedSize || 'Default',
            selectedColor: selectedColor || 'Default',
        };

        addItem(cartItem);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const incrementQuantity = () => {
        setQuantity(quantity + 1);
    };

    // Get proper image array for display using utility function
    const productImages = product ? getProductImages(product) : [placeholderImage];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <h1 className="text-2xl font-medium text-[#3B2305] mb-4">Something went wrong</h1>
                    <p className="text-[#3B2305] mb-8">{error}</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-white font-outfit">
            {/* Breadcrumb */}
            <div className="w-full border-b border-[#F4EFE8]">
                <div className="max-w-[1200px] mx-auto px-4">
                    <nav className="flex items-center text-xs text-[#3B2305] py-4 gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/category" className="hover:underline">Categories</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href={`/category/${product.category?.slug}`} className="hover:underline">{product.category?.name}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#C97203]">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Main Product Section */}
            <div className="max-w-[1200px] mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-[80px_1fr_400px] gap-8 items-start">
                {/* Thumbnails (desktop) */}
                <div className="hidden md:flex flex-col gap-3 items-center sticky top-24">
                    {productImages.length > 1 && productImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={`w-16 h-20 rounded border-2 ${selectedImage === img ? 'border-[#C97203]' : 'border-gray-200'} overflow-hidden hover:border-[#C97203] transition-colors`}
                        >
                            <Image
                                src={img}
                                alt={`${product.name} view ${idx + 1}`}
                                width={64}
                                height={80}
                                className="object-cover object-center w-full h-full"
                            />
                        </button>
                    ))}
                </div>

                {/* Main Image */}
                <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-[420px] aspect-[4/5] bg-[#F9F5F0] rounded-lg overflow-hidden">
                        <Image
                            src={selectedImage || productImages[0] || placeholderImage}
                            alt={product.name}
                            fill
                            className="object-contain object-center"
                            sizes="(max-width: 768px) 100vw, 420px"
                            priority
                        />
                        {product.salePrice && (
                            <div className="absolute top-4 left-4 bg-[#C97203] text-white text-xs px-2 py-1 rounded">
                                {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                            </div>
                        )}
                    </div>
                    {/* Thumbnails (mobile) */}
                    {productImages.length > 1 && (
                        <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2">
                            {productImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-14 h-16 rounded border-2 ${selectedImage === img ? 'border-[#C97203]' : 'border-gray-200'} overflow-hidden flex-shrink-0 hover:border-[#C97203] transition-colors`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} view ${idx + 1}`}
                                        width={56}
                                        height={64}
                                        className="object-cover object-center w-full h-full"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="w-full max-w-[400px] mx-auto md:mx-0 flex flex-col gap-6">
                    <h1 className="text-xl md:text-2xl font-medium text-[#1E1E1E] leading-tight">{product.name}</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-[#C97203]">₦{product.salePrice ? product.salePrice.toLocaleString() : product.price.toLocaleString()}</span>
                        {product.salePrice && (
                            <span className="text-base text-[#3B2305] line-through opacity-60">₦{product.price.toLocaleString()}</span>
                        )}
                    </div>
                    {/* Colour Selector */}
                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-[#3B2305] mb-1">COLOUR:</label>
                            <div className="flex gap-2 items-center">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color.value)}
                                        aria-label={color.name}
                                        className={`w-6 h-6 rounded-full border ${selectedColor === color.value ? 'border-[#C97203] scale-110' : 'border-gray-300'} transition-transform`}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                                <span className="text-xs ml-2">{product.colors.find(c => c.value === selectedColor)?.name}</span>
                            </div>
                        </div>
                    )}
                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-[#3B2305] mb-2">SIZE:</label>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size.value)}
                                        className={`px-4 py-2 border text-sm font-medium rounded-md transition-all ${selectedSize === size.value
                                            ? 'border-[#C97203] bg-[#C97203] text-white'
                                            : 'border-gray-300 bg-white text-[#3B2305] hover:border-[#C97203] hover:bg-[#FFF7F0]'
                                            }`}
                                    >
                                        {size.value}
                                    </button>
                                ))}
                            </div>
                            {selectedSize && (
                                <p className="mt-1 text-xs text-gray-500">Selected: {selectedSize}</p>
                            )}
                        </div>
                    )}
                    {/* Add to Cart and Wishlist */}
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 h-12 bg-[#008A3A] text-white font-semibold rounded text-sm hover:bg-[#006c2c] transition-colors"
                        >
                            ADD TO BAG
                        </button>
                        <button
                            onClick={() => toggleLike(product.id)}
                            className={`w-12 h-12 flex items-center justify-center border rounded ${likedProducts.includes(product.id) ? 'border-[#C97203] bg-[#FFF7F0]' : 'border-[#D1B99B] bg-white'} transition-all`}
                            aria-label="Add to wishlist"
                        >
                            <Heart
                                className={`w-5 h-5 ${likedProducts.includes(product.id) ? 'fill-[#C97203] stroke-[#C97203]' : 'stroke-[#D1B99B]'}`}
                            />
                        </button>
                    </div>
                    {/* Delivery Info */}
                    <div className="flex items-center gap-2 text-xs text-[#3B2305] border border-[#F4EFE8] rounded p-3 mt-2">
                        <Truck className="w-4 h-4 text-[#C97203]" />
                        Free delivery on qualifying orders. <Link href="#" className="underline ml-1">View our Delivery & Returns Policy</Link>
                    </div>
                    {/* Accordions for details */}
                    <div className="divide-y divide-[#F4EFE8] mt-4">
                        <details className="py-3 group" open>
                            <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-[#1E1E1E] group-open:text-[#C97203]">Product Details <span className="ml-2">+</span></summary>
                            <div className="mt-2 text-xs text-[#3B2305]">{product.description}</div>
                        </details>
                        <details className="py-3 group">
                            <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-[#1E1E1E] group-open:text-[#C97203]">Brand <span className="ml-2">+</span></summary>
                            <div className="mt-2 text-xs text-[#3B2305]">wisestyle</div>
                        </details>
                        <details className="py-3 group">
                            <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-[#1E1E1E] group-open:text-[#C97203]">Size & Fit <span className="ml-2">+</span></summary>
                            <div className="mt-2 text-xs text-[#3B2305]">See size guide for more info.</div>
                        </details>
                        <details className="py-3 group">
                            <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-[#1E1E1E] group-open:text-[#C97203]">Look After Me <span className="ml-2">+</span></summary>
                            <div className="mt-2 text-xs text-[#3B2305]">Machine wash according to instructions on care label.</div>
                        </details>
                        <details className="py-3 group">
                            <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-[#1E1E1E] group-open:text-[#C97203]">About Me <span className="ml-2">+</span></summary>
                            <div className="mt-2 text-xs text-[#3B2305]">Premium quality product designed for style and comfort.</div>
                        </details>
                    </div>
                </div>
            </div>

            {/* Related products section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-[1200px] mx-auto px-4 pt-10 pb-16">
                    <h2 className="text-lg font-semibold text-[#1E1E1E] mb-4">The item can be cool with</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.map((rel) => (
                            <Link href={`/product/${rel.slug}`} key={rel.id} className="group block bg-white rounded overflow-hidden shadow hover:shadow-md transition-shadow">
                                <div className="relative w-full aspect-[3/4] bg-[#F9F5F0]">
                                    <Image src={rel.image || '/images/placeholder-product.png'} alt={rel.name} fill className="object-cover object-center" sizes="(max-width:768px) 50vw, 25vw" />
                                </div>
                                <div className="p-3 flex flex-col gap-1">
                                    <span className="text-sm text-[#3B2305] truncate">{rel.name}</span>
                                    <span className="text-sm font-medium text-[#C97203]">₦{rel.price.toLocaleString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 