import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { LLMSettings } from "./types";

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

const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT);

  useEffect(() => {
    const saved = localStorage.getItem("rs-settings");
    if (saved) {
      const s: LLMSettings = JSON.parse(saved);
      setApiUrl(s.apiUrl);
      setApiKey(s.apiKey);
      setPromptTemplate(s.promptTemplate || DEFAULT_PROMPT);
    }
  }, [open]);

  const handleSave = () => {
    const settings: LLMSettings = { apiUrl, apiKey, promptTemplate };
    localStorage.setItem("rs-settings", JSON.stringify(settings));
    toast({ title: "设置已保存" });
    setOpen(false);
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="h-8 w-8">
        <Settings className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>大模型设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API 接口地址</label>
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API Key</label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                type="password"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Prompt 模板 <span className="text-muted-foreground/60">（使用 {"{jd}"} 和 {"{resume}"} 作为占位符）</span>
              </label>
              <Textarea
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存设置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsDialog;
