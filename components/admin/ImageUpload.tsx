"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    onChange([...images, ...urls]);

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
          {images.length ? "Trocar ou adicionar imagem" : "Enviar imagens do produto"}
        </span>
        <span className="text-xs text-neutral-500">
          Mock funcional em Data URL. Quando o Supabase estiver configurado, o mesmo campo fica preparado para Storage.
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>

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
