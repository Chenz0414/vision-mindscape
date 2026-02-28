# Rita AI 官网 — 样式与交互还原文档

> 本文档用于指导 Cursor 或其他 AI 编辑器，基于现有代码库 1:1 还原整个页面。涵盖设计系统、全局氛围层、各组件结构、文案内容、动画交互的完整规格。

---

## 一、技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS + 自定义 CSS 工具类（index.css） |
| 动画 | framer-motion（滚动进入 + 悬停交互） |
| 图标 | lucide-react |
| 字体 | Google Fonts: `Inter`（正文）+ `Space Grotesk`（标题/display） |
| UI 组件库 | shadcn/ui（基础组件底层，页面主要为自定义组件） |

---

## 二、设计系统（Design Tokens）

### 2.1 颜色体系（HSL 格式，定义在 CSS 变量中）

所有颜色使用 HSL 格式，通过 `--variable` 在 `:root` 中定义，Tailwind 通过 `hsl(var(--xxx))` 引用。

| Token | HSL 值 | 用途 |
|-------|--------|------|
| `--background` | `220 18% 6%` | 页面底色，深蓝灰（非纯黑） |
| `--foreground` | `210 40% 93%` | 主文字色，近白 |
| `--card` | `220 20% 7%` | 卡片底色 |
| `--primary` | `199 89% 48%` | 主品牌色，科技蓝（cyan-blue） |
| `--primary-foreground` | `220 20% 4%` | primary 上的文字色（深色） |
| `--secondary` | `220 20% 12%` | 次级背景 |
| `--muted` | `220 15% 14%` | 静音区域背景 |
| `--muted-foreground` | `215 15% 55%` | 次要文字色（灰色） |
| `--border` | `220 15% 16%` | 边框色 |
| `--glow-primary` | `199 89% 48%` | 发光效果主色 |
| `--glow-secondary` | `217 91% 60%` | 发光效果辅色（偏蓝紫） |
| `--surface-glass` | `220 20% 8%` | 玻璃材质表面色 |

### 2.2 字体

```css
font-sans: "Inter", system-ui, sans-serif;       /* 正文 */
font-display: "Space Grotesk", Inter, sans-serif; /* 标题、品牌文字 */
```

- 标题统一使用 `font-display`（即 Space Grotesk）
- 正文使用 `font-sans`（即 Inter）
- Google Fonts 引入链接：`https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap`

### 2.3 圆角

```
--radius: 0.75rem (12px)
```

卡片一般使用 `rounded-xl`(12px) 或 `rounded-2xl`(16px)。

---

## 三、全局 CSS 工具类

以下工具类定义在 `src/index.css` 的 `@layer utilities` 中，是整个页面视觉的核心。

### 3.1 文字渐变

```
.text-gradient-primary
  背景渐变：135deg, hsl(199 89% 58%) → hsl(217 91% 70%)
  效果：蓝到亮蓝的文字渐变，用于标题高亮词

.text-gradient-hero
  背景渐变：135deg, hsl(199 89% 65%) → hsl(199 89% 48%) → hsl(217 91% 60%)
  效果：三色文字渐变，仅用于 Hero 主标题
```

### 3.2 玻璃卡片（Glassmorphism）

```
.glass-card
  背景：135deg 线性渐变 hsl(220 20% 8%/0.8) → hsl(220 20% 6%/0.6)
  模糊：backdrop-filter: blur(20px)
  边框：1px solid hsl(220 15% 18%/0.5)

.glass-card-hover
  继承 glass-card + transition-all duration-500
  hover 时：
    - 边框变为 hsl(199 89% 48%/0.3)
    - box-shadow: 0 0 30px -10px hsl(199 89% 48%/0.15), inset 0 1px 0 0 hsl(199 89% 48%/0.1)
```

### 3.3 发光边框

