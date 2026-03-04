import { useState } from "react";
import { motion } from "framer-motion";
import ContactModal from "@/components/ContactModal";
import ritaLogo from "@/assets/rita-logo.webp";
import ritaText from "@/assets/rita-text.webp";

const navItems = [
  { label: "产品功能", target: "features" },
  { label: "定制化中台", target: "customization" },
  { label: "行业案例", target: "departments" },
  { label: "安全合规", target: "footer" },
];

const Navbar = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
    <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
      style={{
        background: "linear-gradient(180deg, hsl(220 20% 4% / 0.95), hsl(220 20% 4% / 0.8))",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={ritaLogo} alt="Rita Logo" className="h-8 w-8" />
          <img src={ritaText} alt="Rita" className="h-5" />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.target)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-[0_0_20px_-5px_hsl(199_89%_48%_/_0.5)] transition-all duration-300"
          >
            商务合作
          </button>
        </div>
      </div>
    </motion.header>
    </>
  );
};

export default Navbar;
