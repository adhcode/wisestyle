import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isSignedIn, isLoaded } = useAuthHook();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in'); // Redirect unauthenticated users to sign in
        }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!isSignedIn) {
        return null; // Don't render anything while redirecting
    }

    return <>{children}</>;
} 