import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ContactModal from "@/components/ContactModal";
import ritaCombinedLogo from "@/assets/rita-combined-logo.png";

const navItems = [
  { label: "产品功能", target: "features" },
  { label: "定制化中台", target: "customization" },
  { label: "行业案例", target: "departments" },
  { label: "安全合规", target: "footer" },
];

const Navbar = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 72;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - headerOffset, behavior: "smooth" });
      }
    }, 300);
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
          <img src={ritaCombinedLogo} alt="Rita AI" className="h-8" />
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="hidden sm:block text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-[0_0_20px_-5px_hsl(199_89%_48%_/_0.5)] transition-all duration-300"
          >
            商务合作
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-border/50 overflow-hidden"
            style={{ background: "hsl(220 20% 4% / 0.98)" }}
          >
            <div className="container py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.target)}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); setModalOpen(true); }}
                className="block w-full text-left text-sm text-primary font-medium px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors sm:hidden"
              >
                商务合作
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
};

export default Navbar;
