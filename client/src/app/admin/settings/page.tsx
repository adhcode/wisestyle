'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Globe,
    Save,
    RefreshCw,
    Store,
    Mail,
    Shield,
    CheckCircle
} from "lucide-react";
import toast from 'react-hot-toast';

interface AdminSettings {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    allowRegistrations: boolean;
    emailVerificationRequired: boolean;
    maintenanceMode: boolean;
    enableNotifications: boolean;
    defaultCurrency: string;
    taxRate: number;
    shippingFee: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<AdminSettings>({
        siteName: 'WiseStyle',
        siteDescription: 'Premium African Fashion Store',
        adminEmail: 'hello@wisestyleshop.com',
        allowRegistrations: true,
        emailVerificationRequired: true,
        maintenanceMode: false,
        enableNotifications: true,
        defaultCurrency: 'NGN',
        taxRate: 10,
        shippingFee: 1500
    });

    const [loading, setLoading] = useState(false);

    const handleSettingChange = (key: keyof AdminSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your store configuration and preferences
                    </p>
                </div>
                <Button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center shadow-sm"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Name
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your site name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Description
                            </label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Describe your store..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="admin@yourstore.com"
                            />
                        </div>
                    </div>
                </Card>

                {/* User Management */}
                <Card className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-green-50 rounded-lg mr-3">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Allow Registrations</p>
                                <p className="text-sm text-gray-600">Allow new users to create accounts</p>
                            </div>
                            <Switch
                                checked={settings.allowRegistrations}
                                onCheckedChange={(checked) => handleSettingChange('allowRegistrations', checked)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Email Verification</p>
                                <p className="text-sm text-gray-600">Require users to verify their email addresses</p>
                            </div>
                            <Switch
                                checked={settings.emailVerificationRequired}
                                onCheckedChange={(checked) => handleSettingChange('emailVerificationRequired', checked)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Maintenance Mode</p>
                                <p className="text-sm text-gray-600">Put the entire site in maintenance mode</p>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Store Settings */}
                <Card className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-purple-50 rounded-lg mr-3">
                            <Store className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Store Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Currency
                            </label>
                            <select
                                value={settings.defaultCurrency}
                                onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="NGN">NGN - Nigerian Naira</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Rate (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={settings.taxRate}
                                onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Shipping Fee (₦)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={settings.shippingFee}
                                onChange={(e) => handleSettingChange('shippingFee', parseFloat(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                            <Bell className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Enable Notifications</p>
                                <p className="text-sm text-gray-600">Receive system notifications via email</p>
                            </div>
                            <Switch
                                checked={settings.enableNotifications}
                                onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="font-medium text-gray-900 mb-4 flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                Email Notification Types
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mr-3 text-blue-600 focus:ring-blue-500" defaultChecked />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">New Orders</div>
                                        <div className="text-xs text-gray-500">When customers place orders</div>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mr-3 text-blue-600 focus:ring-blue-500" defaultChecked />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">User Registrations</div>
                                        <div className="text-xs text-gray-500">When new users sign up</div>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mr-3 text-blue-600 focus:ring-blue-500" />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">Low Stock Alerts</div>
                                        <div className="text-xs text-gray-500">When products run low</div>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mr-3 text-blue-600 focus:ring-blue-500" />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">Product Reviews</div>
                                        <div className="text-xs text-gray-500">When customers leave reviews</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                        <p className="text-sm font-medium text-green-800">All changes are automatically saved</p>
                        <p className="text-xs text-green-600 mt-1">Your settings will be applied immediately after clicking Save Settings</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
