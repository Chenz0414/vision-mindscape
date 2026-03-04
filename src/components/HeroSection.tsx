import { useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";
import ContactModal from "@/components/ContactModal";

const HeroSection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(199 89% 48% / 0.3), transparent)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.3), transparent)" }} />

      <div className="container relative z-10 px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-foreground">重塑团队生产力：</span>
              <br />
              <span className="text-gradient-hero">企业级 AI 办公大脑</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-lg">
              深度嵌入日常办公流，提供开箱即用的 AI 工具集。
            </p>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg">
              让整个团队成倍提升产能。
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalOpen(true)}
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-[0_0_30px_-5px_hsl(199_89%_48%_/_0.5)]"
              >
                获取提效方案
              </motion.button>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span>支持本地私有化部署 · 企业数据绝对隔离</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative glass-card rounded-2xl p-2 glow-border float-animation">
              <img src={heroDashboard} alt="Rita AI 智能办公面板" className="rounded-xl w-full" />
              <div className="absolute inset-0 rounded-2xl shine" />
            </div>
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-xl opacity-30"
              style={{ background: "hsl(199 89% 48%)" }} />
            <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full blur-xl opacity-20"
              style={{ background: "hsl(217 91% 60%)" }} />
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
};

export default HeroSection;
