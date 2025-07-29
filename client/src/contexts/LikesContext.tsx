'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';

interface LikesState {
    likedProducts: string[];
    initialized: boolean;
}

type LikesAction =
    | { type: 'INIT_LIKES'; payload: string[] }
    | { type: 'ADD_LIKE'; payload: string }
    | { type: 'REMOVE_LIKE'; payload: string };

const initialState: LikesState = {
    likedProducts: [],
    initialized: false,
};

const LikesContext = createContext<{
    state: LikesState;
    toggleLike: (productId: string) => Promise<void>;
    isLiked: (productId: string) => boolean;
}>({
    state: initialState,
    toggleLike: async () => { },
    isLiked: () => false,
});

const likesReducer = (state: LikesState, action: LikesAction): LikesState => {
    switch (action.type) {
        case 'INIT_LIKES':
            return { ...state, likedProducts: action.payload, initialized: true };
        case 'ADD_LIKE':
            if (state.likedProducts.includes(action.payload)) {
                return state;
            }
            return { ...state, likedProducts: [...state.likedProducts, action.payload] };
        case 'REMOVE_LIKE':
            return {
                ...state,
                likedProducts: state.likedProducts.filter((id) => id !== action.payload),
            };
        default:
            return state;
    }
};

export const LikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(likesReducer, initialState);

    useEffect(() => {
        const initializeLikes = async () => {
            try {
                // Try to get liked products from localStorage first (guest user)
                const storedLikes = localStorage.getItem('wisestyle_likedProducts');
                if (storedLikes) {
                    const parsed = JSON.parse(storedLikes);
                    // Ensure all IDs are strings
                    const stringIds = Array.isArray(parsed) ? parsed.map(id => String(id)) : [];
                    dispatch({ type: 'INIT_LIKES', payload: stringIds });
                } else {
                    // Default to empty array if nothing found
                    dispatch({ type: 'INIT_LIKES', payload: [] });
                }

                // If user is logged in, fetch their likes from the API
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userLikes = await apiClient.get<{ products: string[] }>('/api/users/likes', true, undefined, 'User likes');
                        if (userLikes?.products) {
                            // Ensure all IDs are strings
                            const stringIds = userLikes.products.map(id => String(id));
                            dispatch({ type: 'INIT_LIKES', payload: stringIds });
                        }
                    } catch (error) {
                        // If the API call fails, we'll keep using the localStorage likes
                        console.error('Failed to fetch user likes:', error);
                    }
                }
            } catch (error) {
                console.error('Error initializing likes:', error);
                // Fallback to empty array if there's a problem
                dispatch({ type: 'INIT_LIKES', payload: [] });
            }
        };

        initializeLikes();
    }, []);

    // Sync with localStorage whenever state changes
    useEffect(() => {
        if (state.initialized) {
            localStorage.setItem('wisestyle_likedProducts', JSON.stringify(state.likedProducts));
        }
    }, [state.likedProducts, state.initialized]);

    const toggleLike = async (productId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        const isCurrentlyLiked = state.likedProducts.includes(productId);

        try {
            if (isCurrentlyLiked) {
                dispatch({ type: 'REMOVE_LIKE', payload: productId });

                // Only attempt API call if user is logged in
                if (token) {
                    await apiClient.delete(`/api/users/likes/${productId}`, true, 'User like');
                }
            } else {
                dispatch({ type: 'ADD_LIKE', payload: productId });

                // Only attempt API call if user is logged in
                if (token) {
                    await apiClient.post('/api/users/likes', { productId }, true, undefined, 'User like');
                }
            }
        } catch (error) {
            // Revert the optimistic update if the API call fails
            if (isCurrentlyLiked) {
                dispatch({ type: 'ADD_LIKE', payload: productId });
            } else {
                dispatch({ type: 'REMOVE_LIKE', payload: productId });
            }
            // Re-throw the error so it can be handled by the component
            throw error;
        }
    };

    const isLiked = (productId: string): boolean => {
        return state.likedProducts.includes(productId);
    };

    return (
        <LikesContext.Provider value={{ state, toggleLike, isLiked }}>
            {children}
        </LikesContext.Provider>
    );
};

export const useLikes = () => useContext(LikesContext); 