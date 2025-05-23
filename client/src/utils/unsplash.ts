import { createApi } from 'unsplash-js';

const unsplash = createApi({
    accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'YOUR_ACCESS_KEY'
});

export const getProductImage = async (query: string) => {
    try {
        const result = await unsplash.search.getPhotos({
            query: `fashion ${query}`,
            page: 1,
            perPage: 1,
            orientation: 'squarish'
        });

        if (result.response) {
            return result.response.results[0].urls.regular;
        }
        return null;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
};

// Pre-defined queries for different product types
export const productQueries = {
    jacket: 'winter jacket fashion',
    tshirt: 'minimal t-shirt',
    jeans: 'denim jeans',
    shoes: 'sneakers minimal',
    accessories: 'fashion accessories minimal'
}; 