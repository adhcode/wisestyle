"use client"

import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogHeaderProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogTitleProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogDescriptionProps {
    className?: string;
    children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => onOpenChange(false)}
            />
            {/* Content */}
            <div className="relative z-10 w-full max-h-full overflow-auto">
                {children}
            </div>
        </div>
    );
};

const DialogContent: React.FC<DialogContentProps> = ({ className = '', children }) => {
    return (
        <div className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-auto ${className}`}>
            {children}
        </div>
    );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ className = '', children }) => {
    return (
        <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`}>
            {children}
        </div>
    );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ className = '', children }) => {
    return (
        <h2 className={`text-lg font-semibold leading-none tracking-tight text-gray-900 ${className}`}>
            {children}
        </h2>
    );
};

const DialogDescription: React.FC<DialogDescriptionProps> = ({ className = '', children }) => {
    return (
        <p className={`text-sm text-gray-500 ${className}`}>
            {children}
        </p>
    );
};

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
}; 