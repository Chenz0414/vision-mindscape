import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { ContractSettings } from "./types";
import { DEFAULT_PROMPT, STORAGE_KEY } from "./constants";

const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState("https://yunwu.ai/v1/chat/completions");
  const [apiKey, setApiKey] = useState("sk-EuxW4Jz0h2G8NPKNOznzOBu1ZPJ7NXodjLiszMYnqF14iftg");
  const [model, setModel] = useState("glm-4.7");
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const s: ContractSettings = JSON.parse(saved);
      setApiUrl(s.apiUrl);
      setApiKey(s.apiKey);
      setModel(s.model || "glm-4.7");
      setPromptTemplate(s.promptTemplate || DEFAULT_PROMPT);
    }
  }, [open]);

  const handleSave = () => {
    const settings: ContractSettings = { apiUrl, apiKey, model, promptTemplate };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast({ title: "设置已保存" });
    setOpen(false);
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-2 text-muted-foreground hover:text-foreground">
        <Settings className="w-4 h-4" />
        AI 模型配置
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AI 模型配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API 请求地址</label>
              <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.openai.com/v1/chat/completions" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API Key</label>
              <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." type="password" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">模型名称</label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o-mini" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Prompt 模板 <span className="text-muted-foreground/60">（使用 {"{contract}"} 作为合同文本占位符）</span>
              </label>
              <Textarea value={promptTemplate} onChange={(e) => setPromptTemplate(e.target.value)} rows={10} className="font-mono text-xs" />
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
