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
import AddressForm from '@/components/AddressForm';
import { Input } from '@/components/ui/input';

// Force dynamic rendering for this page
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'flutterwave' | 'paystack'>('flutterwave');
    const [flutterwavePaymentType, setFlutterwavePaymentType] = useState<'card' | 'bank_transfer' | 'ng'>('card');
    const [email, setEmail] = useState('');
    const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
    const [shippingAddress, setShippingAddress] = useState({
        name: '', address: '', city: '', state: '', postal: '', country: 'Nigeria',
    });
    const [billingSame, setBillingSame] = useState(true);
    const [billingAddress, setBillingAddress] = useState({
        name: '', address: '', city: '', state: '', postal: '', country: 'Nigeria',
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

    // Load Flutterwave script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const shippingCost = selectedShipping?.price || 0;
    const grandTotal = totalPrice + shippingCost;

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

        // Shipping Address Validation
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

        if (!shippingAddress.state.trim()) {
            errors.shippingState = 'State is required';
        }

        if (!shippingAddress.postal.trim()) {
            errors.shippingPostal = 'Postal code is required';
        } else if (!validationPatterns.postal.test(shippingAddress.postal)) {
            errors.shippingPostal = 'Please enter a valid postal code';
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

            if (!billingAddress.state.trim()) {
                errors.billingState = 'Billing state is required';
            }

            if (!billingAddress.postal.trim()) {
                errors.billingPostal = 'Billing postal code is required';
            } else if (!validationPatterns.postal.test(billingAddress.postal)) {
                errors.billingPostal = 'Please enter a valid postal code';
            }
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
                        shippingAddress: {
                            ...shippingAddress,
                            phone: contact.phone
                        },
                        billingAddress: billingSame ? shippingAddress : billingAddress,
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
                toast.error('Paystack payment not implemented yet');
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
        shippingAddress.name &&
        shippingAddress.address &&
        contact.email &&
        contact.phone
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

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 'details' ? (
                            <>
                                {/* Shipping Method Card */}
                                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-medium">Shipping Method</h2>
                                            {selectedShipping && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {selectedShipping.name} - ₦{selectedShipping.price.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setIsShippingOpen(!isShippingOpen)}
                                            className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                                        >
                                            {selectedShipping ? 'Change' : 'Select'}
                                            <svg
                                                className={`w-4 h-4 transition-transform duration-300 ${isShippingOpen ? 'rotate-180' : ''}`}
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
                                            <div className="space-y-3 pb-1">
                                                {shippingMethods.map((method) => (
                                                    <label
                                                        key={method.name}
                                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer
                                                            ${selectedShipping?.name === method.name
                                                                ? 'border-[#C97203] bg-[#F5F5F5] shadow-sm'
                                                                : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <input
                                                                type="radio"
                                                                name="shippingMethod"
                                                                checked={selectedShipping?.name === method.name}
                                                                onChange={() => handleShippingSelect(method)}
                                                                className="w-4 h-4 text-black focus:ring-1 focus:ring-[#C97203] focus:border-[#C97203]"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-sm sm:text-base text-[#3B2305]">{method.name}</div>
                                                                <div className="text-xs sm:text-sm text-[#3B2305]">{method.deliveryTime}</div>
                                                            </div>
                                                        </div>
                                                        <div className="font-medium text-sm sm:text-base text-[#3B2305]">₦{method.price.toLocaleString()}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {!selectedShipping && !isShippingOpen && (
                                        <p className="text-sm text-[#3B2305]">Please select a shipping method to continue</p>
                                    )}
                                </div>

                                {/* Shipping Address Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h2 className="text-xl font-medium mb-6 text-[#3B2305]">Shipping Address</h2>
                                    <AddressForm
                                        title=""
                                        address={shippingAddress}
                                        errors={formErrors}
                                        onChange={handleAddressChange('shipping')}
                                        onErrorClear={handleErrorClear}
                                        type="shipping"
                                    />
                                </div>

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
                                        <AddressForm
                                            title=""
                                            address={billingAddress}
                                            errors={formErrors}
                                            onChange={handleAddressChange('billing')}
                                            onErrorClear={handleErrorClear}
                                            type="billing"
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
                                    <div className="flex items-center space-x-3">
                                        <img src="/images/ssl-badge.png" alt="SSL Secure" className="h-8" />
                                        <img src="/images/pci-badge.png" alt="PCI Compliant" className="h-8" />
                                        <img src="/images/visa-badge.png" alt="Visa" className="h-8" />
                                        <img src="/images/mastercard-badge.png" alt="Mastercard" className="h-8" />
                                    </div>
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
                                                        src="/images/flutterwave-logo.png"
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
                                                        src="/images/paystack-logo.png"
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

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-sm font-medium mb-2">Payment Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span>₦{totalPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Shipping</span>
                                                <span>{selectedShipping ? `₦${selectedShipping.price.toLocaleString()}` : '--'}</span>
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
                                                        <div className="flex items-center space-x-3">
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
                                                        <div className="flex items-center space-x-3">
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
                                                        <div className="flex items-center space-x-3">
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
                                        className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
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
        </div>
    );
} 