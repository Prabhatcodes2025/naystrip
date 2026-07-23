import Seo from "../components/shared/Seo";
import Hero from "../components/home/Hero";
import { FeaturedDestinations, PopularPackages } from "../components/home/DestinationsAndPackages";
import { ServicesSection, HolidayCategoriesSection } from "../components/home/ServicesAndCategories";
import { FixedDeparturesSection, TreksExpeditionsSection, WeekendGetawaysSection } from "../components/home/DeparturesAndTreks";
import { CorporateTravelSection, HowItWorksSection, WhyChooseUsSection } from "../components/home/CorporateAndProcess";
import { TestimonialsSection, GoogleReviewsSection } from "../components/home/SocialProof";
import { BlogSection, FinalCTASection } from "../components/home/BlogAndCTA";

export default function Home() {
  return (
    <>
      <Seo
        title="Altiora Journeys | Premium Travel &amp; Adventure Planning"
        description="Custom holidays, treks, expeditions and fixed departures across India and the world — planned by real travel experts."
      />
      <Hero />
      <FeaturedDestinations />
      <PopularPackages />
      <ServicesSection />
      <HolidayCategoriesSection />
      <FixedDeparturesSection />
      <TreksExpeditionsSection />
      <WeekendGetawaysSection />
      <CorporateTravelSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <GoogleReviewsSection />
      <BlogSection />
      <FinalCTASection />
    </>
  );
}