```
.glow-border
  使用 ::before 伪元素
  渐变边框：135deg, hsl(199 89% 48%/0.4) → transparent → hsl(217 91% 60%/0.4)
  通过 mask-composite: exclude 实现仅边框可见
```

### 3.4 背景纹理

```
.grid-bg
  60px × 60px 网格线，颜色 hsl(220 15% 16%/0.3)

.dot-bg
  24px × 24px 点阵，颜色 hsl(220 15% 20%/0.5)
```

### 3.5 光效动画

```
.shine
  ::after 伪元素做扫光效果
  6 秒循环，30° 斜角方向来回扫过
  光带颜色：hsl(199 89% 48%/0.08) 最亮处

.float-animation
  6 秒周期上下浮动 20px

.pulse-glow
  3 秒周期呼吸式 box-shadow 变化：20px → 40px 扩散
```

### 3.6 区块分割器

```
.section-divider
  高度 120px，不可交互（pointer-events: none）
  ::before — 水平渐变线：transparent → primary(0.4) → glow-secondary(0.3) → transparent
  ::after — 中心辉光：径向渐变 hsl(199 89% 48%/0.06)，blur(10px)
```

### 3.7 全局氛围层

```
.ambient-orb
  绝对定位圆形光晕，border-radius: 50%，blur(100px)

.noise-overlay
  固定定位全屏覆盖，opacity: 0.015
  使用 SVG feTurbulence 生成噪点纹理（inline data URI）
```

---

## 四、页面全局结构（Index.tsx）

```
<div className="min-h-screen bg-background overflow-x-hidden relative">
  <div className="noise-overlay" />           ← 全局噪点层

  <!-- 4个 ambient-orb 分布在页面不同位置 -->
  <ambient-orb> top:10%, left:-10%, 800×800, opacity:0.04, cyan
  <ambient-orb> top:35%, right:-8%, 600×600, opacity:0.05, blue
  <ambient-orb> top:60%, left:5%, 700×700, opacity:0.035, cyan
  <ambient-orb> top:85%, right:5%, 500×500, opacity:0.04, blue

  <Navbar />
  <HeroSection />
  <SectionDivider />        ← 120px 高发光分割线
  <FeaturesSection />
  <SectionDivider />
  <CustomizationSection />
  <SectionDivider />
  <DepartmentsSection />
  <SectionDivider />
  <FooterCTA />
</div>
```

---

## 五、各组件详细规格

---

### 5.1 Navbar

**布局**：固定顶部（`fixed top-0 z-50`），高度 `h-16`（64px），`container` 居中，`justify-between`

**背景**：渐变半透明 + 毛玻璃
```
background: linear-gradient(180deg, hsl(220 20% 4%/0.95), hsl(220 20% 4%/0.8))
backdrop-filter: blur(20px)
border-bottom: 1px solid border/50
```

**入场动画**：`initial={{ y: -20, opacity: 0 }} → animate={{ y: 0, opacity: 1 }}`，duration: 0.6s

**左侧 Logo**：
- 文字 "Rita AI"
- `font-display text-xl font-bold text-gradient-primary`

**中间导航**（md 以上显示）：
- 项目：["产品功能", "定制化中台", "行业案例", "安全合规"]
- 样式：`text-sm text-muted-foreground hover:text-foreground`
- 下划线动画：`::after` 伪元素，`h-0.5 bg-primary`，hover 时 `scale-x-0 → scale-x-100`

**右侧按钮**：
- "登录"：文字按钮，`text-sm text-muted-foreground hover:text-foreground`
- "预约演示"：实心按钮，`bg-primary text-primary-foreground rounded-lg px-5 py-2`，hover 时 `shadow: 0 0 20px -5px primary/0.5`

---

### 5.2 HeroSection

**布局**：`min-h-screen flex items-center pt-16`，两栏 `lg:grid-cols-2 gap-12`

