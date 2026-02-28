import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Brain, CheckCircle2, AlertCircle, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parsePdfLocally } from "./pdfLocalParser";
import type { Job, Candidate, CandidateStatus } from "./types";
import type { LLMSettings } from "./types";
import ScoreRing from "./ScoreRing";

const STATUS_LABELS: Record<CandidateStatus, { label: string; icon: React.ReactNode }> = {
  uploading: { label: "上传中…", icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> },
  extracting: { label: "提取简历文本…", icon: <FileText className="w-3.5 h-3.5 text-primary animate-pulse" /> },
  evaluating: { label: "AI 评估中…", icon: <Brain className="w-3.5 h-3.5 text-primary animate-pulse" /> },
  done: { label: "已完成", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
  error: { label: "处理失败", icon: <AlertCircle className="w-3.5 h-3.5 text-destructive" /> },
};

interface Props {
  activeJob: Job | null;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  allCandidates: Candidate[];
  setAllCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  onSelectCandidate: (id: string | null) => void;
  selectedCandidateId: string | null;
}

const getSettings = (): LLMSettings | null => {
  const s = localStorage.getItem("rs-settings");
  return s ? JSON.parse(s) : null;
};

const DEFAULT_PROMPT = `你是一位专业的HR助手。请对比以下岗位描述和候选人简历，返回严格的JSON格式（不要markdown包裹）：
{
  "name": "候选人姓名",
  "score": 0到100的匹配分数,
  "tags": ["核心亮点标签1", "标签2", "标签3"],
  "strengths": ["核心优势1", "核心优势2", "核心优势3"],
  "risks": ["风险预警1", "风险预警2"],
  "summary": "一句话总结"
}

岗位描述：
{jd}

简历内容：
{resume}`;

const CandidateBoard = ({
  activeJob,
  candidates,
  setCandidates,
  allCandidates,
  setAllCandidates,
  onSelectCandidate,
  selectedCandidateId,
}: Props) => {
  const updateCandidate = useCallback(
    (id: string, updates: Partial<Candidate>) => {
      setAllCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    [setAllCandidates]
  );

  const processFile = useCallback(
    async (file: File, candidateId: string) => {
      if (!activeJob) return;

      // Step 1: Upload PDF for text extraction
      updateCandidate(candidateId, { status: "extracting" });
      let resumeText = "";
      
      // Try remote API first, fallback to local PDF.js
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const settings = getSettings();
        const pdfUrl = settings?.pdfApiUrl || "http://connect.westd.seetacloud.com:37672/api/v1/parse/upload";
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const fnUrl = `https://${projectId}.supabase.co/functions/v1/parse-pdf`;
        
        const res = await fetch(fnUrl, {
          method: "POST",
          headers: { "apikey": anonKey, "x-pdf-api-url": pdfUrl },
          body: formData,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error?.message || errBody?.error || `PDF解析失败: ${res.status}`);
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.error?.message || data.error || "解析返回失败");
        resumeText = data.data || "";
      } catch (remoteErr: any) {
        console.warn("远程解析失败，降级到本地 PDF.js:", remoteErr.message);
        toast({ title: "远程解析不可用，已切换本地解析", description: remoteErr.message });
        try {
          resumeText = await parsePdfLocally(file);
        } catch (localErr: any) {
          toast({ title: "PDF 解析失败", description: localErr.message, variant: "destructive" });
          updateCandidate(candidateId, { status: "error", error: localErr.message });
          return;
        }
      }
      
      if (!resumeText.trim()) {
        toast({ title: "PDF 解析结果为空", description: "该文件可能是扫描件，无法提取文字", variant: "destructive" });
        updateCandidate(candidateId, { status: "error", error: "解析结果为空" });
        return;
      }

      updateCandidate(candidateId, { resumeText, status: "evaluating" });

      // Step 2: LLM evaluation
      const settings = getSettings();
      if (!settings?.apiUrl || !settings?.apiKey) {
        toast({ title: "请先配置大模型设置", description: "点击右上角设置按钮配置 API 信息", variant: "destructive" });
        updateCandidate(candidateId, { status: "error", error: "未配置大模型" });
        return;
      }

      const prompt = (settings.promptTemplate || DEFAULT_PROMPT)
        .replace("{jd}", activeJob.description)
        .replace("{resume}", resumeText);

      try {
        const llmRes = await fetch(settings.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.apiKey}`,
          },
          body: JSON.stringify({
            model: settings.model || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
          }),
        });
        if (!llmRes.ok) throw new Error(`LLM 调用失败: ${llmRes.status}`);
        const llmData = await llmRes.json();
        const content = llmData.choices?.[0]?.message?.content || "";
        // Try to parse JSON from content
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI 未返回有效 JSON");
        const parsed = JSON.parse(jsonMatch[0]);

        updateCandidate(candidateId, {
          status: "done",
          name: parsed.name || "未知",
          score: parsed.score || 0,
          tags: parsed.tags || [],
          strengths: parsed.strengths || [],
          risks: parsed.risks || [],
          aiSummary: parsed.summary || "",
        });
      } catch (err: any) {
        toast({ title: "AI 评估错误", description: err.message, variant: "destructive" });
        updateCandidate(candidateId, { status: "error", error: err.message });
      }
    },
    [activeJob, updateCandidate]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!activeJob) {
        toast({ title: "请先选择一个岗位", variant: "destructive" });
        return;
      }
      const newCandidates: Candidate[] = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        jobId: activeJob.id,
        fileName: file.name,
        name: file.name.replace(/\.pdf$/i, ""),
        status: "uploading" as const,
        score: 0,
        tags: [],
        strengths: [],
        risks: [],
        resumeText: "",
        aiSummary: "",
        decision: "pending" as const,
      }));

      setAllCandidates((prev) => [...prev, ...newCandidates]);

      newCandidates.forEach((c, i) => {
        processFile(acceptedFiles[i], c.id);
      });
    },
    [activeJob, processFile, setAllCandidates]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    disabled: !activeJob,
  });

  if (!activeJob) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">请在左侧创建或选择一个岗位</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Dropzone */}
      <div className="p-4">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/40 hover:bg-primary/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? "释放文件开始解析" : "拖拽 PDF 简历到此处，或点击上传"}
          </p>
        </div>
      </div>

      {/* Candidate list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {candidates.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-16">上传简历后，候选人将在此显示</p>
        )}
        {candidates.map((candidate) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => candidate.status === "done" && onSelectCandidate(candidate.id)}
            className={`glass-card rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-primary/30 ${
              selectedCandidateId === candidate.id ? "border-primary/50 bg-primary/5" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {candidate.status === "done" ? (
                <ScoreRing score={candidate.score} size={48} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  {STATUS_LABELS[candidate.status].icon}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">{candidate.name}</span>
                  {candidate.status !== "done" && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {STATUS_LABELS[candidate.status].icon}
                      {STATUS_LABELS[candidate.status].label}
                    </span>
                  )}
                </div>

                {candidate.status === "done" && (
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {candidate.status === "error" && (
                  <p className="text-xs text-destructive truncate">{candidate.error}</p>
                )}
              </div>

              {candidate.status === "done" && (
                <span className={`text-xs font-semibold ${candidate.score >= 80 ? "text-emerald-400" : candidate.score >= 60 ? "text-primary" : "text-muted-foreground"}`}>
                  {candidate.score}分
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default CandidateBoard;
