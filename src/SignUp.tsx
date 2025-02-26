import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Firebase
import { useAuth } from './context/FirebaseContext';
import { db } from './lib/firebase';
import { doc, setDoc } from "firebase/firestore";





const SignupForm = () => {

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: "",
        weight: "",
        height: "",
        weightGoal: ""
    });
    const [isLoading, setIsLoading] = useState(false);
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
            const docRef = await setDoc(userRef, { fullName: formData.fullName, email: formData.email, dob: formData.dob, weight: formData.weight, height: formData.height, weight_goal: formData.weightGoal });
            console.log("User added successfully!", formData.email);
        } catch (error) {
            console.log(error);
        }
    }

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

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
                alert('Email is Already in Use');
            }
        } catch (error) {
            setError('Failed to create account. Please try again.');
            console.error('Signup failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            // Here you would typically initiate Google OAuth flow
            // await signIn('google');
            console.log('Signing up with Google');
        } catch (error) {
            setError('Google signup failed. Please try again.');
            console.error('Google signup failed:', error);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Choose your preferred signup method
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignup}
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </Button>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                        </span>
                    </div>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleEmailSignup} className="space-y-4">
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{' '}
                    <Button variant="link" className="px-0">
                        Sign in
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default SignupForm;