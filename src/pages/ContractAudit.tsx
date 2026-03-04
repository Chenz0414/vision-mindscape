import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import ContractInput from "@/components/contract-audit/ContractInput";
import AuditResultPanel from "@/components/contract-audit/AuditResultPanel";
import { MOCK_CONTRACT, MOCK_RISKS, DEFAULT_PROMPT } from "@/components/contract-audit/constants";
import type { RiskItem } from "@/components/contract-audit/types";

const ContractAudit = () => {
  const navigate = useNavigate();
  const [contractText, setContractText] = useState(MOCK_CONTRACT);
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [summary, setSummary] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const startProgressSimulation = () => {
    startTimeRef.current = Date.now();
    setProgress(0);
    progressRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const p = Math.min(95, Math.round((elapsed / (elapsed + 20)) * 100));
      setProgress(p);
    }, 300);
  };

  const stopProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setProgress(100);
  };

  const handleStartAudit = async () => {
    setIsAuditing(true);
    setHasResult(false);
    startProgressSimulation();

    const prompt = DEFAULT_PROMPT.replace("{contract}", contractText);

    try {
      const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`;
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });

      if (!res.ok) throw new Error(`API 调用失败: ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      let risksArray: any[] = [];
      let summaryText = "";
      
      const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      const objectMatch = cleaned.match(/\{[\s\S]*\}/);
      
      if (arrayMatch) {
        try {
          const arr = JSON.parse(arrayMatch[0]);
          if (Array.isArray(arr)) risksArray = arr;
        } catch {}
      }
      
      if (risksArray.length === 0 && objectMatch) {
        try {
          const obj = JSON.parse(objectMatch[0]);
          risksArray = obj.risks || [];
          summaryText = obj.summary || "";
        } catch {}
      }
      
      if (risksArray.length === 0) throw new Error("AI 未返回有效 JSON");

      const splitSuggestion = (raw: string): { analysis: string; suggestion: string } => {
        const markers = [
          /建议修改为[：:]\s*/, /修改后[的]?条款[：:]\s*/, /修改后[：:]\s*/,
          /优化后[的]?条款[：:]\s*/, /优化后[：:]\s*/, /替换为[：:]\s*/,
          /改为[：:]\s*/, /调整为[：:]\s*/,
        ];
        for (const marker of markers) {
          const match = raw.match(marker);
          if (match && match.index !== undefined) {
            const analysisPart = raw.slice(0, match.index).trim();
            const suggestionPart = raw.slice(match.index + match[0].length).trim();
            if (suggestionPart.length > 0) return { analysis: analysisPart, suggestion: suggestionPart };
          }
        }
        return { analysis: "", suggestion: raw };
      };

      const apiRisks: RiskItem[] = risksArray.map((r: any, i: number) => {
        const excerpt = r.excerpt || r.original_text || "";
        const idx = contractText.indexOf(excerpt);
        const rawSuggestion = r.suggestion || "";
        const rawAnalysis = r.analysis || "";
        const { analysis: extractedAnalysis, suggestion: cleanSuggestion } = splitSuggestion(rawSuggestion);
        return {
          id: `risk-api-${i}`,
          level: (["high", "medium", "info"].includes(r.level || r.risk_level) ? (r.level || r.risk_level) : "info") as RiskItem["level"],
          title: r.title || r.risk_type || "未知风险",
          excerpt,
          analysis: rawAnalysis || extractedAnalysis,
          suggestion: cleanSuggestion,
          excerptStart: idx,
          excerptEnd: idx !== -1 ? idx + excerpt.length : -1,
        };
      });

      stopProgress();
      setRisks(apiRisks);
      setSummary(summaryText || "审查完成");
      setHasResult(true);
    } catch (err: any) {
      toast({ title: "AI 审计失败", description: err.message, variant: "destructive" });
      stopProgress();
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="ambient-orb w-[600px] h-[600px] -top-40 -right-40 opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(199 89% 48%), transparent)" }} />
      <div className="ambient-orb w-[500px] h-[500px] bottom-0 -left-20 opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(217 91% 60%), transparent)" }} />
      <div className="noise-overlay" />

      <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-5 border-b border-border/50 glass-card">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>
        <div className="h-5 w-px bg-border" />
        <Shield className="w-4 h-4 text-primary" />
        <h1 className="font-display font-semibold text-sm">法务合同排雷助手</h1>
      </header>

      <div className="relative z-10 h-[calc(100vh-3.5rem)] flex flex-col">
        {isAuditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-muted-foreground">AI 正在逐字核对合同条款…</span>
              <span className="text-xs text-primary font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </motion.div>
        )}

        {!hasResult ? (
          <div className="flex-1 p-5 min-h-0">
            <ContractInput
              contractText={contractText}
              setContractText={setContractText}
              onStartAudit={handleStartAudit}
              isAuditing={isAuditing}
            />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex-1 p-5 min-h-0">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setHasResult(false); setRisks([]); setSummary(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                ← 返回编辑
              </button>
              <button
                onClick={handleStartAudit}
                disabled={isAuditing}
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                🔄 重新审计
              </button>
            </div>
            <AuditResultPanel
              contractText={contractText}
              risks={risks}
              summary={summary}
              onUpdateText={setContractText}
              onUpdateRisks={setRisks}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContractAudit;