**背景层**：
1. `.grid-bg opacity-40` 全屏网格
2. 左上 radial-gradient 光晕：600×600, opacity-20, blur-120px, cyan
3. 右下 radial-gradient 光晕：400×400, opacity-10, blur-100px, blue

**左栏内容**：
- 入场动画：`initial={{ opacity:0, x:-40 }} → animate={{ opacity:1, x:0 }}`，duration 0.8s

- **H1 标题**：
  - 第一行："重塑团队生产力：" — `text-foreground`
  - 第二行："企业级 AI 办公大脑" — `text-gradient-hero`
  - 字号：`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight`
  - 字体：`font-display`

- **副标题**：
  - "深度嵌入日常办公流，提供开箱即用的 AI 工具集。"
  - "让 10 人的团队，发挥 30 人的产能。"
  - 样式：`text-lg text-muted-foreground max-w-lg`

- **按钮组**：
  - 主按钮 "免费接入试用"：`bg-primary text-primary-foreground rounded-lg px-8 py-3.5 font-semibold`
    - hover: `shadow 0 0 30px -5px primary/0.5`
    - whileHover: `scale: 1.03`，whileTap: `scale: 0.98`
  - 次按钮 "获取提效方案"：`border border-border text-foreground rounded-lg px-8 py-3.5`
    - hover: `border-primary/50 bg-primary/5`

- **安全标签**：
  - 图标：`Shield`（lucide），`w-4 h-4 text-primary`
  - 文字："支持本地私有化部署 · 企业数据绝对隔离"
  - 样式：`text-sm text-muted-foreground`

**右栏仪表盘**：
- 入场动画：`initial={{ opacity:0, y:40 }}`，duration 0.8s，delay 0.3s
- 外层容器：`glass-card rounded-2xl p-2 glow-border float-animation`
- 图片：`src/assets/hero-dashboard.png`，`rounded-xl w-full`
- 扫光层：`shine` class 覆盖在图片上
- 两个浮动光球（motion.div）：
  - 右上：20×20 blur-xl opacity-30 cyan，y 动画 [-10,10,-10] 4秒循环
  - 左下：16×16 blur-xl opacity-20 blue，y 动画 [10,-10,10] 5秒循环

---

### 5.3 FeaturesSection

**布局**：`py-32`，`container` 居中

**背景层**：
1. `.dot-bg opacity-30` 全屏点阵
2. 顶部中央 radial-gradient：600×300, opacity 0.05, blur 100px, cyan

**标题**：
- "全面覆盖办公场景，激活全员生产力"
- `font-display text-3xl md:text-4xl font-bold text-center mb-16`
- 滚动进入：`whileInView={{ opacity:1, y:0 }}`，viewport once

**卡片网格**：`grid md:grid-cols-2 lg:grid-cols-4 gap-6`

**卡片交错动画**：
- 容器使用 `variants` 的 `staggerChildren: 0.12`
- 每张卡片：`hidden→show`，opacity 0→1，y 30→0，duration 0.6s

**4 张功能卡片数据**：

| 图标 | 标题 | 描述 | 特殊 |
|------|------|------|------|
| FileText | 深度文档解析 | 极速读取长篇合同与规章，自动提炼核心条款，大幅降低培训成本。 | — |
| PenTool | 标准化文案生成 | 一键生成周报、会议纪要、营销文案，统一企业文风与输出规范。 | — |
| Globe | 跨语言商务沟通 | 专业级行业术语翻译与邮件润色，助力出海业务无缝对接。 | — |
| ShieldCheck | 严格数据隔离 | 支持私有化本地部署，彻底解决商业机密泄露隐患。 | `pulse-glow` |

**卡片样式**：
- 容器：`glass-card-hover rounded-xl p-6 group`
- 图标容器：`w-12 h-12 rounded-lg bg-primary/10`，hover 时 `bg-primary/20`
- 图标：`w-6 h-6 text-primary`
- 标题：`font-display font-semibold text-lg mb-3 text-foreground`
- 描述：`text-sm text-muted-foreground leading-relaxed`

