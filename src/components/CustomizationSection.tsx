import { motion } from "framer-motion";
import { Check, Plus, Sparkles, Users, Image, FileCheck, BarChart3 } from "lucide-react";

const capabilities = [
  "多模态能力：文字、图片、表格一网打尽",
  "无缝对接现有 OA / ERP 系统",
  "7 天敏捷上线，快速验证业务价值",
];

const tools = [
  { icon: Users, label: "HR简历速筛", active: true },
  { icon: Sparkles, label: "全平台广告生成", active: false },
  { icon: Image, label: "电商主图直出", active: false },
  { icon: FileCheck, label: "合同法务排雷", active: false },
  { icon: BarChart3, label: "运营数据周报", active: false },
];

const CustomizationSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Local ambient glow */}
      <div
        className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(199 89% 48%), transparent)" }}
      />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            企业级深度定制
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
              不是适应软件，
              <br />
              <span className="text-gradient-primary">而是让 AI 适应您的业务</span>
            </h2>

            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              根据具体业务流，定向组合海量 AI 能力，为您开发专属的内部工具箱。
            </p>

            <ul className="space-y-4 mb-8">
              {capabilities.map((cap) => (
                <li key={cap} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/80">{cap}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:shadow-[0_0_30px_-5px_hsl(199_89%_48%_/_0.5)]"
            >
              提交定制需求
            </motion.button>
          </motion.div>

          {/* Right: Tool panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-6 glow-border">
              <h3 className="font-display font-semibold text-lg mb-6 text-foreground">
                专属 AI 效能中台
              </h3>

              <div className="space-y-3">
                {tools.map((tool, i) => (
                  <motion.div
                    key={tool.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                      tool.active
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tool.active ? "bg-primary/20" : "bg-secondary"
                      }`}
                    >
                      <tool.icon
                        className={`w-5 h-5 ${
                          tool.active ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        tool.active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {tool.label}
                    </span>
                    {tool.active && (
                      <span className="ml-auto text-xs text-primary">
                        点击体验 →
                      </span>
                    )}
                  </motion.div>
                ))}

                {/* Add new */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border/50 cursor-pointer hover:border-primary/30 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">添加新场景</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CustomizationSection;
