import React from 'react';
import HeroSection from '@/components/HeroSection';
import FloatingNav from '@/components/FloatingNav';
import FeaturesSection from '@/components/FeaturesSection';
import ExperienceSection from '@/components/ExperienceSection';
import CTASection from '@/components/CTASection';
const LandingPage: React.FC = () => {
    return (
        <><FloatingNav />
            <main className="relative min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#1a1a3e]">
                <HeroSection />
                <FeaturesSection />

                <ExperienceSection />

                <CTASection />
            </main></>
    );
};

export default LandingPage;