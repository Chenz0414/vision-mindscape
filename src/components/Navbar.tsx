import { motion } from "framer-motion";

const navItems = ["产品功能", "定制化中台", "行业案例", "安全合规"];

const Navbar = () => {
  return (
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
        <div className="font-display text-xl font-bold text-gradient-primary">
          Rita AI
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            登录
          </button>
          <button className="text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-[0_0_20px_-5px_hsl(199_89%_48%_/_0.5)] transition-all duration-300">
            预约演示
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
