import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Job } from "./types";

interface Props {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  activeJobId: string | null;
  setActiveJobId: (id: string | null) => void;
}

const JobSidebar = ({ jobs, setJobs, activeJobId, setActiveJobId }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => {
    setEditingJob(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingJob(job);
    setName(job.name);
    setDescription(job.description);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingJob) {
      setJobs((prev) =>
        prev.map((j) => (j.id === editingJob.id ? { ...j, name, description } : j))
      );
    } else {
      const newJob: Job = {
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: new Date().toISOString(),
      };
      setJobs((prev) => [...prev, newJob]);
      setActiveJobId(newJob.id);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (activeJobId === id) setActiveJobId(null);
  };

  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r border-border/50 flex flex-col bg-card/30">
        <div className="p-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            招聘岗位
          </span>
          <Button size="icon" variant="ghost" onClick={openCreate} className="h-7 w-7">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {jobs.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-10 px-4">
              暂无岗位，点击上方 + 创建
            </p>
          )}
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ x: 2 }}
              onClick={() => setActiveJobId(job.id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                activeJobId === job.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary border border-transparent"
              }`}
            >
              <Briefcase className={`w-4 h-4 flex-shrink-0 ${activeJobId === job.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm truncate flex-1 ${activeJobId === job.id ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {job.name}
              </span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button onClick={(e) => openEdit(job, e)} className="p-1 hover:text-primary transition-colors">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={(e) => handleDelete(job.id, e)} className="p-1 hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingJob ? "编辑岗位" : "新建岗位"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">岗位名称</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：高级前端工程师" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">岗位描述 (JD)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="粘贴完整的岗位描述..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobSidebar;
