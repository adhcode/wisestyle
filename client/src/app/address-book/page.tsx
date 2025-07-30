'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Home, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Address {
    id: string;
    type: 'home' | 'work' | 'other';
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
}

export default function AddressBookPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState({
        type: 'home' as 'home' | 'work' | 'other',
        name: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
        phone: '',
        isDefault: false,
    });

    const { user, isLoading } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !user) {
            router.push('/sign-in');
            return;
        }

        if (mounted && user) {
            fetchAddresses();
        }
    }, [user, router, mounted, isLoading]);

    const fetchAddresses = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/api/users/addresses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAddresses(Array.isArray(data) ? data : []);
            } else {
                // If no addresses found, start with empty array
                setAddresses([]);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
            
            const token = localStorage.getItem('token');
            const url = editingAddress 
                ? `${apiUrl}/api/users/addresses/${editingAddress.id}`
                : `${apiUrl}/api/users/addresses`;
            
            const method = editingAddress ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
                setShowAddForm(false);
                setEditingAddress(null);
                setFormData({
                    type: 'home',
                    name: '',
                    address: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'Nigeria',
                    phone: '',
                    isDefault: false,
                });
                fetchAddresses();
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save address');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save address');
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/api/users/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Address deleted successfully!');
                fetchAddresses();
            } else {
                throw new Error('Failed to delete address');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete address');
        }
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            type: address.type,
            name: address.name,
            address: address.address,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone || '',
            isDefault: address.isDefault,
        });
        setShowAddForm(true);
    };

    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home':
                return <Home className="w-5 h-5 text-blue-600" />;
            case 'work':
                return <Building className="w-5 h-5 text-green-600" />;
            default:
                return <MapPin className="w-5 h-5 text-gray-600" />;
        }
    };

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

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
                        <h1 className="text-lg font-semibold text-gray-900">Address Book</h1>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-[#3B2305] hover:text-[#4c2d08]"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto">
                {showAddForm ? (
                    /* Add/Edit Address Form */
                    <div className="bg-white p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                >
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                    placeholder="Enter street address"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                    placeholder="Postal code"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                    placeholder="Phone number"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="w-4 h-4 text-[#C97203] border-gray-300 rounded focus:ring-[#C97203]"
                                />
                                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                                    Set as default address
                                </label>
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-6">
                            <button
                                onClick={handleSaveAddress}
                                className="flex-1 bg-[#3B2305] text-white py-3 px-4 rounded-lg hover:bg-[#4c2d08] transition-colors"
                            >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingAddress(null);
                                    setFormData({
                                        type: 'home',
                                        name: '',
                                        address: '',
                                        city: '',
                                        state: '',
                                        postalCode: '',
                                        country: 'Nigeria',
                                        phone: '',
                                        isDefault: false,
                                    });
                                }}
                                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Address List */
                    <div className="bg-white">
                        {addresses.length === 0 ? (
                            <div className="p-12 text-center">
                                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
                                <p className="text-gray-600 mb-6">Add your first address to make checkout faster</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-[#3B2305] text-white px-6 py-3 rounded-lg hover:bg-[#4c2d08] transition-colors"
                                >
                                    Add Address
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {addresses.map((address) => (
                                    <div key={address.id} className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                {getAddressIcon(address.type)}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 capitalize">
                                                            {address.type}
                                                        </h3>
                                                        {address.isDefault && (
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-gray-900">{address.name}</p>
                                                    <p className="text-gray-600 text-sm mt-1">
                                                        {address.address}
                                                    </p>
                                                    <p className="text-gray-600 text-sm">
                                                        {address.city}, {address.state} {address.postalCode}
                                                    </p>
                                                    {address.phone && (
                                                        <p className="text-gray-600 text-sm">{address.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditAddress(address)}
                                                    className="text-gray-400 hover:text-[#3B2305]"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}