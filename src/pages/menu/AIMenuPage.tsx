import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CirclePlus, ImagePlus, Sparkles, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { aiService } from "@/services/ai.service";
import { useStoreStore } from "@/stores/store.store";
import { navigateBackOrTo } from "@/lib/browser-history";

export const AIMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const storeId = useStoreStore((s) => s.store?.id);
  const queryClient = useQueryClient();

  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"replace" | "append">("append");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: analyze, isPending: isAnalyzing } = useMutation({
    mutationFn: () => aiService.analyzeMenu(storeId!, { image: image! }),
    onSuccess: (res) => {
      setDescription(res.data.data.description);
      toast.success("Phân tích menu thành công");
    },
  });

  const { mutate: generate, isPending: isGenerating } = useMutation({
    mutationFn: () =>
      aiService.generateMenu(storeId!, { description, mode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", storeId] });
      queryClient.invalidateQueries({ queryKey: ["menu-items", storeId] });
      toast.success("Tạo thực đơn thành công");
      navigateBackOrTo(navigate, paths.menu.index);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isPending = isAnalyzing || isGenerating;

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header title="AI Thực đơn" Icon={Sparkles} backUrl={paths.menu.index}>
        <button
          type="submit"
          form="ai-menu-form"
          disabled={!description.trim() || isGenerating}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CirclePlus size={24} />
        </button>
      </Header>

      <form
        id="ai-menu-form"
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
        className="flex-1 relative"
      >
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto py-4">
            {/* Image picker */}
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) p-4">
              {!image ? (
                <>
                  <p className="text-(--color-text-secondary) text-sm mb-3">
                    Chụp hoặc tải ảnh thực đơn để AI phân tích
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 py-4 border border-(--color-border-main)"
                    >
                      <Camera size={28} />
                      <span className="text-sm font-medium">Chụp ảnh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 py-4 border border-(--color-border-main)"
                    >
                      <ImagePlus size={28} />
                      <span className="text-sm font-medium">Tải ảnh lên</span>
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <img
                    src={image}
                    alt="Thực đơn"
                    className="w-full object-contain max-h-64"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        if (cameraInputRef.current) cameraInputRef.current.value = "";
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="flex items-center justify-center gap-1 flex-1 py-2 border border-(--color-border-main)"
                    >
                      <Trash2 size={16} />
                      <span>Xóa ảnh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => analyze()}
                      disabled={isAnalyzing}
                      className="flex-1 py-2 bg-(--color-primary) text-white disabled:opacity-50"
                    >
                      {isAnalyzing ? "Đang phân tích..." : "Phân tích ảnh"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) mt-4">
              <div className="px-4 pt-3 pb-1">
                <label className="text-sm font-medium text-(--color-text-main)">
                  Mô tả
                </label>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả thực đơn hoặc dùng ảnh để AI phân tích..."
                rows={10}
                className="w-full px-4 pb-3 resize-none outline-none text-(--color-text-main)"
              />
            </div>

            {/* Mode selector */}
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) mt-4">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="font-medium text-(--color-text-main)">
                  Chế độ
                </span>
                <div className="flex border border-(--color-border-main)">
                  <button
                    type="button"
                    onClick={() => setMode("replace")}
                    className={`px-4 py-2 text-sm ${
                      mode === "replace"
                        ? "bg-(--color-primary) text-white"
                        : "text-(--color-text-secondary)"
                    }`}
                  >
                    Thay thế
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("append")}
                    className={`px-4 py-2 text-sm ${
                      mode === "append"
                        ? "bg-(--color-primary) text-white"
                        : "text-(--color-text-secondary)"
                    }`}
                  >
                    Thêm vào
                  </button>
                </div>
              </div>
              <div className="px-4 pb-3">
                <p className="text-xs text-(--color-text-secondary)">
                  {mode === "replace"
                    ? "Xóa toàn bộ thực đơn hiện tại và tạo mới"
                    : "Thêm các món mới vào thực đơn hiện tại"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
