"use client"
// pages/reset-password.tsx
import { useState } from 'react';
import Head from 'next/head';
import { useSearchParams } from "next/navigation";

import { useAuth } from '@/context/FirebaseContext';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { handleReset } = useAuth();

    const searchParams = useSearchParams();

    const oobCode = searchParams.get("oobCode");

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        // Basic validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            if (!oobCode) throw new Error("Invalid link");

            const response = await handleReset(oobCode, password);
            console.log("RESPONSE: ", response)
            setSuccessMessage("Password has been reset successfully!");
        } catch (error: any) {
            setError(error.message);
            console.log("ERROR: ", error.message)
        }
    };

    return (
        <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center relative"
            style={{ backgroundImage: "url('/LoginForm/loginFormImage.png')" }}>
            <Head>
                <title>Reset Password</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Content container */}
            <div className="z-10 bg-white bg-opacity-95 rounded-xl shadow-xl p-8 w-11/12 max-w-md mx-4">
                <div className="flex flex-col items-center">
                    {/* Logo */}
                    <div className="w-16 h-16 mb-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h1>

                    {error && (
                        <div className="w-full bg-red-100 border rounded-xl border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div>
                            <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {successMessage}
                            </div>
                            {/* <p>Redirecting to Login Page in :{counter}</p> */}
                        </div>
                    )}

                    {!successMessage && <form className="w-full" onSubmit={handlePasswordReset}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="--------"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="--------"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Reset Password'}
                        </button>
                    </form>
                    }

                </div>
            </div>
        </div>
    );
}