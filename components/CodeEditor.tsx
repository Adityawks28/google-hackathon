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
  const themeName = "UriCode";

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange(val ?? "")}
      theme={themeName}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme(themeName, {
          base: "vs",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#f5efee",
          },
        });
      }}
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
