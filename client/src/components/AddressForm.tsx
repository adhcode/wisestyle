import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface AddressFormProps {
    title?: string;
    address: {
        name: string;
        address: string;
        city: string;
        state: string;
        postal: string;
        country: string;
    };
    errors: Record<string, string>;
    onChange: (field: string, value: string) => void;
    onErrorClear: (field: string) => void;
    type: 'shipping' | 'billing';
}

const AddressForm: React.FC<AddressFormProps> = ({
    title,
    address,
    errors,
    onChange,
    onErrorClear,
    type
}) => {
    const prefix = type === 'shipping' ? 'shipping' : 'billing';

    return (
        <div className="space-y-4">
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            <div>
                <label htmlFor={`${prefix}Name`} className="block text-sm text-gray-600 mb-1">
                    Full Name
                </label>
                <Input
                    id={`${prefix}Name`}
                    type="text"
                    value={address.name}
                    onChange={(e) => {
                        onChange('name', e.target.value);
                        onErrorClear(`${prefix}Name`);
                    }}
                    placeholder="Enter your full name"
                />
                {errors[`${prefix}Name`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${prefix}Name`]}</p>
                )}
            </div>

            <div>
                <label htmlFor={`${prefix}Address`} className="block text-sm text-gray-600 mb-1">
                    Address
                </label>
                <Input
                    id={`${prefix}Address`}
                    type="text"
                    value={address.address}
                    onChange={(e) => {
                        onChange('address', e.target.value);
                        onErrorClear(`${prefix}Address`);
                    }}
                    placeholder="Enter your street address"
                />
                {errors[`${prefix}Address`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${prefix}Address`]}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`${prefix}City`} className="block text-sm text-gray-600 mb-1">
                        City
                    </label>
                    <Input
                        id={`${prefix}City`}
                        type="text"
                        value={address.city}
                        onChange={(e) => {
                            onChange('city', e.target.value);
                            onErrorClear(`${prefix}City`);
                        }}
                        placeholder="Enter your city"
                    />
                    {errors[`${prefix}City`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${prefix}City`]}</p>
                    )}
                </div>

                <div>
                    <label htmlFor={`${prefix}State`} className="block text-sm text-gray-600 mb-1">
                        State
                    </label>
                    <Input
                        id={`${prefix}State`}
                        type="text"
                        value={address.state}
                        onChange={(e) => {
                            onChange('state', e.target.value);
                            onErrorClear(`${prefix}State`);
                        }}
                        placeholder="Enter your state"
                    />
                    {errors[`${prefix}State`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${prefix}State`]}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`${prefix}Postal`} className="block text-sm text-gray-600 mb-1">
                        Postal Code
                    </label>
                    <Input
                        id={`${prefix}Postal`}
                        type="text"
                        value={address.postal}
                        onChange={(e) => {
                            onChange('postal', e.target.value);
                            onErrorClear(`${prefix}Postal`);
                        }}
                        placeholder="Enter your postal code"
                    />
                    {errors[`${prefix}Postal`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${prefix}Postal`]}</p>
                    )}
                </div>

                <div>
                    <label htmlFor={`${prefix}Country`} className="block text-sm text-gray-600 mb-1">
                        Country
                    </label>
                    <Select
                        id={`${prefix}Country`}
                        value={address.country}
                        onChange={(e) => {
                            onChange('country', e.target.value);
                            onErrorClear(`${prefix}Country`);
                        }}
                    >
                        <option value="Nigeria">Nigeria</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Kenya">Kenya</option>
                        <option value="South Africa">South Africa</option>
                    </Select>
                    {errors[`${prefix}Country`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${prefix}Country`]}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressForm; 