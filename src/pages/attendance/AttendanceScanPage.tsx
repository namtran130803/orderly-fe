import React, { useCallback, useEffect, useRef, useState } from "react";
import { Scan, Camera, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import jsQR from "jsqr";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { attendanceService } from "@/services/attendance.service";
import { useStoreStore } from "@/stores/store.store";

const SCAN_INTERVAL_MS = 220;
const BIND_RETRY_MS = 120;

type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => {
  detect: (
    source: HTMLVideoElement | ImageData,
  ) => Promise<{ rawValue: string }[]>;
};

function getBarcodeDetector(): BarcodeDetectorCtor | null {
  if (typeof globalThis === "undefined") return null;
  const B = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
    .BarcodeDetector;
  return B ?? null;
}

async function playVideoStream(video: HTMLVideoElement): Promise<void> {
  video.muted = true;
  video.playsInline = true;

  try {
    await video.play();
    return;
  } catch {
    /* iOS / một số Android cần chờ metadata */
  }

  await new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener("loadedmetadata", onReady);
      resolve();
    };
    const onReady = () => {
      void video.play().finally(done);
    };
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      onReady();
    } else {
      video.addEventListener("loadedmetadata", onReady, { once: true });
    }
  });
}

/** Nhân viên: quét QR — camera tự mở; gắn stream qua callback ref để tránh màn hình đen. */
type ScanSuccessType = "checkIn" | "checkOut" | null;

interface AttendanceRecord {
  id: number;
  checkIn: string | null;
  checkOut: string | null;
  workMinutes: number | null;
}

