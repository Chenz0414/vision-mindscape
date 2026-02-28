import { motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Ban, Clock, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreRing from "./ScoreRing";
import type { Candidate } from "./types";

interface Props {
  candidate: Candidate;
  onClose: () => void;
  onUpdateCandidate: (c: Candidate) => void;
}

const InsightPanel = ({ candidate, onClose, onUpdateCandidate }: Props) => {
  const isLoading = candidate.status !== "done" && candidate.status !== "error";

  const setDecision = (decision: Candidate["decision"]) => {
    onUpdateCandidate({ ...candidate, decision });
  };

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="w-96 flex-shrink-0 border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        <h3 className="font-display font-semibold text-sm">AI 深度洞察</h3>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {isLoading ? (
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <p className="text-xs text-primary animate-pulse text-center">AI 正在深度解析简历结构...</p>
          </div>
        ) : (
          <>
            {/* Profile */}
            <div className="flex items-center gap-4">
              <ScoreRing score={candidate.score} size={64} />
              <div>
                <h4 className="font-display font-semibold text-lg">{candidate.name}</h4>
                <p className="text-xs text-muted-foreground">{candidate.fileName}</p>
                {candidate.aiSummary && (
                  <p className="text-xs text-muted-foreground mt-1">{candidate.aiSummary}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            {candidate.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {candidate.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Core Strengths */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                核心优势
              </h5>
              <div className="space-y-2">
                {candidate.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground/90">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            {candidate.risks.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  风险预警
                </h5>
                <div className="space-y-2">
                  {candidate.risks.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-orange-500/5 border border-orange-500/15">
                      <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/90">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action bar */}
      {!isLoading && candidate.status === "done" && (
        <div className="p-4 border-t border-border/50 flex items-center gap-2">
          <Button
            variant={candidate.decision === "rejected" ? "destructive" : "outline"}
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => setDecision("rejected")}
          >
            <Ban className="w-3.5 h-3.5" />
            淘汰
          </Button>
          <Button
            variant={candidate.decision === "pool" ? "default" : "outline"}
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => setDecision("pool")}
          >
            <Clock className="w-3.5 h-3.5" />
            待定
          </Button>
          <Button
            size="sm"
            className={`flex-1 gap-1.5 ${
              candidate.decision === "interview"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30"
            }`}
            onClick={() => setDecision("interview")}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            面试
          </Button>
        </div>
      )}
    </motion.aside>
  );
};

export default InsightPanel;
