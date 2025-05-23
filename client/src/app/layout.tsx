'use client';

import { Lato, DM_Sans, Montserrat } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Providers from './providers'
import { Toaster } from 'react-hot-toast'
import { usePathname } from 'next/navigation'
import { Inter } from 'next/font/google'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'

const lato = Lato({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-lato',
    weight: ['300', '400', '700'],
})

const dmSans = DM_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-dm-sans',
    weight: ['400', '500'],
})

const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
    weight: ['400', '500', '600', '700'],
})

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    return (
        <html lang="en" className={`${lato.variable} ${dmSans.variable} ${montserrat.variable} ${inter.className}`}>
            <body className="font-lato antialiased">
                <AuthProvider>
                    <CartProvider>
                        <Providers>
                            {!isAdminRoute && <Header />}
                            <main>
                                {children}
                            </main>
                            {!isAdminRoute && <Footer />}
                            <Toaster position="top-right" />
                        </Providers>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    )
} 