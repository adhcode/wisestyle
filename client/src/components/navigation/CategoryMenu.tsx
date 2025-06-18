import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryMenuProps {
    categories: Category[];
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    const handleCategoryClick = (slug: string) => {
        setOpenCategory(openCategory === slug ? null : slug);
    };

    return (
        <nav className="hidden lg:block">
            <ul className="flex items-center gap-8">
                {categories.map((category) => (
                    <li key={category.id} className="relative group">
                        <div
                            className="flex items-center gap-1 cursor-pointer py-2"
                            onClick={() => handleCategoryClick(category.slug)}
                        >
                            <Link
                                href={`/category/${category.slug}`}
                                className="text-gray-700 hover:text-primary transition-colors"
                            >
                                {category.name}
                            </Link>
                            {category.children && category.children.length > 0 && (
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${openCategory === category.slug ? 'rotate-180' : ''
                                        }`}
                                />
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        {category.children && category.children.length > 0 && (
                            <div
                                className={`absolute left-0 top-full bg-white shadow-lg rounded-lg py-3 min-w-[200px] transition-all transform origin-top ${openCategory === category.slug
                                    ? 'opacity-100 visible scale-100'
                                    : 'opacity-0 invisible scale-95'
                                    }`}
                            >
                                <ul className="space-y-1">
                                    {category.children.map((subCategory) => (
                                        <li key={subCategory.id}>
                                            <Link
                                                href={`/category/${subCategory.slug}`}
                                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                                {subCategory.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
} 