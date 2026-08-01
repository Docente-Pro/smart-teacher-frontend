import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LandingTutorialSection from "@/components/landing/LandingTutorialSection";
import SessionPreview from "@/components/landing/SessionPreview";
import LandingDesire from "@/components/landing/LandingDesire";
import Pricing from "@/components/landing/Pricing";
import LandingFinalCta from "@/components/landing/LandingFinalCta";
import Footer from "@/components/landing/Footer";
import LandingHeader from "@/components/landing/LandingHeader";
import { useUserStatus } from "@/hooks/useUserStatus";
import LoadingComponent from "@/components/LoadingComponent";
import { smoothScrollToSection } from "@/utils/smoothScroll";
import {
  savePendingLandingPlan,
  type LandingPlanId,
} from "@/utils/landingPlan";

function LandingPage() {
  const { isAuthenticated } = useAuth0();
  const { isPremium, isLoading: statusLoading } = useUserStatus();
  const [loadingPlanId, setLoadingPlanId] = useState<LandingPlanId | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isPremium && !statusLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isPremium, statusLoading, navigate]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#") || hash.length < 2) return;

    const sectionId = hash.slice(1);
    const timer = window.setTimeout(() => {
      smoothScrollToSection(sectionId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleStartFreeClick = (planId: LandingPlanId) => {
    setLoadingPlanId(planId);
    savePendingLandingPlan(planId);
    navigate(`/signup?plan=${encodeURIComponent(planId)}`);
  };

  if (statusLoading) {
    return <LoadingComponent />;
  }

  return (
    <div
      className="dp-canvas-dots min-h-[100dvh] text-[#1F2937]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[14px] focus:bg-white focus:px-4 focus:py-3 focus:text-base focus:font-extrabold focus:text-[#1F2937] focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-[rgba(255,139,92,0.32)]"
      >
        Saltar al contenido
      </a>
      <LandingHeader />
      <div
        id="landing-portada"
        className="relative bg-gradient-to-b from-[#6B9FE8] via-[#5A8FD6] to-[#3B6CB5]"
      >
        <Hero />
      </div>
      <main id="main-content">
        <Features />
        <LandingTutorialSection />
        <SessionPreview />
        <LandingDesire />
        <Pricing
          onStartFreeClick={handleStartFreeClick}
          loadingPlanId={loadingPlanId}
        />
        <LandingFinalCta />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
