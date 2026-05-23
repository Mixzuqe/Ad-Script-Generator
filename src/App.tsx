import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Play, Copy, Loader2, Sparkles, Check, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2pdf from 'html2pdf.js';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const scriptRef = useRef<HTMLDivElement>(null);

  // History State
  const [history, setHistory] = useState<{ id: string; product: string; script: string; timestamp: number }[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  // Form State
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState('TikTok/Reels');
  const [tone, setTone] = useState('Persuasive & Energetic');
  const [language, setLanguage] = useState('Indonesian');
  const [usp, setUsp] = useState('');
  const [avoidKeywords, setAvoidKeywords] = useState('');
  const [includeVisualCues, setIncludeVisualCues] = useState(true);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product,
          audience,
          platform,
          tone,
          language,
          usp,
          avoidKeywords,
          includeVisualCues
        })
      });

      const data = await res.json();
      if (res.ok) {
        const newId = Date.now().toString();
        const newItem = {
          id: newId,
          product,
          script: data.script,
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev]);
        setActiveVersionId(newId);
        setResult(data.script);
      } else {
        alert(data.error || 'Failed to generate script');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPDF = async () => {
    if (!scriptRef.current) return;
    setIsExporting(true);
    try {
      const opt = {
        margin:       0.5,
        filename:     'ad-script.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(scriptRef.current).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A] font-sans selection:bg-[#FF4F00] selection:text-white flex flex-col md:flex-row">
      {/* LEFT PANEL - FORM */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#E5E0D8]">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEAE0] text-[#FF4F00] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3" />
            Ad Script Generator
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[0.9] mb-6">
            Bikin <br />
            script iklan <br />
            <span className="text-[#FF4F00]">10x lebih cepat.</span>
          </h1>
          
          <p className="text-lg text-[#666] mb-12 max-w-md">
            "Kamu masih nulis script iklan manual? Gue bikin yang sama dalam 8 detik."
          </p>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-[#666]">
                Jualan Apa? (Product/Service) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Contoh: Sepatu lari ringan dengan sol empuk anti-selip, warna neon."
                className="w-full bg-white border border-[#E5E0D8] rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:border-transparent transition-all resize-none shadow-sm text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#666]">
                  Target Market
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Cth: Gen Z, Pekerja Kantoran..."
                  className="w-full bg-white border border-[#E5E0D8] rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#666]">
                  Platform
                </label>
                <div className="relative">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4F00] transition-all shadow-sm pr-10"
                  >
                    <option value="TikTok/Reels">TikTok / IG Reels</option>
                    <option value="Instagram Feed">Instagram Feed</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#666]">
                  Tone & Gaya Bahasa
                </label>
                <div className="relative">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4F00] transition-all shadow-sm pr-10"
                  >
                    {['Persuasive & Energetic', 'Lucu / Komedi', 'Profesional', 'Storytelling (Soft Selling)', 'Fear of Missing Out (FOMO)', 'Humorous', 'Inspirational', 'Informative'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#666]">
                  Output Language
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4F00] transition-all shadow-sm pr-10"
                  >
                    <option value="Indonesian">Indonesian</option>
                    <option value="English">English</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-[#666]">
                Unique Selling Point / Keunggulan (Opsional)
              </label>
              <textarea
                value={usp}
                onChange={(e) => setUsp(e.target.value)}
                placeholder="Cth: Gratis ongkir, garansi seumur hidup, bahan ramah lingkungan"
                className="w-full bg-white border border-[#E5E0D8] rounded-xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#FF4F00] transition-all resize-none shadow-sm text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-[#666]">
                Kata/Frasa yang Dihindari (Opsional)
              </label>
              <textarea
                value={avoidKeywords}
                onChange={(e) => setAvoidKeywords(e.target.value)}
                placeholder="Cth: murah, murahan, diskon gila-gilaan"
                className="w-full bg-white border border-[#E5E0D8] rounded-xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#FF4F00] transition-all resize-none shadow-sm text-base"
              />
            </div>

            <div className="flex items-center gap-3 bg-white border border-[#E5E0D8] rounded-xl p-4 shadow-sm">
              <input
                type="checkbox"
                id="visualCues"
                checked={includeVisualCues}
                onChange={(e) => setIncludeVisualCues(e.target.checked)}
                className="w-5 h-5 accent-[#FF4F00] cursor-pointer"
              />
              <label htmlFor="visualCues" className="text-sm font-bold text-[#1A1A1A] cursor-pointer select-none">
                Sertakan Visual Cues / Ide Storyboard
                <p className="text-xs font-normal text-[#666] mt-0.5">Berikan panduan visual/adegan untuk tim produksi video</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !product.trim()}
              className="w-full flex items-center justify-center gap-3 bg-[#FF4F00] hover:bg-[#E64700] text-white rounded-xl p-5 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(255,79,0,0.25)] hover:shadow-[0_12px_24px_rgba(255,79,0,0.3)] mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Mikir dalam 8 detik...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  Generate Script Sekarang
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL - RESULT */}
      <div className="w-full md:w-1/2 bg-white relative overflow-hidden flex flex-col">
        {/* Decorative Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ 
            backgroundImage: `linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }}
        />

        <div className="flex-1 p-8 md:p-12 lg:p-20 relative flex flex-col">
          <AnimatePresence mode="wait">
            {!loading && !result && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-40"
              >
                <div className="w-24 h-24 mb-6 rounded-3xl bg-[#F5F2EC] border-2 border-dashed border-[#D1CCC2] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#A39E93]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Belum ada script</h3>
                <p className="text-sm">Isi form di samping dan klik generate untuk melihat keajaiban dalam 8 detik.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-[#F5F2EC]" />
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-[#FF4F00]"
                    style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-3xl text-[#FF4F00]">
                    8s
                  </div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Sedang meracik kata...</h3>
                <p className="text-[#666] animate-pulse">AI copywriter kami sedang bekerja.</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="flex items-center justify-between xl:mb-6 mb-4 bg-white/80 backdrop-blur pb-4 border-b border-[#E5E0D8] sticky top-0 z-10 pt-2">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <span className="w-2 h-8 bg-[#FF4F00] rounded-full inline-block" />
                      Hasil Script
                    </h2>
                    {result && (
                      <p className="text-sm font-medium text-[#666] mt-1 ml-4 pl-0.5">
                        {(() => {
                           const words = result.trim().split(/\s+/).filter(Boolean).length;
                           const seconds = Math.round((words / 150) * 60);
                           const timeString = seconds < 60 ? `~${seconds} detik` : `~${Math.floor(seconds/60)} mnt ${seconds%60} dtk`;
                           return `${words} kata • Estimasi durasi: ${timeString}`;
                        })()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#E5E0D8] rounded-full hover:bg-[#F5F2EC] hover:border-[#D1CCC2] transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white border border-transparent rounded-full hover:bg-[#333] transition-colors text-sm font-bold shadow-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Tercopy!' : 'Copy Script'}
                    </button>
                  </div>
                </div>

                {history.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar shrink-0">
                    {history.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveVersionId(item.id);
                          setResult(item.script);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-sm cursor-pointer",
                          activeVersionId === item.id 
                            ? "bg-[#1A1A1A] text-white" 
                            : "bg-[#F5F2EC] text-[#666] border border-[#E5E0D8] hover:bg-[#E5E0D8]"
                        )}
                      >
                        Versi {history.length - idx}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="prose prose-lg pr-4 xl:pr-8 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#FF4F00] prose-p:leading-relaxed prose-strong:text-[#1A1A1A] max-w-none overflow-y-auto custom-scrollbar flex-1 pb-20">
                  <div ref={scriptRef} className="bg-white p-4 sm:p-2">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
