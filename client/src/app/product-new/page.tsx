'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, Minus, Plus, Star, Truck, Clock, Award } from 'lucide-react';

const ProductPage = () => {
    const [product, setProduct] = useState({
        id: 1,
        name: 'Premium Kaftan',
        slug: 'premium-kaftan',
        price: 25000,
        description: 'A premium quality kaftan made from the finest materials. Perfect for special occasions and everyday wear.',
        image: '/images/trending/kaftant.png',
        images: [
            '/images/trending/kaftant.png',
            '/images/trending/blacktshirt.png',
            '/images/trending/watches.png'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Black', 'Blue'],
        isLiked: false
    });

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('White');
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        console.log('Adding to cart:', {
            product,
            selectedSize,
            selectedColor,
            quantity
        });
        // Implementation would be here
    };

    const toggleLike = () => {
        setProduct(prev => ({
            ...prev,
            isLiked: !prev.isLiked
        }));
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="bg-[#F9F5F0] py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2 text-sm text-[#3B2305]">
                        <Link href="/" className="hover:underline">Home</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:underline">Products</Link>
                        <span>/</span>
                        <span className="font-medium">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative w-full aspect-square bg-[#F8F8F8] rounded-lg overflow-hidden">
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <button
                                onClick={toggleLike}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                            >
                                <Heart
                                    className={`w-5 h-5 ${product.isLiked ? 'fill-red-500 stroke-red-500' : 'stroke-gray-600'}`}
                                />
                            </button>
                        </div>

                        {/* Thumbnail Images */}
                        <div className="flex items-center space-x-2 overflow-x-auto py-2">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative h-20 w-20 border-2 rounded-md overflow-hidden flex-shrink-0 ${selectedImage === index ? 'border-[#3B2305]' : 'border-transparent'
                                        }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.name} - Image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col space-y-6">
                        <h1 className="text-3xl font-semibold text-[#3B2305]">{product.name}</h1>

                        <p className="text-2xl font-medium text-[#3B2305]">₦{product.price.toLocaleString()}</p>

                        <div className="border-t border-b border-gray-200 py-4">
                            <p className="text-gray-700">{product.description}</p>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 border rounded-md ${selectedSize === size
                                            ? 'border-[#3B2305] bg-[#F9F5F0] text-[#3B2305]'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-4 py-2 border rounded-md ${selectedColor === color
                                            ? 'border-[#3B2305] bg-[#F9F5F0] text-[#3B2305]'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                            <div className="flex items-center w-32 h-10">
                                <button
                                    onClick={decrementQuantity}
                                    className="flex-1 h-full flex items-center justify-center border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-100"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="flex-1 h-full flex items-center justify-center border-t border-b border-gray-300">
                                    {quantity}
                                </div>
                                <button
                                    onClick={incrementQuantity}
                                    className="flex-1 h-full flex items-center justify-center border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-100"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Bag Button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-[#3B2305] hover:bg-[#4c2d08] text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Add to Bag
                        </button>

                        {/* Product Features */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-700">
                                <Truck className="h-5 w-5 mr-3" />
                                <span>Free shipping on orders over ₦50,000</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                                <Clock className="h-5 w-5 mr-3" />
                                <span>3-5 business days delivery</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                                <Award className="h-5 w-5 mr-3" />
                                <span>Premium quality guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Additional Information */}
                <div className="mt-16 border-t border-gray-200 pt-10">
                    <div className="border-b border-gray-200">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex space-x-8">
                                <button className="pb-4 text-[#3B2305] border-b-2 border-[#3B2305] font-medium">
                                    Product Details
                                </button>
                                <button className="pb-4 text-gray-500 hover:text-gray-700">
                                    Shipping & Returns
                                </button>
                                <button className="pb-4 text-gray-500 hover:text-gray-700">
                                    Customer Reviews
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="py-8 max-w-3xl">
                        <h3 className="text-lg font-medium text-[#3B2305] mb-4">Product Information</h3>
                        <p className="text-gray-700 mb-4">
                            This premium kaftan is crafted with meticulous attention to detail using high-quality fabrics. The design combines traditional elements with modern aesthetics, making it perfect for various occasions.
                        </p>
                        <p className="text-gray-700 mb-4">
                            The comfortable fit and breathable material ensure you stay comfortable throughout the day or evening. Each piece is carefully inspected to meet our high standards of quality.
                        </p>

                        {/* Product Specifications */}
                        <div className="mt-8">
                            <h4 className="text-md font-medium text-[#3B2305] mb-4">Specifications</h4>
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <span className="font-medium w-28">Material:</span>
                                    <span>100% Premium Cotton</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-medium w-28">Care:</span>
                                    <span>Machine wash cold, gentle cycle</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-medium w-28">Available Sizes:</span>
                                    <span>{product.sizes.join(', ')}</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-medium w-28">Available Colors:</span>
                                    <span>{product.colors.join(', ')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;

