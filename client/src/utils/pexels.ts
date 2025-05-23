import { createClient, Photos, ErrorResponse } from 'pexels';

const client = createClient(process.env.NEXT_PUBLIC_PEXELS_API_KEY || 'YOUR_API_KEY');

export const getProductImage = async (query: string) => {
    try {
        const result = await client.photos.search({
            query: `fashion ${query}`,
            per_page: 1,
            orientation: 'square'
        }) as Photos;

        if (result && result.photos && result.photos.length > 0) {
            return result.photos[0].src.large;
        }
        return null;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
};

// Collection of curated fashion photo IDs
export const curatedPhotoIds = {
    jacket: ['2887766', '3768005', '2887762'],
    tshirt: ['4066293', '4066292', '4066291'],
    jeans: ['1082529', '1082528', '1082527'],
    shoes: ['2529148', '2529147', '2529146'],
    accessories: ['1152077', '1152076', '1152075']
}; 