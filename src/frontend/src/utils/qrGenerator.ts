/**
 * QR code generation using the qrcode-generator CDN library.
 * Returns a data URL (PNG) for embedding in PDF or preview.
 */

declare function qrcode(
  typeNumber: number,
  errorCorrectionLevel: string,
): {
  addData(data: string): void;
  make(): void;
  createDataURL(cellSize: number, margin: number): string;
  createImgTag(cellSize: number, margin: number): string;
};

export function generateQRDataURL(data: string): string | null {
  try {
    if (typeof qrcode === "undefined") return null;
    const qr = qrcode(0, "M");
    qr.addData(data);
    qr.make();
    return qr.createDataURL(2, 2);
  } catch {
    return null;
  }
}

export function generateQRContent(name: string): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Name: ${name}\nDate: ${date}\nTime: ${time}`;
}
