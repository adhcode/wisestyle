'use client';

import Link from 'next/link';

export default function RegistrationSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Check Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent you a verification link. Please check your email to verify your account.
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Didn't receive the email? Check your spam folder or
                        </p>
                        <Link
                            href="/sign-in"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            return to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 