'use client';

import { useState, useRef, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    disabled?: boolean;
}

export default function NumberInput({
    value,
    onChange,
    placeholder = "0",
    min = 0,
    max,
    step = 1,
    className = "",
    disabled = false
}: NumberInputProps) {
    const [displayValue, setDisplayValue] = useState(value === 0 ? '' : value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDisplayValue(value === 0 ? '' : value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input
        if (inputValue === '') {
            setDisplayValue('');
            onChange(0);
            return;
        }

        // Only allow numbers and decimal points
        const numericValue = inputValue.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = numericValue.split('.');
        if (parts.length > 2) return;

        setDisplayValue(numericValue);

        const numValue = parseFloat(numericValue);
        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    };

    const handleIncrement = () => {
        const newValue = value + step;
        if (max === undefined || newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = value - step;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    const handleBlur = () => {
        // Ensure the value is within bounds when input loses focus
        if (value < min) {
            onChange(min);
        } else if (max !== undefined && value > max) {
            onChange(max);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            handleIncrement();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleDecrement();
        }
    };

    return (
        <div className={`flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#3B2305] focus-within:border-transparent ${className}`}>
            <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed border-r border-gray-300"
            >
                <Minus className="w-4 h-4" />
            </button>

            <input
                ref={inputRef}
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-center border-0 focus:outline-none focus:ring-0 bg-transparent"
            />

            <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || (max !== undefined && value >= max)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed border-l border-gray-300"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
} 