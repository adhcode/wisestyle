import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { isAdmin, isLoaded } = useAuthHook();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isAdmin) {
            router.push('/'); // Redirect non-admin users to home
        }
    }, [isLoaded, isAdmin, router]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!isAdmin) {
        return null; // Don't render anything while redirecting
    }

    return <>{children}</>;
} 