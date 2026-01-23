"use client";

import { X, Share2, Copy, Download, MessageCircle, Instagram, Check, Link2, FileText } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ShareAyahDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  ayahNumber: number;
  ayahKey: string;
  textArabic?: string;
  translation?: string;
  note?: string;
}

export function ShareAyahDialog({
  isOpen,
  onClose,
  chapterName,
  ayahNumber,
  ayahKey,
  textArabic,
  translation,
  note,
}: ShareAyahDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [includeNote, setIncludeNote] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generateImage = useCallback(async () => {
    if (!textArabic || !translation) return;
    setIsGenerating(true);

    // Ensure fonts are loaded before drawing
    try {
      await Promise.all([
        document.fonts.load("bold 40px Inter"),
        document.fonts.load("italic 32px Inter"),
        document.fonts.load("italic 28px Inter"),
        document.fonts.load("80px Amiri"),
      ]);
    } catch (e) {
      console.warn("Fonts could not be loaded, using fallbacks", e);
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions for Instagram/WhatsApp Story (9:16)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0f172a"); // slate-900
    gradient.addColorStop(1, "#1e293b"); // slate-800
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Elements (Overlays)
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#10b981"; // emerald-500
    ctx.beginPath();
    ctx.arc(canvas.width, 0, 600, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, canvas.height, 400, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // App Branding
    ctx.font = "bold 40px Inter, sans-serif";
    ctx.fillStyle = "#10b981";
    ctx.textAlign = "center";
    ctx.fillText("Lumina Quran", canvas.width / 2, 100);

    // Surah & Ayah Info
    ctx.font = "600 36px Inter, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`QS. ${chapterName} : ${ayahNumber}`, canvas.width / 2, 160);

    // Arabic Text
    ctx.font = "80px 'Amiri', 'Traditional Arabic', serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.direction = "rtl";
    
    const maxWidth = canvas.width - 160;
    const arabicWords = textArabic.split(" ");
    let line = "";
    let lines = [];
    let y = 500;

    for (let n = 0; n < arabicWords.length; n++) {
      let testLine = line + arabicWords[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = arabicWords[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    ctx.textAlign = "center";
    lines.forEach((l) => {
      ctx.fillText(l, canvas.width / 2, y);
      y += 120;
    });

    // Separator
    y += 60;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, y);
    ctx.lineTo(canvas.width / 2 + 100, y);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.lineWidth = 4;
    ctx.stroke();
    y += 100;

    // Translation Text
    ctx.font = "italic 32px Inter, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.direction = "ltr";
    
    const cleanTranslation = translation.replace(/<(?:.|\n)*?>/gm, "");
    const translationWords = cleanTranslation.split(" ");
    line = "";
    lines = [];
    
    ctx.textAlign = "center";
    for (let n = 0; n < translationWords.length; n++) {
      let testLine = line + translationWords[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = translationWords[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    lines.forEach((l) => {
      ctx.fillText(l, canvas.width / 2, y);
      y += 50;
    });

    // Note Section
    if (includeNote && note) {
      y += 60;
      
      // Note Box
      ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
      const boxPadding = 40;
      const boxWidth = maxWidth;
      const boxX = (canvas.width - boxWidth) / 2;
      
      // Determine note lines first to calculate box height
      ctx.font = "italic 28px Inter, sans-serif";
      const noteWords = note.split(" ");
      let noteLine = "";
      let noteLines = [];
      
      for (let n = 0; n < noteWords.length; n++) {
        let testLine = noteLine + noteWords[n] + " ";
        let metrics = ctx.measureText(testLine);
        if (metrics.width > boxWidth - boxPadding * 2 && n > 0) {
          noteLines.push(noteLine);
          noteLine = noteWords[n] + " ";
        } else {
          noteLine = testLine;
        }
      }
      noteLines.push(noteLine);
      
      const boxHeight = noteLines.length * 40 + boxPadding * 2 + 60;
      
      // Draw rounded box
      const radius = 24;
      ctx.beginPath();
      ctx.moveTo(boxX + radius, y);
      ctx.lineTo(boxX + boxWidth - radius, y);
      ctx.quadraticCurveTo(boxX + boxWidth, y, boxX + boxWidth, y + radius);
      ctx.lineTo(boxX + boxWidth, y + boxHeight - radius);
      ctx.quadraticCurveTo(boxX + boxWidth, y + boxHeight, boxX + boxWidth - radius, y + boxHeight);
      ctx.lineTo(boxX + radius, y + boxHeight);
      ctx.quadraticCurveTo(boxX, y + boxHeight, boxX, y + boxHeight - radius);
      ctx.lineTo(boxX, y + radius);
      ctx.quadraticCurveTo(boxX, y, boxX + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Note Title
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillStyle = "#10b981";
      ctx.textAlign = "left";
      ctx.direction = "ltr";
      ctx.fillText("Catatan Saya:", boxX + boxPadding, y + boxPadding + 30);
      
      // Note Content
      ctx.font = "italic 28px Inter, sans-serif";
      ctx.fillStyle = "#e2e8f0";
      noteLines.forEach((l, i) => {
        ctx.fillText(l, boxX + boxPadding, y + boxPadding + 70 + (i * 40));
      });
      
      y += boxHeight;
    }

    // Footer
    ctx.font = "300 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.fillText("lumina-quran.vercel.app", canvas.width / 2, canvas.height - 100);

    const dataUrl = canvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
  }, [includeNote, textArabic, translation, note, chapterName, ayahNumber]);

  useEffect(() => {
    let isMounted = true;

    const runGeneration = async () => {
      if (isOpen && isMounted) {
        document.body.style.overflow = "hidden";
        await generateImage();
      }
    };

    if (isOpen) {
      runGeneration();
    } else {
      document.body.style.overflow = "unset";
      setPreviewUrl(null);
    }

    return () => {
      isMounted = false;
      document.body.style.overflow = "unset";
    };
  }, [isOpen, generateImage]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/share/${ayahKey.replace(":", "-")}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `lumina-quran-${ayahKey}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], `ayah-${ayahKey}.png`, { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `Ayah ${ayahKey}`,
          text: `Surah ${chapterName} Ayat ${ayahNumber}`,
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-x-4 top-[10%] bottom-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[800px] sm:h-[600px] bg-card border border-border rounded-3xl shadow-2xl z-[110] flex flex-col sm:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Preview Area */}
        <div className="flex-1 bg-muted/50 p-6 flex flex-col items-center justify-center relative min-h-[300px] sm:min-h-0">
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-background/50 backdrop-blur-md border border-border rounded-full text-[10px] font-bold uppercase tracking-wider">
              Preview Story
            </span>
          </div>
          
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Menyiapkan Gambar...</p>
            </div>
          ) : previewUrl ? (
            <div className="relative h-full aspect-[9/16] shadow-2xl rounded-lg overflow-hidden border border-border/50">
              <img src={previewUrl} alt="Ayah Preview" className="h-full object-contain" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Gagal memuat preview</p>
          )}
        </div>

        {/* Content & Actions */}
        <div className="w-full sm:w-[320px] bg-card border-l border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Bagikan</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {note && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pilihan Konten</p>
                <button
                  onClick={() => setIncludeNote(!includeNote)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                    includeNote 
                      ? "bg-primary/5 border-primary/50" 
                      : "bg-secondary border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      includeNote ? "bg-primary border-primary" : "border-muted-foreground"
                    )}>
                      {includeNote && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">Sertakan Catatan</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {note}
                      </p>
                    </div>
                  </div>
                  <FileText className={cn(
                    "w-4 h-4 transition-colors",
                    includeNote ? "text-primary" : "text-muted-foreground"
                  )} />
                </button>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Link Akses</p>
              <button
                onClick={handleCopyLink}
                className="w-full p-4 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Link2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm truncate font-medium">
                    {ayahKey ? `lumina/share/${ayahKey}` : 'Salin Link'}
                  </span>
                </div>
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                )}
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kirim ke Sosial Media</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleShare}
                  className="w-full py-4 px-6 rounded-2xl bg-[#E1306C] text-white hover:opacity-90 transition-all flex items-center gap-3 font-semibold text-sm active:scale-[0.98]"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram Story
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] text-white hover:opacity-90 transition-all flex items-center gap-3 font-semibold text-sm active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Status
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full py-4 px-6 rounded-2xl border border-border hover:bg-accent transition-all flex items-center gap-3 font-semibold text-sm active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" />
                  Simpan Gambar
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-auto">
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
              * Pada perangkat desktop, gunakan tombol Simpan Gambar lalu upload secara manual ke sosial media Anda.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
