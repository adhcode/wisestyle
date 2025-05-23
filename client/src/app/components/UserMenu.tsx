'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UserMenu() {
    const { user } = useAuthHook();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to sign out');
            }

            // Clear any local storage or state
            localStorage.removeItem('token');
            router.push('/sign-in');
            toast.success('Signed out successfully');
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Failed to sign out');
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-black transition-colors duration-300"
                disabled={loading}
            >
                <span className="sr-only">User menu</span>
                <User className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user?.email}
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Signing out...' : 'Sign out'}
                    </button>
                </div>
            )}
        </div>
    );
} 