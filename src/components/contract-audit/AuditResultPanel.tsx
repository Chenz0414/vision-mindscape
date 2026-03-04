import { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Info, Copy, CheckCheck, FileText, Wand2, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { RiskItem, RiskLevel } from "./types";

const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  high: { label: "高危", color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20", icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
  medium: { label: "瑕疵", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", icon: <Shield className="w-4 h-4 text-amber-400" /> },
  info: { label: "提示", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", icon: <Info className="w-4 h-4 text-blue-400" /> },
};

const HIGHLIGHT_BG: Record<RiskLevel, string> = {
  high: "bg-red-500/25 border-b-2 border-red-500 text-red-200 rounded-sm",
  medium: "bg-amber-500/25 border-b-2 border-amber-500 text-amber-200 rounded-sm",
  info: "bg-blue-500/25 border-b-2 border-blue-500 text-blue-200 rounded-sm",
};

interface Props {
  contractText: string;
  risks: RiskItem[];
  summary: string;
  onUpdateText: (newText: string) => void;
  onUpdateRisks: (newRisks: RiskItem[]) => void;
}

const AuditResultPanel = ({ contractText, risks, summary, onUpdateText, onUpdateRisks }: Props) => {
  const textRef = useRef<HTMLDivElement>(null);
  const riskListRef = useRef<HTMLDivElement>(null);
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"text" | "risks">("risks");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "已复制到剪贴板" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToHighlight = useCallback((riskId: string) => {
    setActiveRiskId(riskId);
    if (isMobile) setMobileTab("text");
    setTimeout(() => {
      const el = textRef.current?.querySelector(`[data-risk-id="${riskId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [isMobile]);

  const scrollToRiskCard = useCallback((riskId: string) => {
    setActiveRiskId(riskId);
    if (isMobile) setMobileTab("risks");
    setTimeout(() => {
      const el = riskListRef.current?.querySelector(`[data-card-id="${riskId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [isMobile]);

  // Fuzzy find excerpt in text
  const findExcerptInText = useCallback((text: string, excerpt: string): { start: number; end: number } | null => {
    if (!excerpt || excerpt.length < 4) return null;
    const exactIdx = text.indexOf(excerpt);
    if (exactIdx !== -1) return { start: exactIdx, end: exactIdx + excerpt.length };

    const normalize = (s: string) => s.replace(/\s+/g, "");
    const normText = normalize(text);
    const normExcerpt = normalize(excerpt);
    const normIdx = normText.indexOf(normExcerpt);
    if (normIdx !== -1) {
      let origStart = -1, origEnd = -1, normCursor = 0;
      for (let i = 0; i < text.length && origEnd === -1; i++) {
        if (/\s/.test(text[i])) continue;
        if (normCursor === normIdx) origStart = i;
        if (normCursor === normIdx + normExcerpt.length - 1) { origEnd = i + 1; break; }
        normCursor++;
      }
      if (origStart !== -1 && origEnd !== -1) return { start: origStart, end: origEnd };
    }

    const anchor = excerpt.slice(0, Math.min(15, excerpt.length)).replace(/\s+/g, "");
    if (anchor.length >= 4) {
      const normAnchorIdx = normText.indexOf(anchor);
      if (normAnchorIdx !== -1) {
        let origStart = -1, normCursor = 0;
        for (let i = 0; i < text.length; i++) {
          if (/\s/.test(text[i])) continue;
          if (normCursor === normAnchorIdx) { origStart = i; break; }
          normCursor++;
        }
        if (origStart !== -1) {
          const estimatedEnd = Math.min(text.length, origStart + excerpt.length + 20);
          return { start: origStart, end: estimatedEnd };
        }
      }
    }
    return null;
  }, []);

  // Apply a single risk's suggestion to the text, replacing the matched excerpt
  const applyRiskFix = useCallback((text: string, risk: RiskItem): { newText: string; applied: boolean } => {
    const match = findExcerptInText(text, risk.excerpt);
    if (!match) return { newText: text, applied: false };
    return { newText: text.slice(0, match.start) + risk.suggestion + text.slice(match.end), applied: true };
  }, [findExcerptInText]);

  // Handle "优化此项"
  const handleOptimizeSingle = useCallback((risk: RiskItem) => {
    const { newText, applied } = applyRiskFix(contractText, risk);
    if (!applied) {
      toast({ title: "无法定位原文", description: "未能在原文中匹配到该条款，请手动修改", variant: "destructive" });
      return;
    }
    onUpdateText(newText);
    onUpdateRisks(risks.filter(r => r.id !== risk.id));
    toast({ title: "已优化", description: `"${risk.title}" 已替换到原文中` });
  }, [contractText, risks, applyRiskFix, onUpdateText, onUpdateRisks]);

  // Handle "本次忽略"
  const handleIgnore = useCallback((riskId: string) => {
    onUpdateRisks(risks.filter(r => r.id !== riskId));
    toast({ title: "已忽略该项" });
  }, [risks, onUpdateRisks]);

  // Handle "一键优化" - apply all remaining risks
  const handleOptimizeAll = useCallback(() => {
    let currentText = contractText;
    let appliedCount = 0;
    // Sort by position descending so replacements don't shift indices
    const sorted = [...risks]
      .map(r => ({ risk: r, match: findExcerptInText(currentText, r.excerpt) }))
      .filter(item => item.match !== null)
      .sort((a, b) => b.match!.start - a.match!.start);

    for (const { risk, match } of sorted) {
      if (!match) continue;
      currentText = currentText.slice(0, match.start) + risk.suggestion + currentText.slice(match.end);
      appliedCount++;
    }

    if (appliedCount === 0) {
      toast({ title: "无法定位", description: "未能匹配到任何原文条款", variant: "destructive" });
      return;
    }
    onUpdateText(currentText);
    onUpdateRisks([]);
    toast({ title: "一键优化完成", description: `已将 ${appliedCount} 项建议应用到原文` });
  }, [contractText, risks, findExcerptInText, onUpdateText, onUpdateRisks]);

  // Build highlighted text segments
  const renderHighlightedText = () => {
    if (!risks.length) {
      return <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/80">{contractText}</p>;
    }

    const highlights: { start: number; end: number; risk: RiskItem }[] = [];
    for (const risk of risks) {
      const match = findExcerptInText(contractText, risk.excerpt);
      if (match) highlights.push({ start: match.start, end: match.end, risk });
    }
    highlights.sort((a, b) => a.start - b.start);
    const filtered: typeof highlights = [];
    let lastEnd = 0;
    for (const h of highlights) {
      if (h.start >= lastEnd) { filtered.push(h); lastEnd = h.end; }
    }

    if (filtered.length === 0) {
      return <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/80">{contractText}</p>;
    }

    const segments: React.ReactNode[] = [];
    let cursor = 0;
    for (const h of filtered) {
      if (h.start > cursor) {
        segments.push(<span key={`t-${cursor}`} className="whitespace-pre-wrap">{contractText.slice(cursor, h.start)}</span>);
      }
      const config = LEVEL_CONFIG[h.risk.level];
      const isActive = activeRiskId === h.risk.id;
      segments.push(
        <span
          key={h.risk.id}
          data-risk-id={h.risk.id}
          title={`${config.label}：${h.risk.title}`}
          onClick={() => scrollToRiskCard(h.risk.id)}
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
      segments.push(<span key={`t-${cursor}`} className="whitespace-pre-wrap">{contractText.slice(cursor)}</span>);
    }
    return <div className="text-sm leading-7 text-foreground/80">{segments}</div>;
  };

  const textPanel = (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">原文视图</h3>
        {summary && (
          <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full truncate max-w-[150px]">
            {summary}
          </span>
        )}
      </div>
      <div
        ref={textRef}
        className="flex-1 overflow-y-auto rounded-xl glass-card p-4 sm:p-5 min-h-0"
        style={{ maxHeight: isMobile ? "calc(100vh - 16rem)" : "calc(100vh - 14rem)" }}
      >
        {renderHighlightedText()}
      </div>
    </div>
  );

  const risksPanel = (
    <div className={`${isMobile ? "flex-1" : "w-full lg:w-[420px]"} flex flex-col min-h-0`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">风险清单与建议</h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {risks.length} 项
        </Badge>
      </div>

      {/* 一键优化 button */}
      {risks.length > 0 && (
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleOptimizeAll(); }}
          className="mb-3 gap-2 w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          一键优化全部（{risks.length} 项）
        </Button>
      )}

      <div
        ref={riskListRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0"
        style={{ maxHeight: isMobile ? "calc(100vh - 19rem)" : "calc(100vh - 17rem)" }}
      >
        <AnimatePresence>
          {risks.map((risk, i) => {
            const config = LEVEL_CONFIG[risk.level];
            const isActive = activeRiskId === risk.id;
            return (
              <motion.div
                key={risk.id}
                data-card-id={risk.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => scrollToHighlight(risk.id)}
                className={`group rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden ${config.borderColor} ${config.bgColor} ${
                  isActive ? "ring-2 ring-primary/40 shadow-lg" : "hover:shadow-md"
                }`}
              >
                {/* Card header */}
                <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex items-start gap-3">
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

                {/* Excerpt (原文) */}
                <div className="mx-3 sm:mx-4 mb-2 px-3 py-2 rounded-lg bg-background/40 border border-border/30">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">📄 原文</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{risk.excerpt}"
                  </p>
                </div>

                {/* Analysis (问题解析) */}
                {risk.analysis && (
                  <div className="mx-3 sm:mx-4 mb-2 px-3 py-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">🔍 问题解析</p>
                    <p className="text-xs text-foreground/60 leading-relaxed">
                      {risk.analysis}
                    </p>
                  </div>
                )}

                {/* Suggestion (改动建议) */}
                <div className="mx-3 sm:mx-4 mb-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-medium text-primary/70 mb-1">✏️ 改动建议</p>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {risk.suggestion}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="px-3 sm:px-4 pb-3 flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-[11px] gap-1.5 flex-1 min-w-[80px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptimizeSingle(risk);
                    }}
                  >
                    <Wand2 className="w-3 h-3" />
                    优化此项
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIgnore(risk.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                    忽略
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-foreground ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(risk.suggestion, risk.id);
                    }}
                  >
                    {copiedId === risk.id ? (
                      <><CheckCheck className="w-3 h-3 text-primary" /> 已复制</>
                    ) : (
                      <><Copy className="w-3 h-3" /> 复制</>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* Tab switcher */}
        <div className="flex border-b border-border/50 mb-3">
          <button onClick={() => setMobileTab("risks")}
            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${mobileTab === "risks" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
            风险清单 ({risks.length})
          </button>
          <button onClick={() => setMobileTab("text")}
            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${mobileTab === "text" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
            原文视图
          </button>
        </div>
        {mobileTab === "risks" ? risksPanel : textPanel}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {textPanel}
      {risksPanel}
    </div>
  );
};

export default AuditResultPanel;
