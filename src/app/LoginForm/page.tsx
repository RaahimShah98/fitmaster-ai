"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Firebase
import { useAuth } from '../../context/FirebaseContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invalid , setInvalid] = useState(false)
  const [error , setError] = useState("")
  const { signIn , signInWithGoogle } = useAuth();

  const router = useRouter();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authenticate = await signIn(email, password)
      console.log("AUTHENTICATION : " , authenticate)
      if(authenticate === "auth/invalid-credential"){
        console.log("Invalid Credentials")
        setInvalid(true)
        setError("Invalid Credentials")
        console.log(invalid)
      }
      else if(authenticate === "auth/user-disabled"){
        console.log("User Account Disabled")
        setInvalid(true)
        setError("User Account Disabled")
        console.log(invalid)
      }else{
        setInvalid(false)
        router.push('/')
      }

    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    try {
      // Here you would typically initiate Google OAuth flow
      await signInWithGoogle()
      console.log('Logging in with Google');
      router.push('/')
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
    {/* Login section - always visible */}
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
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
              Continue with Google
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          {invalid && <span className='w-full flex justify-center bg-red-100 br-10 p-2'>{error}</span>}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${invalid && email.length==0 ? "bg-red-200":"bg-white"} text-black`}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="px-0 font-normal" onClick={() => router.replace('/PasswordResetRequest')}>
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder='*********'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${invalid && email.length==0 ? "bg-red-200":"bg-white"} text-black`}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link href= {"SignUp"} className="px-0 text-black">
              Sign up
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

export default LoginForm;