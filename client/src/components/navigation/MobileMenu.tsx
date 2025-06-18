import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { Category } from '@/types';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export default function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
    const [openCategories, setOpenCategories] = useState<string[]>([]);

    const toggleCategory = (slug: string) => {
        setOpenCategories((prev) =>
            prev.includes(slug)
                ? prev.filter((cat) => cat !== slug)
                : [...prev, slug]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

            {/* Menu panel */}
            <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-500 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="px-2 py-4">
                    <ul className="space-y-1">
                        {categories.map((category) => (
                            <li key={category.id}>
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/category/${category.slug}`}
                                            className="flex-1 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                                            onClick={onClose}
                                        >
                                            {category.name}
                                        </Link>
                                        {category.children && category.children.length > 0 && (
                                            <button
                                                onClick={() => toggleCategory(category.slug)}
                                                className="p-2 text-gray-500 hover:text-gray-600"
                                            >
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform ${openCategories.includes(category.slug) ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* Subcategories */}
                                    {category.children && category.children.length > 0 && (
                                        <div
                                            className={`ml-4 space-y-1 ${openCategories.includes(category.slug) ? 'block' : 'hidden'
                                                }`}
                                        >
                                            {category.children.map((subCategory) => (
                                                <Link
                                                    key={subCategory.id}
                                                    href={`/category/${subCategory.slug}`}
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                                                    onClick={onClose}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                    {subCategory.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
} 