/**
 * PDF engine using jsPDF.
 * Generates true A4 cheat sheets with multi-column layout.
 */

import type { CheatMode, QAPair } from "./cheatTypes";

// jsPDF is loaded globally via CDN
declare const jspdf: { jsPDF: new (options: object) => JsPDFInstance };

interface JsPDFInstance {
  setFontSize(size: number): void;
  setFont(font: string, style?: string): void;
  setTextColor(r: number, g: number, b: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  setLineWidth(width: number): void;
  rect(x: number, y: number, w: number, h: number, style?: string): void;
  text(text: string | string[], x: number, y: number, options?: object): void;
  addImage(
    imageData: string,
    format: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  splitTextToSize(text: string, maxWidth: number): string[];
  save(filename: string): void;
  addPage(): void;
  internal: { pageSize: { width: number; height: number } };
  getNumberOfPages(): number;
  setPage(page: number): void;
}

export interface PDFOptions {
  title: string;
  pairs: QAPair[];
  mode: CheatMode;
  watermark?: string;
  footerText?: string;
  qrDataUrl?: string | null;
  studentName?: string;
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 5;
const COLS = 4;

export async function generatePDF(options: PDFOptions): Promise<void> {
  const { title, pairs, mode, watermark, footerText, qrDataUrl, studentName } =
    options;

  if (typeof jspdf === "undefined") {
    throw new Error("jsPDF not loaded");
  }

  const doc = new jspdf.jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const contentW = PAGE_W - MARGIN * 2;
  const colW = contentW / COLS;

  // Font sizes based on mode
  const qFontSize =
    mode === "ultra-compact" ? 5.5 : mode === "handwriting" ? 7 : 6.5;
  const aFontSize =
    mode === "ultra-compact" ? 4.5 : mode === "handwriting" ? 6 : 5.5;
  const lineH_q = mode === "ultra-compact" ? 1.8 : 2.5;
  const lineH_a = mode === "ultra-compact" ? 1.6 : 2.2;
  const cellPad = mode === "ultra-compact" ? 1 : 1.5;

  // Draw background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Draw watermark
  if (watermark?.trim()) {
    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.text(watermark, PAGE_W / 2, PAGE_H / 2, {
      angle: 35,
      align: "center",
    });
  }

  // Draw title strip at top
  doc.setFillColor(10, 10, 26);
  doc.rect(MARGIN, MARGIN, contentW, 6, "F");
  doc.setFontSize(7);
  doc.setTextColor(0, 220, 255);
  doc.text(title || "Micro Cheat Sheet", MARGIN + 1, MARGIN + 4);

  if (studentName) {
    doc.setTextColor(200, 200, 255);
    doc.text(`Student: ${studentName}`, MARGIN + contentW / 2, MARGIN + 4, {
      align: "center",
    });
  }

  // QR code in top-right
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", PAGE_W - MARGIN - 14, MARGIN, 14, 14);
    } catch {
      // ignore QR errors
    }
  }

  // Layout pairs into columns
  // biome-ignore lint/correctness/noUnusedVariables: page counter used for multi-page tracking
  let page = 1;
  const startY = MARGIN + 8;
  const endY = PAGE_H - MARGIN - (footerText ? 6 : 3);

  // Track column positions
  const colX = (col: number) => MARGIN + col * colW;
  let currentCol = 0;
  let currentY = startY;

  const activePairs = pairs.filter((p) => p.question.trim() || p.answer.trim());

  for (const pair of activePairs) {
    if (!pair.question.trim() && !pair.answer.trim()) continue;

    // Calculate required height
    doc.setFontSize(qFontSize);
    const qLines = doc.splitTextToSize(
      `Q: ${pair.question}`,
      colW - cellPad * 2,
    );
    doc.setFontSize(aFontSize);
    const aLines = doc.splitTextToSize(`A: ${pair.answer}`, colW - cellPad * 2);

    const qH = qLines.length * lineH_q;
    const aH = aLines.length * lineH_a;
    const cellH = qH + aH + cellPad * 2 + 1;

    // Check if cell fits in current column
    if (currentY + cellH > endY) {
      currentCol++;
      currentY = startY;

      if (currentCol >= COLS) {
        // New page
        doc.addPage();
        page++;
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, PAGE_W, PAGE_H, "F");
        if (watermark?.trim()) {
          doc.setFontSize(40);
          doc.setTextColor(200, 200, 200);
          doc.text(watermark, PAGE_W / 2, PAGE_H / 2, {
            angle: 35,
            align: "center",
          });
        }
        currentCol = 0;
        currentY = MARGIN + 3;
      }
    }

    const x = colX(currentCol);
    const y = currentY;

    // Cell border
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.1);
    doc.rect(x + 0.3, y, colW - 0.6, cellH, "S");

    // Question text
    doc.setFontSize(qFontSize);
    doc.setTextColor(30, 30, 160);
    doc.text(qLines, x + cellPad, y + cellPad + lineH_q * 0.7);

    // Answer text
    doc.setFontSize(aFontSize);
    doc.setTextColor(40, 40, 40);
    doc.text(aLines, x + cellPad, y + cellPad + qH + lineH_a * 0.7);

    currentY += cellH + 0.5;
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(4.5);
    doc.setTextColor(150, 150, 180);
    const footerY = PAGE_H - MARGIN + 1;
    const customFooter = footerText?.trim() ? `${footerText} | ` : "";
    doc.text(
      `${customFooter}Generated by AJIT BHAI's Micro Cheat Generator | Page ${p}/${totalPages}`,
      PAGE_W / 2,
      footerY,
      { align: "center" },
    );
  }

  doc.save(`cheat-${title || "sheet"}-${Date.now()}.pdf`);
}
