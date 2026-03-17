"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
}: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange(val ?? "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        readOnly,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        padding: { top: 16 },
      }}
    />
  );
}
