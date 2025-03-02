import React, { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import FloatingNav from '@/components/FloatingNav';
import FeaturesSection from '@/components/FeaturesSection';
import ExperienceSection from '@/components/ExperienceSection';
import CTASection from '@/components/CTASection';
import LoginForm from '../LoginForm/page';

const LandingPage: React.FC = () => {
    const [loginPage , setLoginPage] = useState("")
    console.log(loginPage)

    return (
        <><FloatingNav setLoginPage ={setLoginPage}/>
            <main className="relative min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#1a1a3e]">
                <HeroSection />
                <FeaturesSection />

                <ExperienceSection />

                <CTASection />
                {loginPage && <LoginForm></LoginForm>}
            </main></>
    );
};

export default LandingPage;