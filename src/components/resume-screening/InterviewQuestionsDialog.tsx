import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Loader2, Copy, CheckCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Candidate, LLMSettings } from "./types";
import ReactMarkdown from "react-markdown";

const INTERVIEW_PROMPT = `你是一位资深HR面试官。请根据以下岗位描述和候选人简历，生成5道有针对性的面试题。

要求：
1. 问题应结合岗位要求和候选人背景，做到有的放矢
2. 包含技术能力、项目经验、软技能等多个维度
3. 每道题附带【考察要点】和【参考答案要点】
4. 用 Markdown 格式输出，层次清晰

岗位描述：
{jd}

候选人简历：
{resume}

候选人AI评估摘要：
- 匹配分数：{score}分
- 核心标签：{tags}
- 优势：{strengths}
- 风险：{risks}`;

const getSettings = (): LLMSettings | null => {
  const s = localStorage.getItem("rs-settings");
  return s ? JSON.parse(s) : null;
};

interface Props {
  candidate: Candidate;
  jobDescription: string;
}

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
      // Asymptotic curve: approaches 95% over ~60s
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
    if (!settings?.apiUrl || !settings?.apiKey) {
      toast({ title: "请先配置大模型设置", description: "点击右上角设置按钮配置 API 信息", variant: "destructive" });
      return;
    }

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
      const res = await fetch(settings.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model || "gpt-4o-mini",
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

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && !content) generate(); }}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
          title="AI 面试题"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4 text-primary" />
            AI 面试题 — {candidate.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>正在生成面试题…</span>
                <span className="text-primary font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground">AI 正在分析岗位要求与候选人简历，预计需要 30-60 秒</p>
          </div>
        ) : content ? (
          <>
            <div className="flex justify-end gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制"}
              </Button>
              <Button variant="outline" size="sm" onClick={generate} className="gap-1.5">
                重新生成
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
              <div className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-foreground prose-headings:mt-6 prose-headings:mb-3
                prose-h2:text-lg prose-h2:font-bold prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                prose-h3:text-base prose-h3:font-semibold
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-3
                prose-strong:text-foreground
                prose-li:text-muted-foreground prose-li:my-1
                prose-ul:my-2 prose-ol:my-2
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-md prose-blockquote:py-1 prose-blockquote:px-3
              ">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-muted-foreground">点击下方按钮生成面试题</p>
            <Button onClick={generate} className="gap-2">
              <MessageSquare className="w-4 h-4" />
              生成面试题
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InterviewQuestionsDialog;
