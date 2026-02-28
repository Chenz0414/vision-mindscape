import { motion } from "framer-motion";
import { FileText, PenTool, Globe, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "深度文档解析",
    desc: "极速读取长篇合同与规章，自动提炼核心条款，大幅降低培训成本。",
  },
  {
    icon: PenTool,
    title: "标准化文案生成",
    desc: "一键生成周报、会议纪要、营销文案，统一企业文风与输出规范。",
  },
  {
    icon: Globe,
    title: "跨语言商务沟通",
    desc: "专业级行业术语翻译与邮件润色，助力出海业务无缝对接。",
  },
  {
    icon: ShieldCheck,
    title: "严格数据隔离",
    desc: "支持私有化本地部署，彻底解决商业机密泄露隐患。",
    highlight: true,
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const FeaturesSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.05] blur-[100px]"
        style={{ background: "radial-gradient(circle, hsl(199 89% 55%), transparent)" }}
      />
      <div className="container relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
        >
          全面覆盖办公场景，激活全员生产力
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              className={`glass-card-hover rounded-xl p-6 group ${
                f.highlight ? "pulse-glow" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-3 text-foreground">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
