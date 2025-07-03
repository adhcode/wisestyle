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
    RefreshCw
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
        adminEmail: 'admin@wisestyle.com',
        allowRegistrations: true,
        emailVerificationRequired: true,
        maintenanceMode: false,
        enableNotifications: true,
        defaultCurrency: 'USD',
        taxRate: 10,
        shippingFee: 15
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#3B2305]">Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your store configuration and preferences
                    </p>
                </div>
                <Button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-[#3B2305] hover:bg-[#2A1804]"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        <Globe className="w-5 h-5 text-[#3B2305] mr-2" />
                        <h2 className="text-lg font-semibold text-[#3B2305]">General Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Site Name
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Site Description
                            </label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                            />
                        </div>
                    </div>
                </Card>

                {/* User Management */}
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        <User className="w-5 h-5 text-[#3B2305] mr-2" />
                        <h2 className="text-lg font-semibold text-[#3B2305]">User Management</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Allow Registrations</p>
                                <p className="text-sm text-gray-500">Allow new users to register</p>
                            </div>
                            <Switch
                                checked={settings.allowRegistrations}
                                onCheckedChange={(checked) => handleSettingChange('allowRegistrations', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Email Verification</p>
                                <p className="text-sm text-gray-500">Require email verification</p>
                            </div>
                            <Switch
                                checked={settings.emailVerificationRequired}
                                onCheckedChange={(checked) => handleSettingChange('emailVerificationRequired', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Maintenance Mode</p>
                                <p className="text-sm text-gray-500">Put site in maintenance mode</p>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Store Settings */}
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        <SettingsIcon className="w-5 h-5 text-[#3B2305] mr-2" />
                        <h2 className="text-lg font-semibold text-[#3B2305]">Store Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Default Currency
                            </label>
                            <select
                                value={settings.defaultCurrency}
                                onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="NGN">NGN - Nigerian Naira</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tax Rate (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={settings.taxRate}
                                onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Default Shipping Fee ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={settings.shippingFee}
                                onChange={(e) => handleSettingChange('shippingFee', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                            />
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        <Bell className="w-5 h-5 text-[#3B2305] mr-2" />
                        <h2 className="text-lg font-semibold text-[#3B2305]">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Enable Notifications</p>
                                <p className="text-sm text-gray-500">Receive system notifications</p>
                            </div>
                            <Switch
                                checked={settings.enableNotifications}
                                onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <p className="font-medium text-gray-700 mb-2">Email Notifications</p>
                            <div className="space-y-2 text-sm">
                                <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" defaultChecked />
                                    New orders
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" defaultChecked />
                                    New user registrations
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    Low stock alerts
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    Product reviews
                                </label>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
