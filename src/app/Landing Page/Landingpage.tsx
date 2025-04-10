import React, { useState, useRef } from "react";
import HeroSection from "@/components/HeroSection";
import FloatingNav from "@/components/FloatingNav";
import FeaturesSection from "@/components/FeaturesSection";
import ExperienceSection from "@/components/ExperienceSection";
import CTASection from "@/components/CTASection";
import LoginForm from "../LoginForm/page";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/FirebaseContext";

const LandingPage: React.FC = () => {
  const [loginPage, setLoginPage] = useState("");
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({
    home: null,
    features: null,
    pricing: null,
    blog: null,
  });

  const scrollToSection = (sectionId: string) => {
    const section = sectionsRef.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.email) {
      window.location.href = "/UserDashboard";
    }
  }, [user]);

  return (
    <>
      <FloatingNav setLoginPage={setLoginPage} />
      <main className="relative min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#1a1a3e]">
        <div
          ref={(el) => (sectionsRef.current.home = el)}
          id="home"
          className="min-h-screen"
        >
          <HeroSection />
        </div>
        <div
          ref={(el) => (sectionsRef.current.features = el)}
          id="features"
          className="min-h-screen"
        >
          <FeaturesSection />
          <ExperienceSection />
        </div>

        <div
          ref={(el) => (sectionsRef.current.pricing = el)}
          id="pricing"
          className="min-h-screen"
        >
          <CTASection />
        </div>

        {loginPage && <LoginForm></LoginForm>}
        <Footer scrollToSection={scrollToSection} />
      </main>
    </>
  );
};

export default LandingPage;
