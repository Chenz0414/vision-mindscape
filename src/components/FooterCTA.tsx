import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ritaCombinedLogo from "@/assets/rita-combined-logo.png";
import ContactModal from "@/components/ContactModal";

const FooterCTA = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="footer" className="relative py-32 overflow-hidden">
      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, hsl(199 89% 48% / 0.15), transparent 70%)",
        }}
      />

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            准备好让 AI
            <span className="text-gradient-primary"> 重塑</span> 您的团队了吗？
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            立即开始免费试用，体验企业级 AI 办公大脑的强大能力。
          </p>

          <motion.button
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_40px_-5px_hsl(199_89%_48%_/_0.5)]"
          >
            获取提效方案
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="container relative z-10 mt-24 pt-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src={ritaCombinedLogo} alt="Rita AI" className="h-7" />
          </div>
          <p>© 2026 Rita AI. All rights reserved.</p>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
