import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getImageUrl, handleImageError } from '@/utils/image';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    category?: string;
    aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export function Image({
    src,
    alt,
    category,
    aspectRatio = 'square',
    className,
    ...props
}: ImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    const aspectRatioClasses = {
        square: 'aspect-square',
        portrait: 'aspect-[3/4]',
        landscape: 'aspect-[4/3]'
    };

    return (
        <div className={cn(
            'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
            aspectRatioClasses[aspectRatio],
            className
        )}>
            <img
                src={getImageUrl(src)}
                alt={alt}
                onError={(e) => handleImageError(e, category)}
                onLoad={() => setIsLoading(false)}
                className={cn(
                    'object-cover w-full h-full transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                {...props}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-gray-800 dark:border-gray-700 dark:border-t-gray-200" />
                </div>
            )}
        </div>
    );
} 