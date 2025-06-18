import Image from 'next/image';
import Link from 'next/link';

const categories = [
    {
        name: 'Native Wears',
        image: '/images/category/native-wears.png',
        href: '/category/native-wear',
        bgColor: '#E1D4C3',
    },
    {
        name: 'T-Shirts',
        image: '/images/category/tshirt.png',
        href: '/category/t-shirts',
        bgColor: '#F4EFE8',
    },
    {
        name: 'Shirts',
        image: '/images/category/shirts.png',
        href: '/category/shirts',
        bgColor: '#D1B99B',
    },
    {
        name: 'Jeans/Trousers',
        image: '/images/category/jeans-trouser.png',
        href: '/category/jeans-trousers',
        bgColor: '#F4EFE8',
    },
    {
        name: 'Accessories',
        image: '/images/category/accesories.png',
        href: '/category/accessories',
        bgColor: '#E1D4C3',
    },
];

export default function ShopByCategory() {
    return (
        <section className="py-16 bg-[#FEFBF4]">
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                <h2 className="text-[32px] font-[400] text-[#1E1E1E] mb-8">Shop by Category</h2>
                <div className="flex gap-[16px] overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-5 sm:gap-[16px] sm:overflow-x-visible sm:flex-none w-full">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="group flex-shrink-0 w-[211.2px] sm:w-full rounded-[4px] duration-200 overflow-hidden"
                        >
                            <div className="relative w-full rounded-[4px] h-[300px]" >
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-contain object-center"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                />
                                <div className="absolute bottom-0 bg-[#FEFCF8B2] h-12 left-0 w-full flex items-end justify-center">
                                    <span className="text-[#3B2305] text-[16px] font-medium mb-4">{cat.name}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
} 