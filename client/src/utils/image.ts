export const getImageUrl = (path: string): string => {
    // If the path is already a full URL, return it
    if (path.startsWith('http')) {
        return path;
    }

    // For local images, prepend the public path
    return `/images${path.startsWith('/') ? path : `/${path}`}`;
};

export const getFallbackImage = (category: string): string => {
    const fallbacks: Record<string, string> = {
        jackets: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        tshirts: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
        default: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80'
    };

    return fallbacks[category] || fallbacks.default;
};

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, category?: string): void => {
    const img = event.currentTarget;
    img.src = getFallbackImage(category || 'default');
    img.onerror = null; // Prevent infinite loop if fallback also fails
};

/**
 * Utility functions for handling product images
 */

export function getProductImageUrl(product: any): string {
    // First try the main image field
    if (product.image && typeof product.image === 'string') {
        return product.image;
    }

    // Then try the images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];
        
        // Handle string array
        if (typeof firstImage === 'string') {
            return firstImage;
        }
        
        // Handle object array with url property
        if (typeof firstImage === 'object' && firstImage?.url) {
            return firstImage.url;
        }
    }

    // Fallback to placeholder
    return '/images/placeholder.png';
}

export function getProductImages(product: any): string[] {
    const images: string[] = [];

    // Add main image if it exists
    if (product.image && typeof product.image === 'string') {
        images.push(product.image);
    }

    // Add images from array
    if (product.images && Array.isArray(product.images)) {
        for (const img of product.images) {
            if (typeof img === 'string') {
                if (!images.includes(img)) {
                    images.push(img);
                }
            } else if (typeof img === 'object' && img?.url) {
                if (!images.includes(img.url)) {
                    images.push(img.url);
                }
            }
        }
    }

    // Return array or fallback
    return images.length > 0 ? images : ['/images/placeholder.png'];
} 