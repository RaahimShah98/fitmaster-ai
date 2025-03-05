"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Firebase
import { useAuth } from '../../context/FirebaseContext';
import { db } from '../../lib/firebase';
import { doc, setDoc } from "firebase/firestore";


const SignupForm = () => {
    const router = useRouter()

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: "",
        weight: "",
        height: "",
        weightGoal: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');

    const { signUp } = useAuth();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    async function addDataToFireStore() {
        try {

            if (!formData.fullName || !formData.email) {
                return "Name and email are required";
            }
            const userRef = doc(db, "user", formData.email); // Set email as document ID
            await setDoc(userRef, {
                fullName: formData.fullName, // "Raahim Shah"
                email: formData.email, // "raahimshah98@gmail.com"
                dob: formData.dob, // "7-Aug-2002"
                weight: formData.weight, // "102"
                height: formData.height, // "102"
                weight_goal: formData.weightGoal, // "Loose"
                Role: "user", // ""
                RegisterDate: new Date().toLocaleDateString(), // "05/03/2025"
                workoutsCompleted: 0, // ""
                subscriptionType: "free", // ""
                status: "Active", // ""
                progress: 0 // ""
            });
            console.log("User added successfully!", formData.email);
            router.push('/');

        } catch (error) {
            console.log(error);
        }
    }

    const checkFirstSection = () => {
        if (formData.fullName === "") {
            setError('Name is required');
            return;
        }

        if (formData.email === "") {
            setError('Email is required');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }


    }

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Here you would typically make an API call to your auth endpoint
            console.log('Signing up with:', formData);
            console.log(formData)
            const check = await signUp(formData.email, formData.password);

            if (check === true) {
                await addDataToFireStore();
            }
            if (check.bool === false) {
                console.log(check)
                setError('Email is Already in Use');
            }
        } catch (error) {
            setError('Failed to create account. Please try again.');
            console.error('Signup failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        // Validate first step fields
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setStep(2);
    };

    const handlePrevStep = () => {
        setStep(1);
    };


    const progressPercentage = step === 1 ? 50 : 100;

    return (
        <div className="flex min-h-screen w-full">
            {/* Login section - always visible */}
            <div className="flex flex-1 items-center justify-center p-4 md:p-8">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                        <CardDescription className="text-center">
                            {step === 1 ? 'Step 1: Account Information' : 'Step 2: Health Information'}
                        </CardDescription>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span className={step >= 1 ? "text-blue-600 font-semibold" : ""}>Account</span>
                            <span className={step >= 2 ? "text-blue-600 font-semibold" : ""}>Health Profile</span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleNextStep} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <Button onClick={checkFirstSection} type="submit" className="w-full">
                                        Proceed
                                    </Button>
                                </form>
                            </>
                        )}

                        {step === 2 && (

                            <form onSubmit={handleEmailSignup} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        name="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (in kg)</Label>
                                    <Input
                                        id="weight"
                                        name="weight"
                                        type="number"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (in cm)</Label>
                                    <Input
                                        id="height"
                                        name="height"
                                        type="number"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weightGoal">Weight Goal</Label>
                                    <Input
                                        id="weightGoal"
                                        name="weightGoal"
                                        type="text"
                                        value={formData.weightGoal}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms" required />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I agree to the{' '}
                                        <Button variant="link" className="p-0 h-auto font-medium">
                                            Terms of Service
                                        </Button>
                                        {' '}and{' '}
                                        <Button variant="link" className="p-0 h-auto font-medium">
                                            Privacy Policy
                                        </Button>
                                    </label>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        className="w-1/2"
                                        variant="outline"
                                        onClick={handlePrevStep}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" className="w-1/2" disabled={isLoading}>
                                        {isLoading ? 'Creating account...' : 'Create account'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-2">
                        <div className="text-sm text-center text-muted-foreground">
                            Already have an account?{' '}
                            <Link href={"LoginForm"} className="px-0 text-black">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* App details section - hidden on mobile */}
            <div className="hidden md:flex flex-1 text-white bg-black bg-cover bg-center"
                style={{ backgroundImage: "url('/LoginForm/loginFormImage.png')" }}
            >
                <div className="flex flex-col items-center justify-center p-8 w-full bg-black bg-opacity-80">
                    <div className="max-w-md">
                        <h2 className="text-6xl font-bold">FitMaster-AI</h2>
                        <p className="text-lg mb-6">
                            Experience the next evolution of fitness with AI-powered guidance and real-time form correction.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Meet Your Goals</span>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>No Trainer Required</span>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Safe and Secure </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;