"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
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

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Não foi possível processar a imagem."));
    }, "image/png");
  });
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

  const blob = await canvasToBlob(trimmedCanvas);
  return new File([blob], file.name, { type: "image/png", lastModified: file.lastModified });
}

export function ImageUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const urls = await Promise.all(
        Array.from(files).map(async (file) => {
          const uploadFile = await trimTransparentPng(file);
          const formData = new FormData();
          formData.append("file", uploadFile);

          const response = await fetch("/api/admin/product-images", {
            method: "POST",
            body: formData
          });
          const data = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;

          if (!response.ok || !data?.url) {
            throw new Error(data?.message || "Não foi possível enviar a imagem.");
          }

          return data.url;
        })
      );

      onChange([...images, ...urls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeImage(imageToRemove: string) {
    onChange(images.filter((image) => image !== imageToRemove));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-3">
      <label className="focus-within:outline-brand grid cursor-pointer gap-3 rounded-md border border-dashed border-neutral-300 p-5 text-center">
        <Upload className="mx-auto text-brand" size={24} />
        <span className="text-sm font-bold text-neutral-800">
          {uploading ? "Enviando imagem..." : images.length ? "Trocar ou adicionar imagem" : "Enviar imagens do produto"}
        </span>
        <span className="text-xs text-neutral-500">As imagens serão salvas no Supabase Storage.</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}

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
              <Button type="button" variant="secondary" className="h-9 gap-2" onClick={() => removeImage(image)}>
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
