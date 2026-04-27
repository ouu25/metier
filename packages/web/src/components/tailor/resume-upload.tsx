"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import type { InputFormat } from "@metier/core";

interface ResumeUploadProps {
  onResumeReady: (content: string, format: InputFormat) => void;
}

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export function ResumeUpload({ onResumeReady }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const lowerName = file.name.toLowerCase();
      const isBinary = lowerName.endsWith(".pdf") || lowerName.endsWith(".docx");

      if (isBinary && file.size > MAX_FILE_BYTES) {
        setError(`File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please upload a PDF or DOCX under 4MB.`);
        return;
      }

      setFileName(file.name);

      if (lowerName.endsWith(".json")) {
        const text = await file.text();
        onResumeReady(text, "json");
        return;
      }

      if (lowerName.endsWith(".txt")) {
        const text = await file.text();
        onResumeReady(text, "text");
        return;
      }

      if (isBinary) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";

        for (const byte of bytes) {
          binary += String.fromCharCode(byte);
        }

        onResumeReady(
          btoa(binary),
          lowerName.endsWith(".pdf") ? "pdf" : "docx"
        );
      }
    },
    [onResumeReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePasteSubmit = useCallback(() => {
    if (pasteText.trim()) {
      try {
        JSON.parse(pasteText);
        onResumeReady(pasteText, "json");
      } catch {
        onResumeReady(pasteText, "text");
      }
    }
  }, [pasteText, onResumeReady]);

  if (mode === "paste") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Paste Resume</h3>
          <button
            onClick={() => setMode("upload")}
            className="text-xs text-blue-600 hover:underline"
          >
            Upload file instead
          </button>
        </div>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your resume text or JSON here..."
          rows={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handlePasteSubmit}
          disabled={!pasteText.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Use This Resume
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Upload Resume</h3>
        <button
          onClick={() => setMode("paste")}
          className="text-xs text-blue-600 hover:underline"
        >
          Paste text instead
        </button>
      </div>
      {fileName ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <FileText className="h-5 w-5 text-green-600" />
          <span className="flex-1 text-sm text-green-800">{fileName}</span>
          <button
            onClick={() => setFileName(null)}
            className="text-green-400 hover:text-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 hover:border-blue-400 transition cursor-pointer"
          onClick={() => document.getElementById("resume-file")?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            Drop a file here or <span className="text-blue-600">browse</span>
          </p>
          <p className="text-xs text-gray-400">PDF, DOCX, JSON, or plain text (max 4MB)</p>
          <input
            id="resume-file"
            type="file"
            accept=".pdf,.docx,.json,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
