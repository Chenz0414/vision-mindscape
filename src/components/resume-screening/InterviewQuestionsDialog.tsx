import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Loader2, Copy, CheckCheck, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Candidate, LLMSettings } from "./types";
import ReactMarkdown from "react-markdown";

const INTERVIEW_PROMPT = `你是一位资深HR面试官。请根据以下岗位描述和候选人简历，生成5道有针对性的面试题。

要求：
1. 问题应结合岗位要求和候选人背景，做到有的放矢
2. 包含技术能力、项目经验、软技能等多个维度
3. 每道题附带【考察要点】和【参考答案要点】
4. 每道题用 ## 标题，考察要点和参考答案要点用 ### 子标题
5. 用 Markdown 格式输出，层次清晰

岗位描述：
{jd}

候选人简历：
{resume}

候选人AI评估摘要：
- 匹配分数：{score}分
- 核心标签：{tags}
- 优势：{strengths}
- 风险：{risks}`;

const DEFAULT_SETTINGS: LLMSettings = {
  apiUrl: "https://yunwu.ai/v1/chat/completions",
  apiKey: "sk-EuxW4Jz0h2G8NPKNOznzOBu1ZPJ7NXodjLiszMYnqF14iftg",
  model: "glm-4.7",
  promptTemplate: "",
  pdfApiUrl: "",
};

const getSettings = (): LLMSettings => {
  const s = localStorage.getItem("rs-settings");
  return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
};

interface Props {
  candidate: Candidate;
  jobDescription: string;
}

/** Split markdown content into individual question blocks by ## headings */
const splitQuestions = (md: string): string[] => {
  const parts = md.split(/(?=^## )/m).filter((s) => s.trim());
  return parts.length > 0 ? parts : [md];
};

const InterviewQuestionsDialog = ({ candidate, jobDescription }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = () => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const p = Math.min(95, Math.round((elapsed / (elapsed + 15)) * 100));
      setProgress(p);
    }, 300);
  };

  const stopProgress = () => {
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
    setProgress(100);
  };

  useEffect(() => () => { if (progressRef.current) clearInterval(progressRef.current); }, []);

  const generate = async () => {
    const settings = getSettings();

    setLoading(true);
    setContent("");
    startProgress();

    const prompt = INTERVIEW_PROMPT
      .replace("{jd}", jobDescription)
      .replace("{resume}", candidate.resumeText)
      .replace("{score}", String(candidate.score))
      .replace("{tags}", candidate.tags.join("、"))
      .replace("{strengths}", candidate.strengths.join("、"))
      .replace("{risks}", candidate.risks.join("、"));

    try {
      const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`;
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model || "glm-4.7",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });
      if (!res.ok) throw new Error(`LLM 调用失败: ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      if (!text) throw new Error("AI 未返回有效内容");
      setContent(text);
    } catch (err: any) {
      toast({ title: "面试题生成失败", description: err.message, variant: "destructive" });
    } finally {
      stopProgress();
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "已复制到剪贴板" });
  };

  const questions = content ? splitQuestions(content) : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && !content) generate(); }}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-primary/10 text-primary border border-primary/20
            hover:bg-primary/20 hover:border-primary/40 hover:shadow-[0_0_12px_-3px_hsl(var(--primary)/0.3)]
            transition-all duration-300 flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI 面试题
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl max-h-[88vh] flex flex-col overflow-hidden glass-card border-border/50 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogHeader className="p-0">
                <DialogTitle className="text-base font-semibold">AI 面试题</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground mt-0.5">{candidate.name} · 匹配度 {candidate.score}分</p>
            </div>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs border-border/50 hover:border-primary/30">
                {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制全部"}
              </Button>
              <Button variant="outline" size="sm" onClick={generate} className="gap-1.5 text-xs border-border/50 hover:border-primary/30">
                <RefreshCw className="w-3.5 h-3.5" />
                重新生成
              </Button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-primary/5 animate-pulse" />
              </div>
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>正在生成面试题…</span>
                  <span className="text-primary font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-[11px] text-muted-foreground text-center">
                  AI 正在分析岗位要求与候选人简历，预计 30-60 秒
                </p>
              </div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-secondary/30 p-5 transition-all duration-300 hover:border-primary/20 hover:bg-secondary/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0 prose prose-sm dark:prose-invert max-w-none
                      prose-headings:text-foreground prose-headings:mt-0 prose-headings:mb-2
                      prose-h2:text-sm prose-h2:font-bold prose-h2:leading-snug
                      prose-h3:text-xs prose-h3:font-semibold prose-h3:text-primary prose-h3:mt-3 prose-h3:mb-1
                      prose-p:text-muted-foreground prose-p:text-[13px] prose-p:leading-relaxed prose-p:mb-2
                      prose-strong:text-foreground
                      prose-li:text-muted-foreground prose-li:text-[13px] prose-li:my-0.5
                      prose-ul:my-1.5 prose-ol:my-1.5
                    ">
                      <ReactMarkdown>{q}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">生成 AI 面试题</p>
                <p className="text-xs text-muted-foreground">基于岗位要求与候选人简历，AI 将生成有针对性的面试题目</p>
              </div>
              <Button onClick={generate} className="gap-2 mt-2">
                <Sparkles className="w-4 h-4" />
                开始生成
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewQuestionsDialog;
