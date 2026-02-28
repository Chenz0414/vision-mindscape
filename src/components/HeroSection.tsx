import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(199 89% 48% / 0.3), transparent)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.3), transparent)" }}
      />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-foreground">重塑团队生产力：</span>
              <br />
              <span className="text-gradient-hero">企业级 AI 办公大脑</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-2 max-w-lg">
              深度嵌入日常办公流，提供开箱即用的 AI 工具集。
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              让 10 人的团队，发挥 30 人的产能。
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base transition-all duration-300 hover:shadow-[0_0_30px_-5px_hsl(199_89%_48%_/_0.5)]"
              >
                免费接入试用
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 rounded-lg border border-border text-foreground font-medium text-base hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                获取提效方案
              </motion.button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>支持本地私有化部署 · 企业数据绝对隔离</span>
            </div>
          </motion.div>

          {/* Right dashboard image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative glass-card rounded-2xl p-2 glow-border float-animation">
              <img
                src={heroDashboard}
                alt="Rita AI 智能办公面板"
                className="rounded-xl w-full"
              />
              <div className="absolute inset-0 rounded-2xl shine" />
            </div>

            {/* Floating particles */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-xl opacity-30"
              style={{ background: "hsl(199 89% 48%)" }}
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full blur-xl opacity-20"
              style={{ background: "hsl(217 91% 60%)" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