---

### 5.4 CustomizationSection

**布局**：`py-32`，`container` 居中，两栏 `lg:grid-cols-2 gap-16 items-center`

**背景层**：
- 右侧 radial-gradient 光晕：500×500, opacity 0.06, blur 120px, cyan

**标签**（标题上方）：
- "企业级深度定制"
- `text-primary text-sm font-semibold tracking-wider uppercase`
- 滚动进入动画

**左栏**：
- 入场动画：`opacity:0 x:-30 → opacity:1 x:0`，duration 0.7s

- **H2**：
  - "不是适应软件，"（换行）"而是让 AI 适应您的业务"
  - 第二行用 `text-gradient-primary`
  - `font-display text-3xl md:text-4xl font-bold leading-tight mb-6`

- **描述**："根据具体业务流，定向组合海量 AI 能力，为您开发专属的内部工具箱。"
  - `text-muted-foreground mb-8 max-w-md leading-relaxed`

- **能力列表**（3 项）：
  1. "多模态能力：文字、图片、表格一网打尽"
  2. "无缝对接现有 OA / ERP 系统"
  3. "7 天敏捷上线，快速验证业务价值"
  - 每项前有 `Check` 图标，`w-5 h-5 rounded-full bg-primary/20` 容器
  - 文字：`text-sm text-foreground/80`

- **CTA 按钮**："提交定制需求"
  - 同主按钮样式

**右栏 — 工具面板**：
- 入场动画：`opacity:0 x:30`，duration 0.7s, delay 0.2s
- 外层：`glass-card rounded-2xl p-6 glow-border`
- 面板标题："专属 AI 效能中台" — `font-display font-semibold text-lg mb-6`

- **5 个工具行**（每行交错进入，delay 0.3 + i×0.08）：

| 图标 | 标签 | active |
|------|------|--------|
| Users | HR简历速筛 | ✅ |
| Sparkles | 全平台广告生成 | ❌ |
| Image | 电商主图直出 | ❌ |
| FileCheck | 合同法务排雷 | ❌ |
| BarChart3 | 运营数据周报 | ❌ |

- active 行样式：`bg-primary/10 border border-primary/30`，图标容器 `bg-primary/20`，右侧显示 "点击体验 →"
- inactive 行样式：`hover:bg-secondary border border-transparent`，图标容器 `bg-secondary`
- 图标容器：`w-10 h-10 rounded-lg`
- 图标：`w-5 h-5`，active 时 `text-primary`，否则 `text-muted-foreground`

- **添加行**：`border-dashed border-border/50`，hover 时 `border-primary/30`
  - 图标：`Plus`，`w-5 h-5 text-muted-foreground`
  - 文字："添加新场景"

---

### 5.5 DepartmentsSection

**布局**：`py-32`，`container` 居中

**背景层**：
1. `.grid-bg opacity-20` 全屏网格
2. 左下 radial-gradient：600×400, opacity 0.05, blur 120px, blue

**标题**：
- "每个部门，都能算得清这笔效能账"
- `font-display text-3xl md:text-4xl font-bold text-center mb-16`

**卡片网格**：`grid md:grid-cols-3 gap-8`

**3 张部门卡片**（逐个滚动进入，delay i×0.15）：

| 图标 | 标题 | 统计值 | 统计标签 | 描述 |
|------|------|--------|----------|------|
| Users | 人事与行政 | 60% | 效率提升 | AI 快速筛选海量简历，精准匹配岗位画像；智能入职答疑机器人，让新员工即刻上手，释放 HR 60% 重复工作时间。 |
| Megaphone | 市场与运营 | 5x | 产出效率 | AI 批量产出社群话术、短视频脚本与活动方案，素材产出效率提升 5 倍，让运营团队聚焦策略而非执行。 |
| LineChart | 业务管理层 | 全局 | 智能洞察 | AI 自动汇总各部门繁杂经营数据，生成可视化周报并提炼关键风险点，辅助决策层快速把握全局。 |

