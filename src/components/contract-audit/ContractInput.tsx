import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FileText, Upload, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  contractText: string;
  setContractText: (t: string) => void;
  onStartAudit: () => void;
  isAuditing: boolean;
}

const ContractInput = ({ contractText, setContractText, onStartAudit, isAuditing }: Props) => {
  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      if (file.type === "text/plain") {
        const text = await file.text();
        setContractText(text);
        toast({ title: "文件已加载", description: file.name });
        return;
      }

      // For PDF/Word, try reading as text (limited in browser)
      try {
        const text = await file.text();
        if (text.trim()) {
          setContractText(text);
          toast({ title: "文件已加载", description: file.name });
        } else {
          toast({ title: "暂不支持该格式", description: "请粘贴合同纯文本内容", variant: "destructive" });
        }
      } catch {
        toast({ title: "文件读取失败", description: "请直接粘贴合同文本", variant: "destructive" });
      }
    },
    [setContractText]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">合同文本输入</h2>
      </div>

      <div
        {...getRootProps()}
        className={`relative flex-1 rounded-xl border-2 border-dashed transition-all duration-300 ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/30"
        }`}
      >
        <input {...getInputProps()} />
        <textarea
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
          placeholder="在此粘贴合同文本内容，或将文件拖拽至此区域..."
          className="w-full h-full bg-transparent rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none font-mono leading-relaxed"
        />

        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-xl backdrop-blur-sm z-10">
            <div className="text-center">
              <Upload className="w-10 h-10 text-primary mx-auto mb-2 animate-bounce" />
              <p className="text-sm text-primary font-medium">释放文件以导入</p>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {!contractText && !isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-30">
              <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">拖拽 Word / PDF / TXT 文件到此处</p>
              <p className="text-xs text-muted-foreground mt-1">或直接 Ctrl+V 粘贴合同文本</p>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onStartAudit}
        disabled={!contractText.trim() || isAuditing}
        className="mt-4 h-11 text-sm font-semibold gap-2 rounded-xl shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.6)] transition-all duration-300"
      >
        {isAuditing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 正在逐字核对…
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            开始 AI 审计
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default ContractInput;
