"use client";

import { Download } from "lucide-react";

interface PdfPreviewProps {
  pdfUrl: string | null;
  loading: boolean;
}

export function PdfPreview({ pdfUrl, loading }: PdfPreviewProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        Generating PDF...
      </div>
    );
  }

  if (!pdfUrl) return null;

  return (
    <a
      href={pdfUrl}
      download="tailored-resume.pdf"
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
    >
      <Download className="h-4 w-4" />
      Download Tailored PDF
    </a>
  );
}
