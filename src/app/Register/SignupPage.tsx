// types.ts
//Define types for our form data and props

'use client';
interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    contact: string;
    currentWeight: string;
    targetWeight: string;
    height: string;
  }
  
  // pages/signup.tsx
  import { useState, ChangeEvent, FormEvent } from 'react';
  import { ArrowRight, ArrowLeft } from 'lucide-react';
  
  // Initial state for the form
  const initialFormData: FormData = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    contact: '',
    currentWeight: '',
    targetWeight: '',
    height: ''
  };
  
  const SignupPage = () => {
    // State management for form phases and data
    const [phase, setPhase] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
  
    // Handle input changes - updates the form data state
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    // Handle form submission for both phases
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      
      if (phase === 1) {
        // Validate phase 1 before proceeding
        if (validatePhaseOne()) {
          setPhase(2);
        }
      } else {
        // Handle final form submission
        if (validatePhaseTwo()) {
          try {
            // Here you would typically make an API call to your backend
            await submitForm(formData);
            // Handle successful submission
            console.log('Form submitted successfully:', formData);
          } catch (error) {
            console.error('Submission error:', error);
            // Handle submission error
          }
        }
      }
    };
  
    // Validation for phase 1 fields
    const validatePhaseOne = (): boolean => {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return false;
      }
  
      // Password validation
      if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        return false;
      }
  
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return false;
      }
  
      return true;
    };
  
    // Validation for phase 2 fields
    const validatePhaseTwo = (): boolean => {
      if (!formData.name || !formData.contact) {
        alert('Please fill in all required fields');
        return false;
      }
  
      // Validate numeric fields
      if (isNaN(Number(formData.currentWeight)) || 
          isNaN(Number(formData.targetWeight)) || 
          isNaN(Number(formData.height))) {
        alert('Please enter valid numbers for weight and height');
        return false;
      }
  
      return true;
    };
  
    // Mock function for form submission - replace with actual API call
    async function submitForm(data: FormData): Promise<void> {
          // Simulate API call
          return new Promise((resolve) => {
              setTimeout(() => {
                  resolve();
              }, 1000);
          });
      }
  
    // Render input field with consistent styling
    const renderInput = (
      label: string,
      name: keyof FormData,
      type: string = 'text',
      required: boolean = true
    ) => (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    );
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          {/* Form Header */}
          <h2 className="text-2xl font-bold text-center mb-6">
            {phase === 1 ? 'Create Account' : 'Complete Your Profile'}
          </h2>
  
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {phase === 1 ? (
              // Phase 1: Basic Signup Fields
              <>
                {renderInput('Email', 'email', 'email')}
                {renderInput('Password', 'password', 'password')}
                {renderInput('Confirm Password', 'confirmPassword', 'password')}
              </>
            ) : (
              // Phase 2: Profile Information Fields
              <>
                {renderInput('Full Name', 'name')}
                {renderInput('Contact Number', 'contact', 'tel')}
                <div className="grid grid-cols-2 gap-4">
                  {renderInput('Current Weight (kg)', 'currentWeight', 'number')}
                  {renderInput('Target Weight (kg)', 'targetWeight', 'number')}
                </div>
                {renderInput('Height (cm)', 'height', 'number')}
              </>
            )}
  
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {phase === 2 && (
                <button
                  type="button"
                  onClick={() => setPhase(1)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex items-center ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {phase === 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Complete Signup'
                )}
              </button>
            </div>
          </form>
  
          {/* Sign In Link */}
          {phase === 1 && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default SignupPage;