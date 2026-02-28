import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CustomizationSection from "@/components/CustomizationSection";
import DepartmentsSection from "@/components/DepartmentsSection";
import FooterCTA from "@/components/FooterCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CustomizationSection />
      <DepartmentsSection />
      <FooterCTA />
    </div>
  );
};

export default Index;
