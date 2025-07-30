'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, CreditCard, Check, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const giftCardAmounts = [5000, 10000, 25000, 50000, 100000];

export default function GiftCardsPage() {
    const [activeTab, setActiveTab] = useState<'buy' | 'redeem' | 'balance'>('buy');
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [message, setMessage] = useState('');
    const [giftCardCode, setGiftCardCode] = useState('');
    const [checkBalanceCode, setCheckBalanceCode] = useState('');
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handleBuyGiftCard = async () => {
        const amount = selectedAmount || parseInt(customAmount);
        
        if (!amount || amount < 1000) {
            toast.error('Minimum gift card amount is ₦1,000');
            return;
        }

        if (!recipientEmail || !recipientName) {
            toast.error('Please fill in recipient details');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('Gift card purchased successfully!');
            
            // Reset form
            setSelectedAmount(null);
            setCustomAmount('');
            setRecipientEmail('');
            setRecipientName('');
            setMessage('');
        } catch (error) {
            toast.error('Failed to purchase gift card');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemGiftCard = async () => {
        if (!giftCardCode.trim()) {
            toast.error('Please enter a gift card code');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Gift card redeemed successfully!');
            setGiftCardCode('');
        } catch (error) {
            toast.error('Invalid gift card code');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckBalance = async () => {
        if (!checkBalanceCode.trim()) {
            toast.error('Please enter a gift card code');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setBalance(Math.floor(Math.random() * 50000) + 5000); // Random balance for demo
        } catch (error) {
            toast.error('Invalid gift card code');
            setBalance(null);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/profile" className="flex items-center text-gray-600">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span>Back</span>
                        </Link>
                        <h1 className="text-lg font-semibold text-gray-900">Gift Cards</h1>
                        <div className="w-16"></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('buy')}
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                                activeTab === 'buy'
                                    ? 'border-[#3B2305] text-[#3B2305]'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            Buy
                        </button>
                        <button
                            onClick={() => setActiveTab('redeem')}
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                                activeTab === 'redeem'
                                    ? 'border-[#3B2305] text-[#3B2305]'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            Redeem
                        </button>
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                                activeTab === 'balance'
                                    ? 'border-[#3B2305] text-[#3B2305]'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            Balance
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto">
                {activeTab === 'buy' && (
                    <div className="bg-white p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#C97203] to-[#E5A84A] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Gift className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Buy Gift Card</h2>
                            <p className="text-gray-600">Give the gift of style to someone special</p>
                        </div>

                        <div className="space-y-6">
                            {/* Amount Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {giftCardAmounts.map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => {
                                                setSelectedAmount(amount);
                                                setCustomAmount('');
                                            }}
                                            className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                                                selectedAmount === amount
                                                    ? 'border-[#3B2305] bg-[#F9F5F0] text-[#3B2305]'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            ₦{amount.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Or enter custom amount</label>
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => {
                                            setCustomAmount(e.target.value);
                                            setSelectedAmount(null);
                                        }}
                                        placeholder="Enter amount (min ₦1,000)"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Recipient Details */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                                <input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    placeholder="Enter recipient's name"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                                <input
                                    type="email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="Enter recipient's email"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Add a personal message..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleBuyGiftCard}
                                disabled={loading}
                                className="w-full bg-[#3B2305] text-white py-3 px-4 rounded-lg hover:bg-[#4c2d08] transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : `Buy Gift Card - ₦${(selectedAmount || parseInt(customAmount) || 0).toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'redeem' && (
                    <div className="bg-white p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Redeem Gift Card</h2>
                            <p className="text-gray-600">Enter your gift card code to add credit to your account</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gift Card Code</label>
                                <input
                                    type="text"
                                    value={giftCardCode}
                                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                                    placeholder="Enter gift card code"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent font-mono text-center tracking-wider"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Gift card codes are usually 16 characters long (e.g., WISE-1234-5678-9012)
                                </p>
                            </div>

                            <button
                                onClick={handleRedeemGiftCard}
                                disabled={loading || !giftCardCode.trim()}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Redeeming...' : 'Redeem Gift Card'}
                            </button>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-medium text-blue-900 mb-2">How to redeem:</h3>
                                <ol className="text-sm text-blue-800 space-y-1">
                                    <li>1. Enter your gift card code above</li>
                                    <li>2. Click "Redeem Gift Card"</li>
                                    <li>3. The credit will be added to your account</li>
                                    <li>4. Use it during checkout on your next purchase</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'balance' && (
                    <div className="bg-white p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Balance</h2>
                            <p className="text-gray-600">Check the remaining balance on your gift card</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gift Card Code</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={checkBalanceCode}
                                        onChange={(e) => setCheckBalanceCode(e.target.value.toUpperCase())}
                                        placeholder="Enter gift card code"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent font-mono text-center tracking-wider"
                                    />
                                    <button
                                        onClick={handleCheckBalance}
                                        disabled={loading || !checkBalanceCode.trim()}
                                        className="px-6 py-3 bg-[#3B2305] text-white rounded-lg hover:bg-[#4c2d08] transition-colors disabled:opacity-50"
                                    >
                                        {loading ? '...' : 'Check'}
                                    </button>
                                </div>
                            </div>

                            {balance !== null && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-green-900">Gift Card Balance</h3>
                                            <p className="text-2xl font-bold text-green-600">₦{balance.toLocaleString()}</p>
                                        </div>
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-sm text-green-700">Code: {checkBalanceCode}</span>
                                        <button
                                            onClick={() => copyToClipboard(checkBalanceCode)}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Gift Card Tips:</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Gift cards never expire</li>
                                    <li>• Can be used for multiple purchases</li>
                                    <li>• Remaining balance stays on the card</li>
                                    <li>• Cannot be exchanged for cash</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}