export const AttendanceScanPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const queryClient = useQueryClient();
  const [requesting, setRequesting] = useState(true);
  const [streamActive, setStreamActive] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [camHint, setCamHint] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<ScanSuccessType>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bindRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<InstanceType<BarcodeDetectorCtor> | null>(null);
  const lastPayload = useRef<string | null>(null);
  const isPendingRef = useRef(false);
  const startGenRef = useRef(0);
  const videoPlayingRef = useRef(false);

  const clearBindRetry = useCallback(() => {
    if (bindRetryRef.current) {
      clearTimeout(bindRetryRef.current);
      bindRetryRef.current = null;
    }
  }, []);

  const stopScanInterval = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  const releaseMedia = useCallback(() => {
    clearBindRetry();
    stopScanInterval();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
      video.onloadedmetadata = null;
    }
    detectorRef.current = null;
    setStreamActive(false);
    setVideoPlaying(false);
    videoPlayingRef.current = false;
  }, [clearBindRetry, stopScanInterval]);

  const { mutate, isPending } = useMutation({
    mutationFn: (qrToken: string) =>
      attendanceService.scan(storeId!, qrToken.trim()),
    onSuccess: (response: { data: { data: AttendanceRecord } }) => {
      const record: AttendanceRecord = response.data.data;

      // Ra ca khi API trả về checkOut; vào ca khi chỉ có checkIn
      const isCheckOut = record.checkOut != null;
      const successType: ScanSuccessType = isCheckOut ? "checkOut" : "checkIn";

      setScanSuccess(successType);
      toast.success(isCheckOut ? "Chấm công ra về thành công" : "Chấm công vào làm thành công");

      // Refresh danh sách chấm công
      queryClient.invalidateQueries({ queryKey: ['attendance-list'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['attendance-employee'], exact: false });

      // Stop camera on success
      releaseMedia();

      lastPayload.current = null;
    },
    onError: (e: unknown) => {
      const msg =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message === "string"
          ? (e as { response: { data: { error: { message: string } } } })
              .response.data.error.message
          : undefined;
      if (msg) toast.error(msg);
    },
  });

  isPendingRef.current = isPending;

  const tryDecodeFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (isPendingRef.current) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w < 16 || h < 16) return;

    try {
      const Detector = getBarcodeDetector();
      if (Detector && !detectorRef.current) {
        detectorRef.current = new Detector({ formats: ["qr_code"] });
      }
      const detector = detectorRef.current;

      if (detector) {
        void detector.detect(video).then((codes) => {
          if (codes.length > 0 && codes[0].rawValue) {
            const raw = codes[0].rawValue.trim();
            if (raw && raw !== lastPayload.current) {
              lastPayload.current = raw;
              mutate(raw);
            }
          }
        });
        return;
      }

      if (!canvasRef.current)
        canvasRef.current = document.createElement("canvas");
      const canvas = canvasRef.current;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const result = jsQR(imageData.data, w, h, {
        inversionAttempts: "attemptBoth",
      });
      if (result?.data) {
        const raw = result.data.trim();
        if (raw && raw !== lastPayload.current) {
          lastPayload.current = raw;
          mutate(raw);
        }
      }
    } catch {
      /* bỏ qua khung lỗi */
    }
  }, [mutate]);

  const tryDecodeRef = useRef(tryDecodeFrame);
  tryDecodeRef.current = tryDecodeFrame;

  const bindStreamToVideo = useCallback(
    async (video: HTMLVideoElement, gen: number) => {
      const stream = streamRef.current;
      if (!stream || gen !== startGenRef.current) return;

      try {
        video.srcObject = stream;
        await playVideoStream(video);
        if (gen !== startGenRef.current) return;
        setVideoPlaying(true);
        videoPlayingRef.current = true;
        setCamHint("Đưa mã QR vào khung hình để chấm công.");
      } catch {
        if (gen !== startGenRef.current) return;
        setVideoPlaying(false);
        setCamHint("Không phát được hình camera — Thử lại.");
      }
    },
    [],
  );

  const scheduleBind = useCallback(
    (video: HTMLVideoElement | null) => {
      clearBindRetry();
      if (!video || !streamRef.current) return;

      const gen = startGenRef.current;
      void bindStreamToVideo(video, gen);

      bindRetryRef.current = setTimeout(() => {
        if (!videoRef.current || !streamRef.current || videoPlayingRef.current)
          return;
        void bindStreamToVideo(videoRef.current, gen);
      }, BIND_RETRY_MS);
    },
    [bindStreamToVideo, clearBindRetry],
  );

  const onVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && streamRef.current) {
        scheduleBind(node);
      }
    },
    [scheduleBind],
  );

  const startCamera = useCallback(async () => {
    const gen = ++startGenRef.current;
    setRequesting(true);
    setCamHint(null);
    setVideoPlaying(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamHint("Trình duyệt không hỗ trợ camera.");
      toast.error("Không hỗ trợ camera");
      setRequesting(false);
      return;
    }

    releaseMedia();
    startGenRef.current = gen;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (gen !== startGenRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      setStreamActive(true);

      const video = videoRef.current;
      if (video) {
        scheduleBind(video);
      }
    } catch (e) {
      if (gen !== startGenRef.current) return;
      setStreamActive(false);
      if (e instanceof DOMException) {
        if (e.name === "NotAllowedError" || e.name === "SecurityError") {
          setCamHint("Khóa thanh địa chỉ → Cho phép camera → Thử lại.");
          toast.error("Cần quyền camera để quét QR");
          setRequesting(false);
          return;
        }
        if (e.name === "NotFoundError") {
          setCamHint("Không có camera.");
          toast.error("Không có camera");
          setRequesting(false);
          return;
        }
      }
      setCamHint("Lỗi camera — Thử lại.");
      toast.error("Không mở được camera");
    } finally {
      if (gen === startGenRef.current) {
        setRequesting(false);
      }
    }
  }, [releaseMedia, scheduleBind]);

  useEffect(() => {
    if (!videoPlaying) {
      stopScanInterval();
      return;
    }
    scanTimerRef.current = setInterval(() => {
      void tryDecodeRef.current();
    }, SCAN_INTERVAL_MS);
    return stopScanInterval;
  }, [videoPlaying, stopScanInterval]);

  useEffect(() => {
    if (!storeId) return;
    void startCamera();
  }, [storeId, startCamera]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!streamRef.current || !videoPlaying) {
        void startCamera();
      }
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void startCamera();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [startCamera, videoPlaying]);

  useEffect(() => {
    return () => {
      startGenRef.current += 1;
      releaseMedia();
    };
  }, [releaseMedia]);

  const handleResetScan = useCallback(() => {
    setScanSuccess(null);
    void startCamera();
  }, [startCamera]);

  if (!storeId) return null;

  const showRetry = !requesting && !streamActive && !scanSuccess;
  const showVideo = streamActive && !scanSuccess;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && !scanSuccess && <LoadingOverlay />}
      <Header
        title="Quét QR chấm công"
        Icon={Scan}
        backUrl={paths.settings.index}
      />

      <div className="flex-1 flex flex-col items-center px-4 pb-6 gap-5 justify-center">
        <div className="relative w-full max-w-[300px] aspect-square bg-black overflow-hidden border border-(--color-border-main)">
          {/* Dim overlay around scan area */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-[10%] left-[10%] size-10 border-t-[3px] border-l-[3px] border-(--color-primary)" />
            <div className="absolute top-[10%] right-[10%] size-10 border-t-[3px] border-r-[3px] border-(--color-primary)" />
            <div className="absolute bottom-[10%] left-[10%] size-10 border-b-[3px] border-l-[3px] border-(--color-primary)" />
            <div className="absolute bottom-[10%] right-[10%] size-10 border-b-[3px] border-r-[3px] border-(--color-primary)" />
          </div>

          <video
            ref={onVideoRef}
            className={`absolute inset-0 size-full object-cover ${showVideo ? "opacity-100" : "opacity-0"}`}
            playsInline
            muted
            autoPlay
          />

          {requesting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-(--color-bg-surface) px-4 text-center z-20">
              <Camera size={40} className="text-(--color-text-muted)" />
              <p className="text-sm text-(--color-text-secondary)">
                Đang mở camera…
              </p>
              <p className="text-xs text-(--color-text-muted)">
                Trình duyệt có thể hỏi quyền camera.
              </p>
            </div>
          )}

          {showVideo && !videoPlaying && !requesting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 z-20">
              <p className="text-xs text-(--color-text-muted) text-center">
                Đang khởi động hình…
              </p>
            </div>
          )}

          {/* Success Overlay - full size, không bo góc */}
          {scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-600 z-30">
              <CheckCircle2 size={80} className="text-white mb-4" />
              <p className="text-xl font-bold text-white">
                {scanSuccess === "checkIn" ? "Chấm công vào làm" : "Chấm công ra về"}
              </p>
              <p className="text-sm text-white/80 mt-2">
                {scanSuccess === "checkIn" ? "Thành công" : "Hẹn gặp lại"}
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <p className="text-sm font-semibold text-(--color-text-main)">
              {scanSuccess ? "Chấm công thành công" : "Quét mã QR chấm công"}
            </p>
          </div>
          {scanSuccess ? (
            <p className="text-xs text-(--color-text-secondary) leading-relaxed max-w-[260px] mx-auto">
              {scanSuccess === "checkIn"
                ? "Chúc bạn một ngày làm việc hiệu quả!"
                : "Hẹn gặp lại bạn!"}
            </p>
          ) : camHint ? (
            <p className="text-xs text-(--color-text-secondary) leading-relaxed max-w-[260px] mx-auto">
              {camHint}
            </p>
          ) : (
            <p className="text-xs text-(--color-text-muted) leading-relaxed max-w-[260px] mx-auto">
              Đưa mã QR vào khung hình để chấm công.
            </p>
          )}
        </div>

        {showRetry && (
          <button
            type="button"
            onClick={() => void startCamera()}
            className="w-full max-w-[300px] py-3 text-sm font-semibold bg-(--color-bg-surface) border-y border-(--color-border-main) text-(--color-primary)"
          >
            Thử lại
          </button>
        )}

        {isPending && !scanSuccess && (
          <div className="flex items-center gap-2 text-(--color-success)">
            <div className="size-2 bg-(--color-success) animate-ping" />
            <span className="text-sm font-semibold">
              Đã nhận diện, đang chấm công…
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
