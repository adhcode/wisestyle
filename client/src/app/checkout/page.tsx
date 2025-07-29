'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { PaymentService } from '@/services/payment.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { CartItem } from '@/types/product';
import { shippingMethods, ShippingMethod } from '@/data/shippingMethods';
import Image from 'next/image';
import { TruckIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import NigerianAddressForm from '@/components/NigerianAddressForm';
import ShippingZoneFinder from '@/components/ShippingZoneFinder';
import { Input } from '@/components/ui/input';
import Script from 'next/script';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Add validation patterns
const validationPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    phone: /^\+?[\d\s-]{10,}$/,
    postal: /^[0-9]{5,6}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCart();
    const [mounted, setMounted] = useState(false);

    // Safely handle auth context
    let user: { firstName?: string; lastName?: string; email?: string; id?: string } | null = null;
    try {
        const authContext = useAuth();
        user = authContext?.user;
    } catch (error) {
        // Auth context not available during SSR/SSG
        console.log('Auth context not available during build');
    }

    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'flutterwave' | 'paystack'>('flutterwave');
    const [flutterwavePaymentType, setFlutterwavePaymentType] = useState<'card' | 'bank_transfer' | 'ng'>('card');
    const [email, setEmail] = useState('');
    const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
    const [shippingAddress, setShippingAddress] = useState({
        name: '', address: '', city: '', state: '', postal: '', country: 'Nigeria', area: '',
    });
    const [billingSame, setBillingSame] = useState(true);
    const [billingAddress, setBillingAddress] = useState({
        name: '', address: '', city: '', state: '', postal: '', country: 'Nigeria', area: '',
    });
    const [contact, setContact] = useState({ email: '', phone: '' });
    const [createAccount, setCreateAccount] = useState(false);
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'details' | 'payment'>('details');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [activeSection, setActiveSection] = useState<'shipping' | 'billing' | 'contact' | null>('shipping');
    const [isShippingOpen, setIsShippingOpen] = useState(false);
    const [paymentState, setPaymentState] = useState<'initial' | 'pin' | 'otp' | 'redirect'>('initial');
    const [pin, setPin] = useState('');
    const [otp, setOtp] = useState('');
    const [paymentResponse, setPaymentResponse] = useState<any>(null);
    const [flwReady, setFlwReady] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && items.length === 0) {
            router.push('/');
        }
    }, [items.length, router, mounted]);

    // Don't render during SSG
    if (!mounted) {
        return <div className="min-h-screen bg-white" />;
    }

    const shippingCost = selectedShipping?.price || 0;
    const grandTotal = totalPrice + shippingCost;

    // Helper function to ensure address has postal code and remove area field
    const ensurePostalCode = (address: any) => {
        const { area, ...addressWithoutArea } = address;
        return {
            ...addressWithoutArea,
            postal: address.postal || '000000'
        };
    };

    // Ensure addresses always have postal codes before sending to server
    const getShippingAddressForOrder = () => {
        if (selectedShipping?.type === 'pickup') {
            return {
                name: contact.email,
                address: selectedShipping.address || '',
                city: 'Lagos',
                state: 'Lagos',
                postal: '100001',
                country: 'Nigeria',
                phone: contact.phone
            };
        } else {
            // Map area (LGA) to city field for server compatibility
            const addressForServer = {
                ...shippingAddress,
                city: shippingAddress.area || shippingAddress.city, // Use LGA as city
                phone: contact.phone
            };
            // Remove area field before sending to server
            const { area, ...cleanAddress } = addressForServer;
            return ensurePostalCode(cleanAddress);
        }
    };

    const getBillingAddressForOrder = () => {
        if (billingSame) {
            const addressForServer = {
                ...shippingAddress,
                city: shippingAddress.area || shippingAddress.city
            };
            const { area, ...cleanAddress } = addressForServer;
            return ensurePostalCode(cleanAddress);
        } else {
            const addressForServer = {
                ...billingAddress,
                city: billingAddress.area || billingAddress.city
            };
            const { area, ...cleanAddress } = addressForServer;
            return ensurePostalCode(cleanAddress);
        }
    };

    const handleAddressChange = (type: 'shipping' | 'billing') => (field: string, value: string) => {
        if (type === 'shipping') {
            setShippingAddress(prev => ({ ...prev, [field]: value }));
        } else {
            setBillingAddress(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleErrorClear = (field: string) => {
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Update validation function
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!selectedShipping) {
            errors.shippingMethod = 'Please select a shipping method';
        }

        // Shipping Address Validation (only for shipping methods, not pickup)
        if (selectedShipping?.type === 'shipping') {
            if (!shippingAddress.name.trim()) {
                errors.shippingName = 'Full name is required';
            } else if (!validationPatterns.name.test(shippingAddress.name)) {
                errors.shippingName = 'Please enter a valid name (2-50 characters, letters only)';
            }

            if (!shippingAddress.address.trim()) {
                errors.shippingAddress = 'Address is required';
            } else if (shippingAddress.address.length < 5) {
                errors.shippingAddress = 'Please enter a complete address';
            }

            if (!shippingAddress.city.trim()) {
                errors.shippingCity = 'City is required';
            }

            if (!shippingAddress.area?.trim()) {
                errors.shippingArea = 'Local Government Area is required';
            }

            if (!shippingAddress.state.trim()) {
                errors.shippingState = 'State is required';
            }

            // Postal code validation removed for Nigerian addresses
        }

        // Contact Information Validation
        if (!contact.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validationPatterns.email.test(contact.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!contact.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!validationPatterns.phone.test(contact.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        // Billing Address Validation (if different from shipping)
        if (!billingSame) {
            if (!billingAddress.name.trim()) {
                errors.billingName = 'Billing name is required';
            } else if (!validationPatterns.name.test(billingAddress.name)) {
                errors.billingName = 'Please enter a valid name (2-50 characters, letters only)';
            }

            if (!billingAddress.address.trim()) {
                errors.billingAddress = 'Billing address is required';
            } else if (billingAddress.address.length < 5) {
                errors.billingAddress = 'Please enter a complete address';
            }

            if (!billingAddress.city.trim()) {
                errors.billingCity = 'Billing city is required';
            }

            if (!billingAddress.area?.trim()) {
                errors.billingArea = 'Billing Local Government Area is required';
            }

            if (!billingAddress.state.trim()) {
                errors.billingState = 'Billing state is required';
            }

            // Postal code validation removed for Nigerian addresses
        }

        if (createAccount && !password) {
            errors.password = 'Password is required';
        } else if (createAccount && password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Update the continue to payment button click handler
    const handleContinueToPayment = () => {
        if (validateForm()) {
            setStep('payment');
        }
    };

    // Update the payment handler
    const handlePayment = async () => {
        try {
            setIsLoading(true);

            if (paymentMethod === 'flutterwave') {
                // Create order first
                const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items: items.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            color: item.selectedColor,
                            size: item.selectedSize
                        })),
                        total: totalPrice,
                        shippingAddress: getShippingAddressForOrder(),
                        billingAddress: getBillingAddressForOrder(),
                        shippingMethod: selectedShipping?.name,
                        shippingCost: selectedShipping?.price || 0,
                        email: contact.email || user?.email,
                        phone: contact.phone
                    }),
                });

                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json();
                    throw new Error(errorData.message || 'Failed to create order');
                }

                const order = await orderResponse.json();

                // Initialize Flutterwave payment
                const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/payments/initialize/flutterwave`;
                console.log('Making payment request to:', fullUrl);
                console.log('Request payload:', {
                    orderId: order.id,
                    amount: totalPrice + (selectedShipping?.price || 0),
                    email: contact.email || user?.email || '',
                    paymentMethod: flutterwavePaymentType,
                });

                const paymentResponse = await fetch(fullUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: order.id,
                        amount: totalPrice + (selectedShipping?.price || 0),
                        email: contact.email || user?.email || '',
                        paymentMethod: flutterwavePaymentType,
                        currency: 'NGN',
                        customer: {
                            name: shippingAddress.name,
                            email: contact.email || user?.email || '',
                            phone_number: contact.phone
                        },
                        customizations: {
                            title: 'WiseStyle',
                            description: 'Payment for your order',
                            logo: 'https://wisestyle.com/logo.png'
                        }
                    }),
                });

                if (!paymentResponse.ok) {
                    const errorData = await paymentResponse.json();
                    throw new Error(errorData.message || 'Failed to initialize payment');
                }

                const paymentData = await paymentResponse.json();
                console.log('Payment initialized successfully:', paymentData);

                // New standard checkout flow returns a hosted payment link
                if (paymentData.link) {
                    // Redirect the user to Flutterwave hosted payment page
                    window.location.href = paymentData.link as string;
                    return;
                }

                // Handle different payment scenarios
                if (paymentData.data?.authorization?.mode === 'pin') {
                    setPaymentState('pin');
                    setPaymentResponse(paymentData);
                    return;
                }

                if (paymentData.data?.authorization?.mode === 'redirect') {
                    setPaymentState('redirect');
                    setPaymentResponse(paymentData);
                    // Redirect to Flutterwave's 3DS page
                    window.location.href = paymentData.data.authorization.redirect;
                    return;
                }

                // If no special handling needed, proceed with verification
                const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/payments/verify/flutterwave/${paymentData.data.flw_ref}`);
                if (!verifyResponse.ok) {
                    throw new Error('Payment verification failed');
                }

                const verifyData = await verifyResponse.json();
                if (verifyData.status === 'success') {
                    toast.success('Payment successful!');
                    clearCart();
                    router.push('/checkout/success');
                } else {
                    toast.error('Payment verification failed');
                }
            } else {
                // Handle Paystack payment
                // 1. Create the order first (same flow as Flutterwave)
                const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items: items.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            color: item.selectedColor,
                            size: item.selectedSize
                        })),
                        total: totalPrice,
                        shippingAddress: getShippingAddressForOrder(),
                        billingAddress: getBillingAddressForOrder(),
                        shippingMethod: selectedShipping?.name,
                        shippingCost: selectedShipping?.price || 0,
                        email: contact.email || user?.email,
                        phone: contact.phone
                    }),
                });

                if (!orderRes.ok) {
                    const errData = await orderRes.json();
                    throw new Error(errData.message || 'Failed to create order');
                }

                const order = await orderRes.json();

                // 2. Initialize Paystack payment via backend
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
                console.log('Initializing Paystack payment with:', {
                    orderId: order.id,
                    amount: totalPrice + (selectedShipping?.price || 0),
                    email: contact.email || user?.email || '',
                    apiUrl
                });

                const initRes = await fetch(`${apiUrl}/api/payments/initialize/paystack`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: order.id,
                        amount: totalPrice + (selectedShipping?.price || 0),
                        email: contact.email || user?.email || '',
                    }),
                });

                console.log('Paystack initialization response status:', initRes.status);

                if (!initRes.ok) {
                    const errData = await initRes.json().catch(() => ({ message: 'Network error' }));
                    console.error('Paystack initialization error:', errData);
                    throw new Error(errData.message || `HTTP ${initRes.status}: Failed to initialize Paystack payment`);
                }

                const initData = await initRes.json();
                console.log('Paystack initialization data:', initData);

                if (initData.status && initData.data?.authorization_url) {
                    console.log('Redirecting to Paystack:', initData.data.authorization_url);
                    // Add a small delay to ensure the payment record is created
                    setTimeout(() => {
                        window.location.href = initData.data.authorization_url as string;
                    }, 500);
                    return;
                }

                throw new Error('Unable to initiate Paystack payment - no authorization URL received');
            }
        } catch (error: unknown) {
            console.error('Payment error:', error);
            if (error instanceof Error) {
                toast.error(error.message || 'Payment failed. Please try again.');
            } else {
                toast.error('Payment failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Add these new handler functions
    const handlePinSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/payments/verify/flutterwave/${paymentResponse.data.flw_ref}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pin,
                    flw_ref: paymentResponse.data.flw_ref,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to verify PIN');
            }

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Payment successful!');
                clearCart();
                router.push('/checkout/success');
            } else {
                setPaymentState('otp');
            }
        } catch (error: unknown) {
            console.error('PIN verification error:', error);
            if (error instanceof Error) {
                toast.error(error.message || 'Failed to verify PIN');
            } else {
                toast.error('Failed to verify PIN');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/payments/verify/flutterwave/${paymentResponse.data.flw_ref}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    otp,
                    flw_ref: paymentResponse.data.flw_ref,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to verify OTP');
            }

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Payment successful!');
                clearCart();
                router.push('/checkout/success');
            } else {
                toast.error('OTP verification failed');
            }
        } catch (error: unknown) {
            console.error('OTP verification error:', error);
            if (error instanceof Error) {
                toast.error(error.message || 'Failed to verify OTP');
            } else {
                toast.error('Failed to verify OTP');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Validation for required fields
    const detailsValid = !!(
        selectedShipping &&
        contact.email &&
        contact.phone &&
        (selectedShipping.type === 'pickup' || 
         (selectedShipping.type === 'shipping' && shippingAddress.name && shippingAddress.address && shippingAddress.city && shippingAddress.area))
    );

    // Update toggle functions
    const toggleSection = (section: 'shipping' | 'billing' | 'contact') => {
        setActiveSection(current => current === section ? null : section);
    };

    const handleShippingSelect = (method: ShippingMethod) => {
        setSelectedShipping(method);
        setIsShippingOpen(false);
    };

    if (items.length === 0) {
        return null;
    }

    // Responsive layout: two columns on desktop, stacked on mobile
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
                {/* Progress Steps */}
                <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
                    <div className="relative">
                        {/* Mobile Progress Indicator */}
                        <div className="sm:hidden mb-8">
                            <div className="flex items-center justify-center space-x-4">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white
                                    ${step === 'details' ? 'border-black text-black' : 'border-gray-300 text-gray-400'}`}
                                >
                                    <TruckIcon className="w-5 h-5 text-[#3B2305]" />
                                </div>
                                <div className="h-0.5 w-8 bg-gray-200"></div>
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white
                                    ${step === 'payment' ? 'border-black text-black' : 'border-gray-300 text-gray-400'}`}
                                >
                                    <CreditCardIcon className="w-5 h-5 text-[#3B2305]" />
                                </div>
                                <div className="h-0.5 w-8 bg-gray-200"></div>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 text-gray-400 bg-white">
                                    <CheckCircleIcon className="w-5 h-5 text-[#3B2305]" />
                                </div>
                            </div>
                            <div className="flex justify-center mt-2">
                                <p className="text-sm font-medium">
                                    {step === 'details' ? 'Shipping & Details' : 'Payment'}
                                </p>
                            </div>
                        </div>

                        {/* Desktop Progress Steps */}
                        <div className="hidden sm:block">
                            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2">
                                <div className="h-0.5 w-full bg-gray-200"></div>
                            </div>
                            <div className="relative flex justify-between">
                                <div className="flex flex-col items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 relative bg-white
                                        ${step === 'details' ? 'border-black text-black' : 'border-gray-300 text-gray-400'}`}
                                    >
                                        <TruckIcon className="w-6 h-6 text-[#3B2305]" />
                                        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                                            ${step === 'details' ? 'text-black' : 'text-gray-500'}`}
                                        >
                                            <p className="text-sm font-medium">Shipping & Details</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 relative bg-white
                                        ${step === 'payment' ? 'border-black text-black' : 'border-gray-300 text-gray-400'}`}
                                    >
                                        <CreditCardIcon className="w-6 h-6 text-[#3B2305]" />
                                        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                                            ${step === 'payment' ? 'text-black' : 'text-gray-500'}`}
                                        >
                                            <p className="text-sm font-medium">Payment</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 text-gray-400 relative bg-white">
                                        <CheckCircleIcon className="w-6 h-6 text-[#3B2305]" />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-gray-500">
                                            <p className="text-sm font-medium">Confirmation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12 px-4 sm:px-6 lg:px-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {step === 'details' ? (
                            <>
                                {/* Shipping Method Card */}
                                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                                        <div>
                                            <h2 className="text-base sm:text-lg lg:text-xl font-medium">Delivery Method</h2>
                                            {selectedShipping && (
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                                    {selectedShipping.type === 'pickup' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium w-fit">
                                                            📍 Store Pickup - FREE
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium w-fit">
                                                            🚚 Home Delivery - ₦{selectedShipping.price.toLocaleString()}
                                                        </span>
                                                    )}
                                                    <p className="text-xs sm:text-sm text-gray-500">
                                                        {selectedShipping.deliveryTime}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setIsShippingOpen(!isShippingOpen)}
                                            className="text-xs sm:text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 w-full sm:w-auto justify-center sm:justify-start"
                                        >
                                            <span className="truncate">
                                                {selectedShipping ? 'Change Method' : 'Choose Delivery'}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${isShippingOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Shipping Options */}
                                    <div
                                        className={`grid transition-all duration-300 ease-in-out ${isShippingOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="space-y-4 pb-1">
                                                {/* Pickup Options */}
                                                <div>
                                                    <h3 className="text-sm sm:text-base font-medium text-[#3B2305] mb-3 flex items-center gap-2">
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>Pickup Locations</span>
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                                            FREE
                                                        </span>
                                                    </h3>
                                                    <div className="space-y-2 sm:space-y-3">
                                                        {shippingMethods.filter(method => method.type === 'pickup').map((method) => (
                                                            <label
                                                                key={method.name}
                                                                className={`flex flex-col sm:flex-row sm:items-start justify-between p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer
                                                                    ${selectedShipping?.name === method.name
                                                                        ? 'border-green-500 bg-green-50 shadow-sm'
                                                                        : 'border-gray-200 hover:border-gray-300 active:border-green-300'}`}
                                                            >
                                                                <div className="flex items-start gap-3 w-full">
                                                                    <input
                                                                        type="radio"
                                                                        name="shippingMethod"
                                                                        checked={selectedShipping?.name === method.name}
                                                                        onChange={() => handleShippingSelect(method)}
                                                                        className="w-4 h-4 text-green-600 focus:ring-1 focus:ring-green-500 focus:border-green-500 mt-1 flex-shrink-0"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                                                <div className="font-medium text-sm sm:text-base text-[#3B2305] truncate">
                                                                                    {method.name.replace('Pickup - ', '')}
                                                                                </div>
                                                                            </div>
                                                                            <div className="font-medium text-sm text-green-600">FREE</div>
                                                                        </div>
                                                                        <div className="text-xs sm:text-sm text-gray-600 mt-1">{method.deliveryTime}</div>
                                                                        {method.address && (
                                                                            <div className="text-xs text-gray-600 mt-2 flex items-start gap-1">
                                                                                <span className="text-green-600 mt-0.5 flex-shrink-0">📍</span>
                                                                                <span className="break-words">{method.address}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Shipping Zone Finder */}
                                                <div className="mb-6">
                                                    <h3 className="text-sm sm:text-base font-medium text-[#3B2305] mb-3 flex items-center gap-2">
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        <span>Find Your Delivery Zone</span>
                                                    </h3>
                                                    <ShippingZoneFinder 
                                                        onZoneSelect={(zone) => handleShippingSelect(zone)}
                                                        className="mb-4"
                                                    />
                                                </div>

                                                {/* Shipping Options */}
                                                <div>
                                                    <h3 className="text-sm sm:text-base font-medium text-[#3B2305] mb-3 flex items-center gap-2">
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                        </svg>
                                                        <span>All Delivery Options</span>
                                                    </h3>
                                                    <div className="space-y-2 sm:space-y-3">
                                                        {shippingMethods.filter(method => method.type === 'shipping').map((method) => (
                                                    <label
                                                        key={method.name}
                                                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer
                                                            ${selectedShipping?.name === method.name
                                                                ? 'border-[#C97203] bg-[#F5F5F5] shadow-sm'
                                                                : 'border-gray-200 hover:border-gray-300 active:border-[#C97203]/50'}`}
                                                    >
                                                        <div className="flex items-start gap-3 w-full">
                                                            <input
                                                                type="radio"
                                                                name="shippingMethod"
                                                                checked={selectedShipping?.name === method.name}
                                                                onChange={() => handleShippingSelect(method)}
                                                                className="w-4 h-4 text-black focus:ring-1 focus:ring-[#C97203] focus:border-[#C97203] mt-1 flex-shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                                    <div className="font-medium text-sm sm:text-base text-[#3B2305] truncate">
                                                                        {method.name}
                                                                    </div>
                                                                    <div className="font-medium text-sm text-[#3B2305] sm:hidden">
                                                                        ₦{method.price.toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs sm:text-sm text-gray-600 mt-1">{method.deliveryTime}</div>
                                                                {method.address && (
                                                                    <div className="text-xs text-gray-600 mt-1 break-words">
                                                                        📍 {method.address}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="font-medium text-sm sm:text-base text-[#3B2305] hidden sm:block">₦{method.price.toLocaleString()}</div>
                                                    </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!selectedShipping && !isShippingOpen && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-600">⚠️</span>
                                                <p className="text-sm text-amber-800 font-medium">
                                                    Please choose between store pickup (FREE) or home delivery to continue
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Address Card - Only show for shipping methods */}
                                {selectedShipping?.type === 'shipping' && (
                                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100">
                                        <h2 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-6 text-[#3B2305]">Shipping Address</h2>
                                        <NigerianAddressForm
                                            address={shippingAddress}
                                            onChange={handleAddressChange('shipping')}
                                            onError={handleErrorClear}
                                            errors={formErrors}
                                        />
                                    </div>
                                )}

                                {/* Pickup Information Card - Only show for pickup methods */}
                                {selectedShipping?.type === 'pickup' && (
                                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100">
                                        <h2 className="text-base sm:text-lg lg:text-xl font-medium mb-4 text-[#3B2305]">Pickup Information</h2>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-green-800 mb-1">Pickup Location</h3>
                                                    <p className="text-sm text-green-700 mb-2">{selectedShipping.address}</p>
                                                    <p className="text-xs text-green-600">
                                                        Your order will be ready for pickup within 2-4 hours. We'll send you a confirmation message when it's ready.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Billing Address Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-medium text-[#3B2305]">Billing Address</h2>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={billingSame}
                                                onChange={() => setBillingSame(b => !b)}
                                                className="w-4 h-4 text-black rounded focus:ring-1 focus:ring-[#C97203] focus:border-[#C97203]"
                                            />
                                            <span className="text-sm text-[#3B2305]">Same as shipping</span>
                                        </label>
                                    </div>

                                    {!billingSame && (
                                        <NigerianAddressForm
                                            address={billingAddress}
                                            onChange={handleAddressChange('billing')}
                                            onError={handleErrorClear}
                                            errors={formErrors}
                                        />
                                    )}
                                </div>

                                {/* Contact & Account Card */}
                                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                                    <h2 className="text-lg sm:text-xl font-medium mb-6">Contact Information</h2>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label htmlFor="email" className="block text-sm text-[#3B2305] mb-1">
                                                    Email Address
                                                </label>
                                                <Input
                                                    id="email"
                                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                                    type="email"
                                                    value={contact.email}
                                                    onChange={e => {
                                                        setContact(c => ({ ...c, email: e.target.value }));
                                                        handleErrorClear('email');
                                                    }}
                                                    placeholder="Enter your email address"
                                                />
                                                {formErrors.email && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="block text-sm text-[#3B2305] mb-1">
                                                    Phone Number
                                                </label>
                                                <Input
                                                    id="phone"
                                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                                    type="tel"
                                                    value={contact.phone}
                                                    onChange={e => {
                                                        setContact(c => ({ ...c, phone: e.target.value }));
                                                        handleErrorClear('phone');
                                                    }}
                                                    placeholder="Enter your phone number"
                                                />
                                                {formErrors.phone && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-base font-medium text-[#1E1E1E]">Want to save time on your next order?</h3>
                                                    <p className="text-sm text-[#3B2305] mt-1">
                                                        Create an account to save your shipping details and order history.
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/auth/signup"
                                                    className="inline-flex font-inter items-center justify-center px-4 py-2  border-[#D1B99B] border-[0.5px] text-[#3B2305] rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium whitespace-nowrap"
                                                >
                                                    Sign Up
                                                    <svg
                                                        className="w-4 h-4 ml-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Continue to Payment button at the bottom of details step */}
                                {step === 'details' && (
                                    <div className="mt-6">
                                        <button
                                            onClick={handleContinueToPayment}
                                            disabled={!detailsValid || isLoading}
                                            className="w-full bg-[#C97203] font-inter text-white py-4 px-6 rounded-lg hover:bg-[#C97203]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </div>
                                            ) : (
                                                'Continue to Payment'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-medium">Payment Method</h2>

                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label
                                            className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                                ${paymentMethod === 'flutterwave'
                                                    ? 'border-black bg-gray-50 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="flutterwave"
                                                checked={paymentMethod === 'flutterwave'}
                                                onChange={() => setPaymentMethod('flutterwave')}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-100">
                                                    <img
                                                        src="/images/payment/flutterwave.svg"
                                                        alt="Flutterwave"
                                                        className="h-8 w-auto"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium">Flutterwave</span>
                                                    <span className="block text-xs text-gray-500 mt-1">Pay with card, bank transfer, or USSD</span>
                                                </div>
                                            </div>
                                            <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                ${paymentMethod === 'flutterwave' ? 'border-black' : 'border-gray-300'}`}
                                            >
                                                {paymentMethod === 'flutterwave' && (
                                                    <div className="w-3 h-3 bg-black rounded-full"></div>
                                                )}
                                            </div>
                                        </label>

                                        <label
                                            className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                                ${paymentMethod === 'paystack'
                                                    ? 'border-black bg-gray-50 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="paystack"
                                                checked={paymentMethod === 'paystack'}
                                                onChange={() => setPaymentMethod('paystack')}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-100">
                                                    <img
                                                        src="/images/payment/paystack.svg"
                                                        alt="Paystack"
                                                        className="h-8 w-auto"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-medium">Paystack</span>
                                                    <span className="block text-xs text-gray-500 mt-1">Pay with card, bank transfer, or USSD</span>

                                                </div>
                                            </div>
                                            <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                ${paymentMethod === 'paystack' ? 'border-black' : 'border-gray-300'}`}
                                            >
                                                {paymentMethod === 'paystack' && (
                                                    <div className="w-3 h-3 bg-black rounded-full"></div>
                                                )}
                                            </div>
                                        </label>
                                    </div>

                                    {paymentMethod === 'paystack' && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-blue-800 mb-1">Payment Processing Information</h4>
                                                    <ul className="text-xs text-blue-700 space-y-1">
                                                        <li>• Card payments are processed instantly</li>
                                                        <li>• You can safely close the payment page after initiating payment</li>
                                                        <li>• We'll send email confirmation once payment is received</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-sm font-medium mb-2">Payment Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span>₦{totalPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {selectedShipping?.type === 'pickup' ? 'Pickup' : 'Delivery'}
                                                </span>
                                                <span className={`${selectedShipping?.price === 0 ? 'text-green-600 font-medium' : ''}`}>
                                                    {selectedShipping ? 
                                                        (selectedShipping.price === 0 ? 'FREE' : `₦${selectedShipping.price.toLocaleString()}`) 
                                                        : '--'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200">
                                                <span>Total</span>
                                                <span>₦{(totalPrice + (selectedShipping?.price || 0)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Your payment information is secure and encrypted</span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>We never store your card details</span>
                                    </div>

                                    {paymentMethod === 'flutterwave' && (
                                        <div className="mt-4 space-y-4">
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Payment Type</label>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            name="flutterwave-payment-type"
                                                            value="card"
                                                            checked={flutterwavePaymentType === 'card'}
                                                            onChange={() => setFlutterwavePaymentType('card')}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-center justify-center flex-col md:flex-row space-x-3">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-100">
                                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-medium">Card</span>
                                                        </div>
                                                    </label>

                                                    <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            name="flutterwave-payment-type"
                                                            value="bank_transfer"
                                                            checked={flutterwavePaymentType === 'bank_transfer'}
                                                            onChange={() => setFlutterwavePaymentType('bank_transfer')}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-center justify-center flex-col md:flex-row space-x-3">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-100">
                                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-medium">Bank Transfer</span>
                                                        </div>
                                                    </label>

                                                    <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            name="flutterwave-payment-type"
                                                            value="ng"
                                                            checked={flutterwavePaymentType === 'ng'}
                                                            onChange={() => setFlutterwavePaymentType('ng')}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-center justify-center flex-col md:flex-row space-x-3">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-100">
                                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-medium">Direct Debit</span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentState === 'pin' && (
                                        <div className="mt-4 p-4 border rounded-lg">
                                            <h3 className="text-lg font-medium mb-4">Enter PIN</h3>
                                            <input
                                                type="password"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value)}
                                                className="w-full p-2 border rounded focus:ring-1 focus:ring-[#C97203] focus:border-[#C97203] transition-colors"
                                                placeholder="Enter your PIN"
                                                maxLength={4}
                                            />
                                            <button
                                                onClick={handlePinSubmit}
                                                disabled={!pin || pin.length !== 4 || isLoading}
                                                className="mt-4 w-full bg-black text-white py-2 px-4 rounded disabled:opacity-50"
                                            >
                                                {isLoading ? 'Verifying...' : 'Submit PIN'}
                                            </button>
                                        </div>
                                    )}

                                    {paymentState === 'otp' && (
                                        <div className="mt-4 p-4 border rounded-lg">
                                            <h3 className="text-lg font-medium mb-4">Enter OTP</h3>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full p-2 border rounded focus:ring-1 focus:ring-[#C97203] focus:border-[#C97203] transition-colors"
                                                placeholder="Enter OTP"
                                                maxLength={6}
                                            />
                                            <button
                                                onClick={handleOtpSubmit}
                                                disabled={!otp || otp.length !== 6 || isLoading}
                                                className="mt-4 w-full bg-black text-white py-2 px-4 rounded disabled:opacity-50"
                                            >
                                                {isLoading ? 'Verifying...' : 'Submit OTP'}
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        className="w-full bg-[#C97203] text-white py-4 px-6 rounded-lg hover:bg-[#C97203]/90 transition-colors font-medium text-sm"
                                        disabled={isLoading}
                                        onClick={handlePayment}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </div>
                                        ) : (
                                            `Pay ₦${(totalPrice + (selectedShipping?.price || 0)).toLocaleString()}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 lg:sticky lg:top-6">
                            <h2 className="text-lg sm:text-xl font-medium mb-6">Order Summary</h2>
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-start space-x-4">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <Image
                                                src={item.image || '/images/placeholder.png'}
                                                alt={item.name}
                                                fill
                                                className="object-cover object-center"
                                                sizes="64px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {item.selectedColor} / {item.selectedSize} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}

                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>₦{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>{selectedShipping ? `₦${selectedShipping.price.toLocaleString()}` : '--'}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        <span>₦{(totalPrice + (selectedShipping?.price || 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Script
                src="https://checkout.flutterwave.com/v3.js"
                strategy="afterInteractive"
                onLoad={() => setFlwReady(true)}
            />
        </div>
    );
} 