**卡片样式**：
- 容器：`glass-card-hover rounded-2xl p-8 group relative`
- 统计徽章：`absolute top-6 right-6 text-right`
  - 数值：`font-display text-2xl font-bold text-gradient-primary`
  - 标签：`text-xs text-muted-foreground`
- 图标容器：`w-14 h-14 rounded-xl bg-primary/10`，hover 时 `bg-primary/20`，transition 500ms
- 图标：`w-7 h-7 text-primary`
- 标题：`font-display font-semibold text-xl mb-4 text-foreground`
- 描述：`text-sm text-muted-foreground leading-relaxed`
- 底部发光线：`absolute bottom-0 left-8 right-8 h-px`，`bg-gradient-to-r from-transparent via-primary/30 to-transparent`，默认 `opacity-0`，hover 时 `opacity-100`，transition 500ms

---

### 5.6 FooterCTA

**布局**：`py-32`，`container` 居中，`text-center`

**背景层**：
- 全屏中心 radial-gradient：`hsl(199 89% 48%/0.15)`，opacity-20

**内容**（滚动进入，duration 0.7s）：

- **H2**：
  - "准备好让 AI" + " 重塑"（`text-gradient-primary`）+ " 您的团队了吗？"
  - `font-display text-3xl md:text-5xl font-bold mb-6`

- **描述**："立即开始免费试用，体验企业级 AI 办公大脑的强大能力。"
  - `text-muted-foreground text-lg mb-10 max-w-xl mx-auto`

- **CTA 按钮**："免费接入试用" + ArrowRight 图标
  - `px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg`
  - hover: `shadow: 0 0 40px -5px primary/0.5`
  - whileHover: `scale: 1.05`，whileTap: `scale: 0.97`

**页脚**：
- `mt-24 pt-8 border-t border-border/50`
- 左：`"Rita AI"` — `font-display font-bold text-gradient-primary text-lg`
- 右：`"© 2026 Rita AI. All rights reserved."` — `text-sm text-muted-foreground`
- 布局：`flex-col md:flex-row items-center justify-between`

---

## 六、动画规格汇总

### 6.1 framer-motion 入场动画

| 组件 | 触发方式 | initial | animate/whileInView | duration | delay | ease |
|------|----------|---------|---------------------|----------|-------|------|
| Navbar | 页面加载 | y:-20, opacity:0 | y:0, opacity:1 | 0.6s | — | default |
| Hero 左栏 | 页面加载 | opacity:0, x:-40 | opacity:1, x:0 | 0.8s | — | easeOut |
| Hero 右栏 | 页面加载 | opacity:0, y:40 | opacity:1, y:0 | 0.8s | 0.3s | easeOut |
| Features 标题 | 滚动进入 | opacity:0, y:20 | opacity:1, y:0 | 0.6s | — | — |
| Features 卡片 | 滚动进入 | opacity:0, y:30 | opacity:1, y:0 | 0.6s | stagger 0.12s | easeOut |
| Customization 标签 | 滚动进入 | opacity:0, y:20 | opacity:1, y:0 | 0.6s | — | — |
| Customization 左栏 | 滚动进入 | opacity:0, x:-30 | opacity:1, x:0 | 0.7s | — | — |
| Customization 右栏 | 滚动进入 | opacity:0, x:30 | opacity:1, x:0 | 0.7s | 0.2s | — |
| Customization 工具行 | 滚动进入 | opacity:0, x:20 | opacity:1, x:0 | 0.4s | 0.3+i×0.08s | — |
| Departments 标题 | 滚动进入 | opacity:0, y:20 | opacity:1, y:0 | 0.6s | — | — |
| Departments 卡片 | 滚动进入 | opacity:0, y:40 | opacity:1, y:0 | 0.6s | i×0.15s | — |
| FooterCTA 内容 | 滚动进入 | opacity:0, y:30 | opacity:1, y:0 | 0.7s | — | — |

