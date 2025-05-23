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