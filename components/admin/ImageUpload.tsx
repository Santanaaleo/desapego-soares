"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1800;
const MAX_IMAGE_HEIGHT = 1800;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

type Props = {
  images: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  onUploadingChange?: (uploading: boolean) => void;
};

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    image.src = url;
  });
}

function loadImageUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        resolve(image);
        return;
      }

      reject(new Error("A imagem enviada não possui dimensões válidas."));
    };
    image.onerror = () => reject(new Error("A URL pública da imagem não pôde ser carregada."));
    image.src = url;
  });
}

function getFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

function getUploadType(file: File) {
  const extension = getFileExtension(file);

  if (file.type) {
    return file.type.toLowerCase();
  }

  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";

  return "";
}

function validateImage(file: File) {
  const extension = getFileExtension(file);
  const type = getUploadType(file);

  if (!SUPPORTED_IMAGE_TYPES.includes(type) || !SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
    throw new Error("Formato não suportado. Envie imagens jpg, jpeg, png, webp, heic ou heif.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Imagem muito grande. Envie imagens com até 8 MB.");
  }
}

function isMobileUploadDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobileUserAgent = /android|iphone|ipad|ipod|mobile/.test(userAgent);
  const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(hover: hover)").matches;

  return isMobileUserAgent || isTouchOnly;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.82) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Não foi possível processar a imagem."));
    }, type, quality);
  });
}

async function resizeImage(file: File) {
  const type = getUploadType(file);
  const mustConvert = type === "image/heic" || type === "image/heif";
  const image = await loadImage(file);

  if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new Error("A imagem enviada não possui dimensões válidas.");
  }

  const scale = Math.min(1, MAX_IMAGE_WIDTH / image.naturalWidth, MAX_IMAGE_HEIGHT / image.naturalHeight);

  if (!mustConvert && scale === 1 && file.size <= 2 * 1024 * 1024) {
    return file;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Não foi possível processar a imagem neste navegador.");
  }

  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const outputType = type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await canvasToBlob(canvas, outputType, 0.82);

  if (!mustConvert && blob.size >= file.size) {
    return file;
  }

  const extension = outputType === "image/png" ? "png" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagem";
  return new File([blob], `${baseName}.${extension}`, { type: outputType, lastModified: file.lastModified });
}

async function trimTransparentPng(file: File) {
  if (file.type !== "image/png") {
    return file;
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return file;
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);

  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let top = height;
  let right = 0;
  let bottom = 0;
  let left = width;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 0) {
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
        left = Math.min(left, x);
      }
    }
  }

  if (left > right || top > bottom) {
    return file;
  }

  const trimmedWidth = right - left + 1;
  const trimmedHeight = bottom - top + 1;

  if (trimmedWidth === width && trimmedHeight === height) {
    return file;
  }

  const trimmedCanvas = document.createElement("canvas");
  const trimmedContext = trimmedCanvas.getContext("2d");

  if (!trimmedContext) {
    return file;
  }

  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  trimmedContext.drawImage(canvas, left, top, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);

  const blob = await canvasToBlob(trimmedCanvas, "image/png");
  return new File([blob], file.name, { type: "image/png", lastModified: file.lastModified });
}

export function ImageUpload({ images, onChange, onUploadingChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    onUploadingChange?.(true);
    setError("");

    try {
      const selectedFiles = Array.from(files);

      if (isMobileUploadDevice() && selectedFiles.length > 1) {
        throw new Error("No celular, envie uma imagem por vez para evitar falhas.");
      }

      const urls: string[] = [];

      for (const file of selectedFiles) {
        validateImage(file);
        const resizedFile = await resizeImage(file);
        const uploadFile = await trimTransparentPng(resizedFile);
        const formData = new FormData();
        formData.append("file", uploadFile);

        const response = await fetch("/api/admin/product-images", {
          method: "POST",
          body: formData
        }).catch(() => {
          throw new Error("Falha de conexão. Verifique a internet e tente novamente.");
        });
        const data = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;

        if (!response.ok || !data?.url) {
          throw new Error(data?.message || "Erro ao salvar no storage.");
        }

        await loadImageUrl(data.url);
        urls.push(data.url);
      }

      onChange((current) => [...current, ...urls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeImage(imageToRemove: string) {
    onChange((current) => current.filter((image) => image !== imageToRemove));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-3">
      <label className="focus-within:outline-brand grid cursor-pointer gap-3 rounded-md border border-dashed border-neutral-300 p-5 text-center">
        <Upload className="mx-auto text-brand" size={24} />
        <span className="text-sm font-semibold text-neutral-800">
          {uploading ? "Enviando imagem..." : images.length ? "Trocar ou adicionar imagem" : "Enviar imagens do produto"}
        </span>
        <span className="text-xs text-neutral-500">As imagens serão salvas no Supabase Storage.</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          multiple={typeof window === "undefined" ? true : !isMobileUploadDevice()}
          disabled={uploading}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>
      {error ? <p className="text-sm font-normal text-red-600">{error}</p> : null}

      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image} className="grid gap-2 rounded-md border border-neutral-200 bg-white p-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-brand-mist">
                <Image
                  src={image}
                  alt="Preview do produto"
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized={image.startsWith("data:")}
                />
              </div>
              <Button type="button" variant="secondary" className="h-9 gap-2" onClick={() => removeImage(image)} disabled={uploading}>
                <X size={15} />
                Remover imagem
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
