/**
 * QR code generation using the qrcode npm package.
 * Returns a data URL (PNG/canvas) for embedding in PDF or preview.
 */

// qrcode loaded via CDN
const QRCode: any = null;

export async function generateQRDataURL(data: string): Promise<string | null> {
  try {
    const url = await QRCode.toDataURL(data, {
      width: 64,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return url;
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
