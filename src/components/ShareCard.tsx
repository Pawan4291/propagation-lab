import { useRef, useState } from "react";

export function ShareCard({
  headline,
  resultLine,
  network,
}: {
  headline: string;
  resultLine: string;
  network: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  async function draw(): Promise<HTMLCanvasElement> {
    const canvas = canvasRef.current!;
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d")!;

    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, "#d3d6dc");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = "#050506";
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, 1152, 582);

    try {
      const img = new Image();
      img.src = "/mascot.png";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      ctx.drawImage(img, 900, 340, 240, 240);
    } catch {
      /* mascot optional on canvas */
    }

    ctx.fillStyle = "#050506";
    ctx.font = "600 26px sans-serif";
    ctx.fillText("Propagation Lab — community build", 64, 90);

    ctx.font = "700 56px sans-serif";
    wrapText(ctx, headline, 64, 200, 760, 60);

    ctx.font = "500 34px monospace";
    ctx.fillText(resultLine, 64, 320);

    ctx.font = "400 24px sans-serif";
    ctx.fillText(`Network: ${network}`, 64, 420);
    ctx.fillText(`UTC: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`, 64, 460);

    return canvas;
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = w + " ";
        curY += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, curY);
  }

  async function handleDownload() {
    const canvas = await draw();
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "propagation-lab-result.png";
    a.click();
  }

  async function handleCopy() {
    const text = `${headline} — ${resultLine} (${network}) · Propagation Lab, a community build, not affiliated with Optimum.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mt-6 border-t border-[var(--color-line)] pt-4">
      <p className="text-sm font-semibold">Share your result</p>
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={handleDownload} className="btn-secondary px-4 py-1.5 text-xs">
          Download PNG
        </button>
        <button onClick={handleCopy} className="btn-secondary px-4 py-1.5 text-xs">
          {copied ? "Copied!" : "Copy text"}
        </button>
      </div>
    </div>
  );
}
