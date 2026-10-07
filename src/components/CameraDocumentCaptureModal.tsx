import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCw,
  RefreshCw,
  Check,
  X,
  UploadCloud,
  AlertCircle,
  Sparkles,
  Sun,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Sliders,
  FileText,
  CreditCard,
  Building,
  Receipt,
  FileCheck2,
  ChevronDown
} from 'lucide-react';

export interface CapturedDocumentData {
  document_type: string;
  name: string;
  file_data: string; // base64 / data URL
  file_size: string;
  notes?: string;
}

interface CameraDocumentCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (data: CapturedDocumentData) => Promise<void> | void;
  initialDocumentType?: string;
  initialDocumentName?: string;
}

type FramingMode = 'id_card' | 'document_a4' | 'square_cac';
type ImageFilter = 'original' | 'document_sharp' | 'black_and_white';

export const CameraDocumentCaptureModal: React.FC<CameraDocumentCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureComplete,
  initialDocumentType = 'Government Issued ID (NIN/Passport)',
  initialDocumentName = ''
}) => {
  // Video & Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Framing & Filters
  const [framingMode, setFramingMode] = useState<FramingMode>('id_card');
  const [imageFilter, setImageFilter] = useState<ImageFilter>('document_sharp');
  const [rotation, setRotation] = useState<number>(0);

  // Capture State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Metadata Fields
  const [docType, setDocType] = useState<string>(initialDocumentType);
  const [docName, setDocName] = useState<string>(initialDocumentName);
  const [docNotes, setDocNotes] = useState<string>('');

  // Fallback Upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialDocumentType) {
      setDocType(initialDocumentType);
      if (initialDocumentType.includes('ID') || initialDocumentType.includes('Passport') || initialDocumentType.includes('NIN')) {
        setFramingMode('id_card');
      } else if (initialDocumentType.includes('CAC') || initialDocumentType.includes('Business')) {
        setFramingMode('square_cac');
      } else {
        setFramingMode('document_a4');
      }
    }
    if (initialDocumentName) {
      setDocName(initialDocumentName);
    } else {
      const cleanType = (initialDocumentType || 'Document').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const dateTag = new Date().toISOString().slice(0, 10);
      setDocName(`${cleanType}_${dateTag}.jpg`);
    }
  }, [initialDocumentType, initialDocumentName, isOpen]);

  // Clean stop tracks
  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Initialize Camera
  const startCamera = useCallback(async () => {
    stopTracks();
    setPermissionError(null);
    setHasPermission(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setPermissionError('Camera is not supported on this browser or environment. Please use file upload.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 }
            },
        audio: false
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to plain video true
        console.warn('Advanced constraints failed, falling back to basic video', err);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsStreaming(true);

      // Enumerate camera devices
      try {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devList.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);
      } catch (e) {
        console.warn('Could not enumerate devices', e);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission was denied. Please enable camera access in your browser settings or select a file instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera found on your device. You can upload a document photo directly.');
      } else {
        setPermissionError(err.message || 'Unable to access camera. Please use file upload.');
      }
    }
  }, [facingMode, selectedDeviceId, stopTracks]);

  // Lifecycle
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopTracks();
    }

    return () => {
      stopTracks();
    };
  }, [isOpen, capturedImage, startCamera, stopTracks]);

  // Toggle Front/Back Camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setSelectedDeviceId('');
  };

  // Capture frame to canvas
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Mirror image if using front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(rawDataUrl);
      setRotation(0);
      stopTracks();
    }
  };

  // Process & Apply Filters + Rotation on captured frame
  useEffect(() => {
    if (!capturedImage) {
      setProcessedImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isRotated90or270 = rotation % 180 !== 0;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      if (imageFilter !== 'original') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Grayscale luminance
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          if (imageFilter === 'black_and_white') {
            // High contrast binarization with threshold
            const val = gray > 120 ? 255 : 0;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          } else if (imageFilter === 'document_sharp') {
            // Adaptive contrast enhancement
            const contrast = 1.25;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            data[i] = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (b - 128) + 128));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      setProcessedImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = capturedImage;
  }, [capturedImage, rotation, imageFilter]);

  // Handle Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setRotation(0);
    startCamera();
  };

  // Handle Manual File Upload fallback
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      setDocName(file.name);
      stopTracks();
    };
    reader.readAsDataURL(file);
  };

  // Confirm and Submit
  const handleConfirmUpload = async () => {
    const finalData = processedImage || capturedImage;
    if (!finalData) return;

    setIsUploading(true);
    try {
      // Calculate estimated file size in MB
      const head = 'data:image/jpeg;base64,';
      const base64Len = finalData.length - head.length;
      const sizeInBytes = (base64Len * 3) / 4;
      const sizeInMb = (sizeInBytes / (1024 * 1024)).toFixed(2);
      const formattedSize = `${sizeInMb} MB`;

      await onCaptureComplete({
        document_type: docType,
        name: docName.trim() || `${docType}.jpg`,
        file_data: finalData,
        file_size: formattedSize,
        notes: docNotes.trim()
      });

      onClose();
    } catch (err) {
      console.error('Error submitting captured document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Smart Document Capture</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {capturedImage ? 'Review & enhance document scan' : 'Position document within guidelines'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* CAMERA LIVE PREVIEW */}
          {!capturedImage ? (
            <div className="space-y-3">
              {/* Framing Mode Selector */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">Frame Guide:</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFramingMode('id_card')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      framingMode === 'id_card'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>ID / Passport</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFramingMode('document_a4')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      framingMode === 'document_a4'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Bank Statement / Letter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFramingMode('square_cac')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      framingMode === 'square_cac'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>CAC / Certificate</span>
                  </button>
                </div>
              </div>

              {/* Viewport Box */}
              <div className="relative w-full bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center border border-slate-800 shadow-inner">
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Overlays / Guidelines */}
                {isStreaming && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    {/* Framing Box based on mode */}
                    <div
                      className={`relative border-2 border-dashed border-blue-400/90 rounded-2xl transition-all duration-300 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] ${
                        framingMode === 'id_card'
                          ? 'w-[90%] sm:w-[80%] aspect-[85/54]'
                          : framingMode === 'document_a4'
                          ? 'w-[75%] sm:w-[65%] aspect-[1/1.35]'
                          : 'w-[80%] aspect-square'
                      }`}
                    >
                      {/* Corner Optical Brackets */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-blue-400 rounded-tl-md" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-blue-400 rounded-tr-md" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-blue-400 rounded-bl-md" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-blue-400 rounded-br-md" />

                      {/* Animated Scanning Beam */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse shadow-[0_0_8px_#38bdf8]" />

                      {/* Helpful Hint Pill */}
                      <div className="absolute -bottom-9 inset-x-0 flex justify-center">
                        <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-medium backdrop-blur-sm border border-slate-700 shadow-md">
                          Align all 4 edges inside the frame
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Permission / Loading / Error State */}
                {permissionError && (
                  <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-10 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="text-sm font-bold text-white">Camera Access Restricted</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{permissionError}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-white/20"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Select File Instead</span>
                      </button>
                    </div>
                  </div>
                )}

                {hasPermission === null && !permissionError && (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-xs">Initializing camera feed...</span>
                  </div>
                )}
              </div>

              {/* Live Camera Controls */}
              {isStreaming && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    title="Switch between front and back camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
                  </button>

                  {/* Big Capture Trigger */}
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* REVIEW & ENHANCE CAPTURED PHOTO */
            <div className="space-y-4">
              {/* Image Preview Canvas */}
              <div className="relative w-full bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center border border-slate-200 shadow-xs">
                <img
                  src={processedImage || capturedImage}
                  alt="Captured Document Preview"
                  className="max-w-full max-h-full object-contain"
                />

                {/* Filter / Quality Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/10">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>
                    {imageFilter === 'original'
                      ? 'Original Color'
                      : imageFilter === 'document_sharp'
                      ? 'Enhanced Text Filter'
                      : 'B&W Scan Filter'}
                  </span>
                </div>
              </div>

              {/* Adjustment Toolbar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-xs">Enhance:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setImageFilter('document_sharp')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        imageFilter === 'document_sharp'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Sharp Scan
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageFilter('black_and_white')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        imageFilter === 'black_and_white'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      B&W Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageFilter('original')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        imageFilter === 'original'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>

              {/* Form Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Document Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="Government Issued ID (NIN/Passport)">Government Issued ID (NIN/Passport)</option>
                    <option value="6 Months Official Bank Statement">6 Months Official Bank Statement</option>
                    <option value="Utility Bill / Proof of Address">Utility Bill / Proof of Address</option>
                    <option value="CAC Certificate / Business Registration">CAC Certificate / Business Registration</option>
                    <option value="Salary Slip / Proof of Income">Salary Slip / Proof of Income</option>
                    <option value="Other Verification Document">Other Verification Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">File Name</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. NIN_Document_Captured.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input for Direct fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {capturedImage ? (
            <button
              type="button"
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isUploading ? 'Securing & Uploading...' : 'Confirm & Upload Document'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isStreaming}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Frame</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
