"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlogRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function BlogRichEditor({
  value,
  onChange,
  placeholder = "Write your article…",
  className,
}: BlogRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !initialized.current && value) {
      editorRef.current.innerHTML = value;
      initialized.current = true;
    }
  }, [value]);

  const exec = useCallback((command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {[
          { icon: Bold, cmd: "bold", title: "Bold" },
          { icon: Italic, cmd: "italic", title: "Italic" },
          { icon: Heading2, cmd: "formatBlock", arg: "h2", title: "Heading" },
          { icon: List, cmd: "insertUnorderedList", title: "Bullet list" },
          { icon: ListOrdered, cmd: "insertOrderedList", title: "Numbered list" },
          { icon: Quote, cmd: "formatBlock", arg: "blockquote", title: "Quote" },
        ].map(({ icon: Icon, cmd, arg, title }) => (
          <Button
            key={title}
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              exec(cmd, arg);
            }}
          >
            <Icon className="size-4" />
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" className="size-8 p-0" title="Link" onMouseDown={(e) => { e.preventDefault(); addLink(); }}>
          <Link2 className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="size-8 p-0" title="Undo" onMouseDown={(e) => { e.preventDefault(); exec("undo"); }}>
          <Undo className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="size-8 p-0" title="Redo" onMouseDown={(e) => { e.preventDefault(); exec("redo"); }}>
          <Redo className="size-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="prose prose-slate min-h-[320px] max-w-none p-4 focus:outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
        data-placeholder={placeholder}
        onInput={handleInput}
      />
    </div>
  );
}
