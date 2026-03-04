import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  contact: string;
  company: string;
  teamSize: string;
  requirement: string;
}

interface FormErrors {
  name?: string;
  contact?: string;
  company?: string;
  teamSize?: string;
  requirement?: string;
}

const requirementOptions = [
  "企业知识库定制",
  "工作流自动化",
  "私有化部署",
  "其他定制需求",
];

const teamSizeOptions = [
  "1~10人",
  "11~30人",
  "31~100人",
  "100人以上",
];

const ContactModal = ({ open, onClose }: ContactModalProps) => {
  const [form, setForm] = useState<FormData>({
    name: "", contact: "", company: "", teamSize: "", requirement: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "请填写姓名/称谓";
    if (!form.contact.trim()) newErrors.contact = "请填写联系电话或微信";
    if (!form.company.trim()) newErrors.company = "请填写公司全称";
    if (!form.teamSize) newErrors.teamSize = "请选择团队规模";
    if (!form.requirement) newErrors.requirement = "请选择核心需求";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name: form.name.trim(), contact: form.contact.trim(), company: form.company.trim(), teamSize: form.teamSize, requirement: form.requirement };
      const { data, error } = await supabase.functions.invoke("submit-requirement", { body: payload });

      if (error) throw error;
      if (data?.code !== 0) {
        toast.error(data?.message || "提交失败，请稍后重试");
        setLoading(false);
        return;
      }
      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.error("Submit error:", e);
      toast.error("网络异常，请稍后重试");
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setForm({ name: "", contact: "", company: "", teamSize: "", requirement: "" });
      setErrors({});
      setLoading(false);
      setSuccess(false);
    }, 300);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (hasError: boolean) =>
    `w-full h-10 rounded-lg border px-3 py-2 text-sm bg-background/50 text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200 ${
      hasError ? "border-red-500 focus:border-red-500" : "border-border/60 focus:border-primary"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border/50 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: "linear-gradient(145deg, hsl(220 20% 8% / 0.95), hsl(220 20% 6% / 0.98))",
              backdropFilter: "blur(24px)",
              boxShadow: "0 0 40px -10px hsl(199 89% 48% / 0.15), 0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <button onClick={handleClose} className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center py-8 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">提交成功！</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">我们的方案专家将在 24 小时内与您联系。</p>
                  <button onClick={handleClose}
                    className="mt-8 px-8 py-2.5 rounded-lg border border-border/60 text-sm text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                    关闭
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-1">获取专属提效方案</h2>
                  <p className="text-sm text-muted-foreground mb-6">请留下您的信息，我们将安排方案专家与您对接。</p>

                  <div className="space-y-4">
                    {/* Row 1: 姓名 + 联系方式 - stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1.5">姓名/称谓 <span className="text-red-500">*</span></label>
                        <input className={inputClass(!!errors.name)} placeholder="请输入姓名" value={form.name}
                          onChange={(e) => updateField("name", e.target.value)} maxLength={50} />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1.5">联系电话/微信 <span className="text-red-500">*</span></label>
                        <input className={inputClass(!!errors.contact)} placeholder="手机号或微信号" value={form.contact}
                          onChange={(e) => updateField("contact", e.target.value)} maxLength={50} />
                        {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">公司全称 <span className="text-red-500">*</span></label>
                      <input className={inputClass(!!errors.company)} placeholder="请输入公司全称" value={form.company}
                        onChange={(e) => updateField("company", e.target.value)} maxLength={100} />
                      {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
                    </div>

                    {/* Row 3: 团队规模 + 核心需求 - stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1.5">团队规模 <span className="text-red-500">*</span></label>
                        <Select value={form.teamSize} onValueChange={(val) => updateField("teamSize", val)}>
                          <SelectTrigger className={`w-full bg-background/50 ${errors.teamSize ? "border-red-500" : "border-border/60"}`}>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                          <SelectContent className="z-[200] bg-popover border-border/60">
                            {teamSizeOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        {errors.teamSize && <p className="text-xs text-red-500 mt-1">{errors.teamSize}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1.5">核心需求 <span className="text-red-500">*</span></label>
                        <Select value={form.requirement} onValueChange={(val) => updateField("requirement", val)}>
                          <SelectTrigger className={`w-full bg-background/50 ${errors.requirement ? "border-red-500" : "border-border/60"}`}>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                          <SelectContent className="z-[200] bg-popover border-border/60">
                            {requirementOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        {errors.requirement && <p className="text-xs text-red-500 mt-1">{errors.requirement}</p>}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={loading}
                    className="mt-6 w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_25px_-5px_hsl(199_89%_48%_/_0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />提交中…</>) : "提交获取方案"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
