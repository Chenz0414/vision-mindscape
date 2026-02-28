import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CustomizationSection from "@/components/CustomizationSection";
import DepartmentsSection from "@/components/DepartmentsSection";
import FooterCTA from "@/components/FooterCTA";

const SectionDivider = () => <div className="section-divider" />;

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Noise texture for depth */}
      <div className="noise-overlay" />

      {/* Global ambient light orbs */}
      <div
        className="ambient-orb w-[800px] h-[800px] opacity-[0.04]"
        style={{
          top: "10%",
          left: "-10%",
          background: "radial-gradient(circle, hsl(199 89% 55%), transparent 70%)",
        }}
      />
      <div
        className="ambient-orb w-[600px] h-[600px] opacity-[0.05]"
        style={{
          top: "35%",
          right: "-8%",
          background: "radial-gradient(circle, hsl(217 91% 60%), transparent 70%)",
        }}
      />
      <div
        className="ambient-orb w-[700px] h-[700px] opacity-[0.035]"
        style={{
          top: "60%",
          left: "5%",
          background: "radial-gradient(circle, hsl(199 89% 48%), transparent 70%)",
        }}
      />
      <div
        className="ambient-orb w-[500px] h-[500px] opacity-[0.04]"
        style={{
          top: "85%",
          right: "5%",
          background: "radial-gradient(circle, hsl(217 91% 55%), transparent 70%)",
        }}
      />

      <Navbar />
      <HeroSection />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <CustomizationSection />
      <SectionDivider />
      <DepartmentsSection />
      <SectionDivider />
      <FooterCTA />
    </div>
  );
};

export default Index;
