import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Briefcase, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import JobSidebar from "@/components/resume-screening/JobSidebar";
import CandidateBoard from "@/components/resume-screening/CandidateBoard";
import InsightPanel from "@/components/resume-screening/InsightPanel";
import type { Job, Candidate } from "@/components/resume-screening/types";

const ResumeScreening = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem("rs-jobs");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    const saved = localStorage.getItem("rs-active-job");
    return saved || null;
  });
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem("rs-candidates");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"jobs" | "candidates" | "insight">("jobs");

  useEffect(() => { localStorage.setItem("rs-jobs", JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { if (activeJobId) localStorage.setItem("rs-active-job", activeJobId); }, [activeJobId]);
  useEffect(() => { localStorage.setItem("rs-candidates", JSON.stringify(candidates)); }, [candidates]);

  const activeJob = jobs.find((j) => j.id === activeJobId) || null;
  const jobCandidates = candidates.filter((c) => c.jobId === activeJobId);
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || null;

  // Mobile: auto-navigate views
  const handleSelectJob = (id: string | null) => {
    setActiveJobId(id);
    if (id && isMobile) setMobileView("candidates");
  };

  const handleSelectCandidate = (id: string | null) => {
    setSelectedCandidateId(id);
    if (id && isMobile) setMobileView("insight");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="ambient-orb w-[600px] h-[600px] -top-40 -left-40 opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(199 89% 48%), transparent)" }} />
      <div className="ambient-orb w-[500px] h-[500px] bottom-0 right-0 opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(217 91% 60%), transparent)" }} />
      <div className="noise-overlay" />

      <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-4 sm:px-5 border-b border-border/50 glass-card">
        {isMobile && mobileView !== "jobs" ? (
          <button
            onClick={() => setMobileView(mobileView === "insight" ? "candidates" : "jobs")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            返回
          </button>
        ) : (
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回首页</span>
          </button>
        )}
        <div className="h-5 w-px bg-border" />
        <h1 className="font-display font-semibold text-sm truncate">AI 简历速筛看板</h1>
      </header>

      {/* Desktop layout */}
      {!isMobile ? (
        <div className="flex h-[calc(100vh-3.5rem)] relative z-10">
          <JobSidebar jobs={jobs} setJobs={setJobs} activeJobId={activeJobId} setActiveJobId={setActiveJobId} />
          <CandidateBoard
            activeJob={activeJob}
            candidates={jobCandidates}
            setCandidates={setCandidates}
            allCandidates={candidates}
            setAllCandidates={setCandidates}
            onSelectCandidate={setSelectedCandidateId}
            selectedCandidateId={selectedCandidateId}
          />
          <AnimatePresence>
            {selectedCandidate && (
              <InsightPanel
                candidate={selectedCandidate}
                onClose={() => setSelectedCandidateId(null)}
                onUpdateCandidate={(updated) => {
                  setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Mobile layout: single view at a time */
        <div className="h-[calc(100vh-3.5rem)] relative z-10">
          {mobileView === "jobs" && (
            <JobSidebar jobs={jobs} setJobs={setJobs} activeJobId={activeJobId} setActiveJobId={handleSelectJob} isMobile />
          )}
          {mobileView === "candidates" && (
            <CandidateBoard
              activeJob={activeJob}
              candidates={jobCandidates}
              setCandidates={setCandidates}
              allCandidates={candidates}
              setAllCandidates={setCandidates}
              onSelectCandidate={handleSelectCandidate}
              selectedCandidateId={selectedCandidateId}
            />
          )}
          {mobileView === "insight" && selectedCandidate && (
            <InsightPanel
              candidate={selectedCandidate}
              onClose={() => { setSelectedCandidateId(null); setMobileView("candidates"); }}
              onUpdateCandidate={(updated) => {
                setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeScreening;
