import { motion } from "framer-motion";
import { Users, Megaphone, LineChart } from "lucide-react";

const departments = [
  {
    icon: Users,
    title: "人事与行政",
    desc: "AI 快速筛选海量简历，精准匹配岗位画像；智能入职答疑机器人，让新员工即刻上手，释放 HR 60% 重复工作时间。",
    stat: "60%",
    statLabel: "效率提升",
  },
  {
    icon: Megaphone,
    title: "市场与运营",
    desc: "AI 批量产出社群话术、短视频脚本与活动方案，素材产出效率提升 5 倍，让运营团队聚焦策略而非执行。",
    stat: "5x",
    statLabel: "产出效率",
  },
  {
    icon: LineChart,
    title: "业务管理层",
    desc: "AI 自动汇总各部门繁杂经营数据，生成可视化周报并提炼关键风险点，辅助决策层快速把握全局。",
    stat: "全局",
    statLabel: "智能洞察",
  },
];

const DepartmentsSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div
        className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-[0.05] blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(217 91% 60%), transparent)" }}
      />

      <div className="container relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
        >
          每个部门，都能算得清这笔效能账
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card-hover rounded-2xl p-8 group relative"
            >
              {/* Stat badge */}
              <div className="absolute top-6 right-6 text-right">
                <div className="font-display text-2xl font-bold text-gradient-primary">
                  {dept.stat}
                </div>
                <div className="text-xs text-muted-foreground">{dept.statLabel}</div>
              </div>

              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-500">
                <dept.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">
                {dept.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {dept.desc}
              </p>

              {/* Bottom glow line */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
