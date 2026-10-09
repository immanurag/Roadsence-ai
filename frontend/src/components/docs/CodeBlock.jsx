import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ code, language = "bash" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-xl bg-ink-900 text-ink-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-[11px] uppercase tracking-wide text-ink-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-[13px] leading-relaxed overflow-x-auto scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}
