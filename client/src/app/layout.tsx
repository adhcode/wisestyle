import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import ConditionalLayout from './ConditionalLayout';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'WiseStyle',
    description: 'Premium African Fashion Store',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={outfit.className}>
                <Providers>
                    <ConditionalLayout>
                        {children}
                    </ConditionalLayout>
                    <Toaster position="bottom-center" />
                </Providers>
            </body>
        </html>
    );
} 