所有 `whileInView` 均设置 `viewport={{ once: true }}`（只触发一次）。

### 6.2 交互动画（hover / tap）

| 元素 | whileHover | whileTap |
|------|-----------|----------|
| 主 CTA 按钮 | scale: 1.03 | scale: 0.98 |
| Footer CTA 按钮 | scale: 1.05 | scale: 0.97 |
| glass-card-hover 卡片 | CSS transition: border-color + box-shadow，500ms | — |
| 导航链接 | CSS 下划线 width 0→100%，300ms | — |

### 6.3 持续循环动画（CSS keyframes）

| 类名 | 效果 | 周期 |
|------|------|------|
| `.float-animation` | translateY 0→-20px→0 | 6s ease-in-out infinite |
| `.pulse-glow` | box-shadow 20px→40px 扩散 | 3s ease-in-out infinite |
| `.shine` | 30° 斜向扫光 | 6s ease-in-out infinite |

### 6.4 framer-motion 持续循环动画

| 元素 | 属性 | 关键帧 | 周期 |
|------|------|--------|------|
| Hero 右上光球 | y | [-10, 10, -10] | 4s infinite |
| Hero 左下光球 | y | [10, -10, 10] | 5s infinite |

---

## 七、响应式断点

使用 Tailwind 默认断点：

| 断点 | 像素 | 关键变化 |
|------|------|----------|
| 默认（mobile） | <768px | 单栏布局，导航隐藏中间链接 |
| `md` | ≥768px | Features 2 列，Departments 3 列，导航显示 |
| `lg` | ≥1024px | Hero / Customization 双栏，Features 4 列 |

Container 最大宽度：`1400px`，padding：`2rem`

---

## 八、文件结构

```
src/
├── assets/
│   └── hero-dashboard.png          # Hero 区仪表盘截图
├── components/
│   ├── Navbar.tsx                   # 顶部导航栏
│   ├── HeroSection.tsx             # 首屏 Hero
│   ├── FeaturesSection.tsx         # 功能特性 4 卡片
│   ├── CustomizationSection.tsx    # 定制化能力 + 工具面板
│   ├── DepartmentsSection.tsx      # 部门效能 3 卡片
│   └── FooterCTA.tsx               # 底部 CTA + 页脚
├── pages/
│   └── Index.tsx                   # 页面入口（组合所有 Section + 全局氛围层）
├── index.css                       # 设计系统 + 工具类定义
└── ...
```

---

## 九、还原要点检查清单

- [ ] 底色非纯黑，使用 `220 18% 6%` 深蓝灰
- [ ] 全局 4 个 `ambient-orb` 光晕分布在页面各处
- [ ] 全局 `noise-overlay` 噪点纹理层
- [ ] 每两个 Section 之间有 `section-divider`（120px 高发光分割线）
- [ ] 所有标题使用 Space Grotesk（`font-display`），正文使用 Inter
- [ ] 渐变文字使用 `text-gradient-primary` 或 `text-gradient-hero`
- [ ] 卡片使用 `glass-card` / `glass-card-hover` 玻璃材质
- [ ] Hero 仪表盘图片带 `glow-border` + `float-animation` + `shine` 扫光
- [ ] 所有滚动进入动画使用 `viewport={{ once: true }}`
- [ ] 按钮 hover 带蓝色发光 shadow + scale 微放大
- [ ] "严格数据隔离" 卡片有 `pulse-glow` 呼吸灯效果
- [ ] 导航链接有下划线展开动画
- [ ] Customization 工具面板中 active 行高亮 + 交错进入
- [ ] Departments 卡片右上角有统计徽章 + 底部 hover 发光线
- [ ] 颜色体系全部通过 CSS 变量管控，组件中不硬编码颜色值（光效除外）
