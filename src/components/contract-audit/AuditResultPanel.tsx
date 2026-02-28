import { useRef, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Info, Copy, CheckCheck, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { RiskItem, RiskLevel } from "./types";

const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  high: {
    label: "高危",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
  },
  medium: {
    label: "瑕疵",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    icon: <Shield className="w-4 h-4 text-amber-400" />,
  },
  info: {
    label: "提示",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: <Info className="w-4 h-4 text-blue-400" />,
  },
};

// Highlight colors for original text
const HIGHLIGHT_BG: Record<RiskLevel, string> = {
  high: "bg-red-500/25 border-b-2 border-red-500 text-red-200 rounded-sm",
  medium: "bg-amber-500/25 border-b-2 border-amber-500 text-amber-200 rounded-sm",
  info: "bg-blue-500/25 border-b-2 border-blue-500 text-blue-200 rounded-sm",
};

interface Props {
  contractText: string;
  risks: RiskItem[];
  summary: string;
}

const AuditResultPanel = ({ contractText, risks, summary }: Props) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "已复制到剪贴板" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToHighlight = useCallback((riskId: string) => {
    setActiveRiskId(riskId);
    const el = textRef.current?.querySelector(`[data-risk-id="${riskId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // Build highlighted text segments
  const renderHighlightedText = () => {
    if (!risks.length) {
      return <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/80">{contractText}</p>;
    }

    // Find excerpts in the text and build segments
    const highlights: { start: number; end: number; risk: RiskItem }[] = [];
    for (const risk of risks) {
      const idx = contractText.indexOf(risk.excerpt);
      if (idx !== -1) {
        highlights.push({ start: idx, end: idx + risk.excerpt.length, risk });
      }
    }
    highlights.sort((a, b) => a.start - b.start);

    if (highlights.length === 0) {
      return <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/80">{contractText}</p>;
    }

    const segments: React.ReactNode[] = [];
    let cursor = 0;

    for (const h of highlights) {
      if (h.start > cursor) {
        segments.push(
          <span key={`t-${cursor}`} className="whitespace-pre-wrap">
            {contractText.slice(cursor, h.start)}
          </span>
        );
      }
      const isActive = activeRiskId === h.risk.id;
      segments.push(
        <span
          key={h.risk.id}
          data-risk-id={h.risk.id}
          className={`inline whitespace-pre-wrap px-1.5 py-1 transition-all duration-300 cursor-pointer ${HIGHLIGHT_BG[h.risk.level]} ${
            isActive ? "ring-2 ring-primary/60 shadow-lg shadow-primary/20 scale-[1.02]" : "hover:opacity-80"
          }`}
        >
          {contractText.slice(h.start, h.end)}
        </span>
      );
      cursor = h.end;
    }

    if (cursor < contractText.length) {
      segments.push(
        <span key={`t-${cursor}`} className="whitespace-pre-wrap">
          {contractText.slice(cursor)}
        </span>
      );
    }

    return <div className="text-sm leading-7 text-foreground/80">{segments}</div>;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Left: Original text with highlights */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">原文视图</h3>
          {summary && (
            <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
              {summary}
            </span>
          )}
        </div>
        <div
          ref={textRef}
          className="flex-1 overflow-y-auto rounded-xl glass-card p-5 min-h-0"
          style={{ maxHeight: "calc(100vh - 14rem)" }}
        >
          {renderHighlightedText()}
        </div>
      </div>

      {/* Right: Risk cards */}
      <div className="w-full lg:w-[420px] flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">风险清单与建议</h3>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {risks.length} 项
          </Badge>
        </div>
        <div
          className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0"
          style={{ maxHeight: "calc(100vh - 14rem)" }}
        >
          <AnimatePresence>
            {risks.map((risk, i) => {
              const config = LEVEL_CONFIG[risk.level];
              const isActive = activeRiskId === risk.id;
              return (
                <motion.div
                  key={risk.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => scrollToHighlight(risk.id)}
                  className={`group rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden ${config.borderColor} ${config.bgColor} ${
                    isActive ? "ring-2 ring-primary/40 shadow-lg" : "hover:shadow-md"
                  }`}
                >
                  {/* Card header */}
                  <div className="px-4 pt-4 pb-2 flex items-start gap-3">
                    <div className={`mt-0.5 p-1.5 rounded-lg ${config.bgColor}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                          {config.label}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground truncate">{risk.title}</h4>
                      </div>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-background/40 border border-border/30">
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{risk.excerpt}"
                    </p>
                  </div>

                  {/* Suggestion */}
                  <div className="mx-4 mb-3">
                    <p className="text-xs font-medium text-foreground/70 mb-1">💡 修改建议</p>
                    <p className="text-xs text-foreground/60 leading-relaxed">
                      {risk.suggestion}
                    </p>
                  </div>

                  {/* Copy button */}
                  <div className="px-4 pb-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(risk.suggestion, risk.id);
                      }}
                    >
                      {copiedId === risk.id ? (
                        <><CheckCheck className="w-3 h-3 text-primary" /> 已复制</>
                      ) : (
                        <><Copy className="w-3 h-3" /> 一键复制建议</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuditResultPanel;
