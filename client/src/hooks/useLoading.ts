import { useState } from 'react';

export function useLoading() {
    const [loading, setLoading] = useState(false);

    const withLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
        try {
            setLoading(true);
            const result = await fn();
            return result;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        setLoading,
        withLoading
    };
} 