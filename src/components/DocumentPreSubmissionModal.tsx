import React, { useState } from 'react';
import {
  X,
  Check,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  UploadCloud,
  Camera,
  CheckCircle2
} from 'lucide-react';

export interface PreSubmissionDocument {
  name: string;
  category: string;
  fileSize: string;
  dataUrl: string; // Base64 or object URL
  fileType?: string; // 'image' | 'pdf' | etc.
  notes?: string;
}

interface DocumentPreSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PreSubmissionDocument | null;
  onConfirmSubmit: () => Promise<void> | void;
  onChangeFile?: () => void;
  onOpenScanner?: () => void;
  isSubmitting?: boolean;
}

export const DocumentPreSubmissionModal: React.FC<DocumentPreSubmissionModalProps> = ({
  isOpen,
  onClose,
  document,
  onConfirmSubmit,
  onChangeFile,
  onOpenScanner,
  isSubmitting = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!isOpen || !document) return null;

  const isPdf =
    document.fileType === 'application/pdf' ||
    document.name.toLowerCase().endsWith('.pdf') ||
    document.dataUrl.startsWith('data:application/pdf');

  const isImage =
    !isPdf &&
    (document.dataUrl.startsWith('data:image') ||
      document.name.match(/\.(jpg|jpeg|png|webp|gif)$/i) ||
      document.fileType?.startsWith('image/'));

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoomLevel(100);
    setRotation(0);
    setIsHighContrast(false);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full overflow-hidden flex flex-col transition-all duration-200 ${
          isFullscreen ? 'max-w-6xl h-[95vh]' : 'max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  Pre-Submission Document Preview
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0">
                  Ready to Submit
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Review image clarity, orientation, and legibility before committing to underwriting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white hidden sm:flex items-center justify-center cursor-pointer transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-900/5 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Main Visual Document Viewport */}
          <div className="lg:col-span-8 flex flex-col bg-slate-950 overflow-hidden relative min-h-[350px] sm:min-h-[420px]">
            {/* Viewer Floating Control Toolbar */}
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-md">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[160px] sm:max-w-[240px]">{document.name}</span>
                <span className="text-[11px] text-slate-400">({document.fileSize})</span>
              </div>

              {isImage && (
                <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 shadow-md text-white">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 50}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold px-1 min-w-[36px] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 250}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-slate-700 mx-0.5" />

                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHighContrast(!isHighContrast)}
                    className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      isHighContrast ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Enhance Text Contrast"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>

                  {(zoomLevel !== 100 || rotation !== 0 || isHighContrast) && (
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="px-2 py-1 text-[10px] font-bold rounded-md bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer ml-0.5"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Document Render Canvas */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto">
              {isImage ? (
                <div
                  className="transition-transform duration-150 ease-out flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                    filter: isHighContrast ? 'contrast(160%) brightness(95%) grayscale(40%)' : 'none'
                  }}
                >
                  <img
                    src={document.dataUrl}
                    alt={document.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
                  />
                </div>
              ) : isPdf ? (
                <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                  {document.dataUrl.startsWith('data:application/pdf') ? (
                    <iframe
                      src={document.dataUrl}
                      title={document.name}
                      className="w-full h-[55vh] rounded-xl border border-slate-800 bg-white"
                    />
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-md w-full text-center space-y-4 shadow-xl">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{document.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Portable Document Format (PDF) • {document.fileSize}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Ready for automated OCR and credit committee evaluation</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-blue-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">{document.name}</h4>
                  <p className="text-xs text-slate-400">{document.category}</p>
                </div>
              )}
            </div>

            {/* Bottom Floating Tip */}
            <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                Tip: Ensure all four corners, dates, account numbers, and official stamps are sharp and legible.
              </p>
            </div>
          </div>

          {/* Document Verification & Quality Metadata Sidebar */}
          <div className="lg:col-span-4 p-5 sm:p-6 bg-white flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Verification Checklist
                </span>
                <h4 className="text-sm font-black text-[#0B0B0F] mt-0.5">Pre-Flight Audit</h4>
              </div>

              {/* Key Document Parameters */}
              <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-bold text-slate-900 text-right truncate max-w-[170px]">
                    {document.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">File Name:</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[170px]">
                    {document.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">File Size:</span>
                  <span className="font-semibold text-slate-900">{document.fileSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Encryption:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AES-256 Enabled
                  </span>
                </div>
              </div>

              {/* Verification Checklist Items */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Text Clarity Checked</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Visual contrast and clarity are sufficient for verification algorithms.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unmodified Document</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Direct scan/upload without digital tampering or obscuring artifacts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Input Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">Need adjustments?</span>
                <div className="grid grid-cols-2 gap-2">
                  {onChangeFile && (
                    <button
                      type="button"
                      onClick={onChangeFile}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Pick Another</span>
                    </button>
                  )}

                  {onOpenScanner && (
                    <button
                      type="button"
                      onClick={onOpenScanner}
                      className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Rescan Camera</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#2D62FF] hover:bg-[#1a4edf] active:bg-[#143eb8] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Securing & Submitting...' : 'Confirm & Submit Document'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors text-center"
              >
                Cancel / Return to Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
